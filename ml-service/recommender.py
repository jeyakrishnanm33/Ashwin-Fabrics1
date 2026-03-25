# ml-service/recommender.py
"""
FashionFlow ML Recommendation Engine
Hybrid: ALS Collaborative Filtering (implicit library) + Content-Based (scikit-learn)

WHY implicit instead of scikit-surprise:
  - scikit-surprise requires Microsoft C++ Build Tools on Windows (compile step)
  - implicit ships pre-built wheels for Windows/Mac/Linux — no compiler needed
  - implicit's ALS is actually better for implicit feedback (views, clicks, purchases)

Training data: Firebase Firestore userInteractions collection
Interaction weights: view=1, wishlist=2, add_to_cart=3, purchase=5
"""
import numpy as np
import pickle
import os
import asyncio
from collections import defaultdict
import firebase_admin
from firebase_admin import credentials, firestore
import scipy.sparse as sp

try:
    import implicit
    IMPLICIT_AVAILABLE = True
except ImportError:
    IMPLICIT_AVAILABLE = False
    print("Warning: implicit library not found. Using popularity-based fallback.")


class FashionRecommender:
    MODEL_PATH = "./model/als_model.pkl"

    def __init__(self):
        self.model_loaded = False
        self.als_model = None
        self.product_ids = []          # list: index → product_id
        self.user_ids = []             # list: index → user_id
        self.product_index = {}        # product_id → index
        self.user_index = {}           # user_id → index
        self.user_product_matrix = defaultdict(dict)   # uid → {pid: weight}
        self.product_features = {}     # pid → feature dict (content-based)
        self.popular_products = []     # fallback: [(pid, score)]
        self._init_firebase()

    # ── Firebase ──────────────────────────────────────────────────────────────

    def _init_firebase(self):
        try:
            if not firebase_admin._apps:
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print("Firebase connected.")
        except Exception as e:
            print(f"Firebase init skipped: {e}")
            self.db = None

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def load_or_train(self):
        os.makedirs("./model", exist_ok=True)
        if os.path.exists(self.MODEL_PATH):
            try:
                with open(self.MODEL_PATH, "rb") as f:
                    saved = pickle.load(f)
                self.als_model = saved.get("als_model")
                self.product_ids = saved.get("product_ids", [])
                self.user_ids = saved.get("user_ids", [])
                self.product_index = {pid: i for i, pid in enumerate(self.product_ids)}
                self.user_index = {uid: i for i, uid in enumerate(self.user_ids)}
                self.user_product_matrix = saved.get("matrix", defaultdict(dict))
                self.product_features = saved.get("product_features", {})
                self.popular_products = saved.get("popular", [])
                self.model_loaded = True
                print(f"Model loaded — {len(self.product_ids)} products, {len(self.user_ids)} users.")
                return
            except Exception as e:
                print(f"Could not load saved model: {e}")

        await self.train()

    async def train(self):
        print("Starting model training...")
        await asyncio.to_thread(self._fetch_and_train)

    # ── Training ──────────────────────────────────────────────────────────────

    def _fetch_and_train(self):
        try:
            interactions = self._fetch_interactions()
            self._fetch_product_features()
            self._build_popularity(interactions)

            if len(interactions) >= 10 and IMPLICIT_AVAILABLE:
                self._train_als(interactions)
            else:
                print(f"Using popularity fallback (interactions={len(interactions)}, implicit={IMPLICIT_AVAILABLE})")
                self.model_loaded = True
                self._save()
        except Exception as e:
            print(f"Training error: {e}")
            self.model_loaded = True

    def _fetch_interactions(self):
        """Returns list of (user_id, product_id, weight) tuples."""
        interactions = []
        if not self.db:
            return interactions

        docs = self.db.collection("userInteractions").stream()
        for doc in docs:
            data = doc.to_dict()
            uid = doc.id
            for pid in data.get("purchasedProducts", []):
                interactions.append((uid, pid, 5.0))
            for pid in data.get("wishlistedProducts", []):
                interactions.append((uid, pid, 2.0))
            for pid in data.get("viewedProducts", []):
                interactions.append((uid, pid, 1.0))

        print(f"Fetched {len(interactions)} interactions.")
        return interactions

    def _fetch_product_features(self):
        if not self.db:
            return
        products = self.db.collection("products").where("isActive", "==", True).stream()
        for p in products:
            data = p.to_dict()
            self.product_features[p.id] = {
                "category": data.get("category", ""),
                "subCategory": data.get("subCategory", ""),
                "tags": data.get("tags", []),
                "price_tier": self._price_tier(data.get("discountPrice", 0)),
            }
            if p.id not in self.product_index:
                self.product_index[p.id] = len(self.product_ids)
                self.product_ids.append(p.id)
        print(f"Loaded {len(self.product_ids)} products.")

    def _build_popularity(self, interactions):
        scores = defaultdict(float)
        for uid, pid, w in interactions:
            scores[pid] += w
            self.user_product_matrix[uid][pid] = max(
                self.user_product_matrix[uid].get(pid, 0), w
            )
        self.popular_products = sorted(scores.items(), key=lambda x: -x[1])

    def _train_als(self, interactions):
        """Build sparse user-item matrix and train ALS model."""
        # Build index maps
        all_users = list({uid for uid, _, _ in interactions})
        all_items = list({pid for _, pid, _ in interactions})
        self.user_ids = all_users
        self.user_index = {uid: i for i, uid in enumerate(all_users)}
        # Merge with product_ids (may have more from Firestore fetch)
        for pid in all_items:
            if pid not in self.product_index:
                self.product_index[pid] = len(self.product_ids)
                self.product_ids.append(pid)

        rows, cols, data = [], [], []
        for uid, pid, w in interactions:
            rows.append(self.user_index[uid])
            cols.append(self.product_index[pid])
            data.append(w)

        n_users = len(self.user_ids)
        n_items = len(self.product_ids)
        user_item = sp.csr_matrix((data, (rows, cols)), shape=(n_users, n_items), dtype=np.float32)

        # ALS — pure Python wheels, no C++ needed on Windows
        self.als_model = implicit.als.AlternatingLeastSquares(
            factors=64, iterations=20, regularization=0.1, use_gpu=False
        )
        self.als_model.fit(user_item)
        self._user_item_sparse = user_item
        self.model_loaded = True
        self._save()
        print("ALS model trained successfully!")

    def _save(self):
        with open(self.MODEL_PATH, "wb") as f:
            pickle.dump({
                "als_model": self.als_model,
                "product_ids": self.product_ids,
                "user_ids": self.user_ids,
                "matrix": dict(self.user_product_matrix),
                "product_features": self.product_features,
                "popular": self.popular_products,
            }, f)

    # ── Inference ─────────────────────────────────────────────────────────────

    async def get_user_recommendations(self, user_id: str, limit: int = 10):
        """Personalized recs for a user. Falls back to popularity for new users."""
        seen = set(self.user_product_matrix.get(user_id, {}).keys())

        if self.als_model and user_id in self.user_index:
            uid_idx = self.user_index[user_id]
            try:
                # implicit returns (item_indices, scores)
                item_indices, _ = self.als_model.recommend(
                    uid_idx,
                    self._user_item_sparse[uid_idx],
                    N=limit + len(seen),
                    filter_already_liked_items=True,
                )
                recs = [self.product_ids[i] for i in item_indices if self.product_ids[i] not in seen]
                return recs[:limit]
            except Exception as e:
                print(f"ALS recommend error: {e}")

        # Popularity fallback (new/unknown user)
        return [pid for pid, _ in self.popular_products if pid not in seen][:limit]

    async def get_similar_products(self, product_id: str, limit: int = 6):
        """Content-based similarity using product features."""
        if product_id not in self.product_features:
            return [p for p in self.product_ids if p != product_id][:limit]

        base = self.product_features[product_id]
        scores = [
            (pid, self._content_similarity(base, feats))
            for pid, feats in self.product_features.items()
            if pid != product_id
        ]
        scores.sort(key=lambda x: -x[1])
        return [pid for pid, _ in scores[:limit]]

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _content_similarity(self, a, b):
        score = 0.0
        if a["category"] == b["category"]:     score += 3.0
        if a["subCategory"] == b["subCategory"]: score += 2.0
        if a["price_tier"] == b["price_tier"]:  score += 1.0
        score += len(set(a.get("tags", [])) & set(b.get("tags", []))) * 0.5
        return score

    def _price_tier(self, price):
        if price < 500:  return "budget"
        if price < 1500: return "mid"
        if price < 3000: return "premium"
        return "luxury"
