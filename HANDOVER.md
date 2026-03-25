# 🧵 FashionFlow — E-Commerce Clothing Platform
## Project Handover Document (Pass this to any new Claude session)

---

## 📌 Project Summary

A full-stack MERN e-commerce platform for a clothing brand, similar to TheSouledStore / Pantaloons. Supports:
- Regular product purchases (Men / Women / Kids collections)
- **Bulk order system** (select design, fabric, quantity, customization)
- **ML-based clothing recommendation** (based on previous orders & browsing)
- Admin panel for product/order management
- Firebase (replaces MongoDB) for database + auth

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage (product images) |
| ML Recommendation | Python FastAPI microservice (collaborative filtering) |
| State Management | Zustand |
| Payments | Razorpay (India) / Stripe (International) |
| Hosting (recommended) | Vercel (frontend) + Render (backend) + Railway (ML API) |

---

## 📁 Folder Structure

```
fashion-ecom/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Footer, ProductCard, etc.
│   │   │   ├── admin/           # Admin-specific components
│   │   │   └── user/            # User-specific components
│   │   ├── pages/
│   │   │   ├── admin/           # Dashboard, Products, Orders, Users
│   │   │   └── user/            # Home, Shop, ProductDetail, Cart, Checkout
│   │   ├── context/             # AuthContext, CartContext
│   │   ├── hooks/               # Custom hooks
│   │   ├── utils/               # firebase.js, api.js, helpers
│   │   └── ml/                  # ML recommendation integration
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── routes/              # products, orders, users, bulk, recommendations
│   │   ├── controllers/         # Business logic per route
│   │   ├── middleware/          # auth, validation, errorHandler
│   │   ├── services/            # firebase-admin, payment, email
│   │   └── ml/                  # ML service connector
│   ├── package.json
│   └── server.js
│
├── ml-service/                  # Python FastAPI ML microservice
│   ├── main.py                  # FastAPI app
│   ├── recommender.py           # Collaborative filtering model
│   ├── train.py                 # Model training script
│   ├── requirements.txt
│   └── model/                   # Saved model files
│
├── HANDOVER.md                  # This file
└── README.md
```

---

## 🔐 Firebase Setup (REQUIRED FIRST STEP)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Create project: `fashionflow-prod`
- Enable: Authentication, Firestore, Storage

### 2. Enable Auth Providers
- Email/Password ✅
- Google OAuth ✅
- Phone (optional)

### 3. Firestore Collections Schema

```
/users/{userId}
  - uid: string
  - name: string
  - email: string
  - phone: string
  - role: "user" | "admin"
  - addresses: array
  - createdAt: timestamp
  - preferences: { sizes, categories, colors }

/products/{productId}
  - name: string
  - description: string
  - category: "men" | "women" | "kids" | "unisex"
  - subCategory: "tshirt" | "shirt" | "jeans" | "dress" | etc.
  - price: number
  - discountPrice: number
  - images: string[]  (Firebase Storage URLs)
  - sizes: ["XS","S","M","L","XL","XXL"]
  - colors: [{ name, hex, images }]
  - fabrics: string[]
  - stock: { [size]: number }
  - tags: string[]
  - ratings: { average, count }
  - isFeatured: boolean
  - isActive: boolean
  - createdAt: timestamp

/orders/{orderId}
  - userId: string
  - orderType: "regular" | "bulk"
  - items: [{ productId, name, size, color, quantity, price }]
  - totalAmount: number
  - status: "pending"|"confirmed"|"shipped"|"delivered"|"cancelled"
  - paymentStatus: "pending"|"paid"|"failed"|"refunded"
  - paymentId: string
  - shippingAddress: object
  - createdAt: timestamp

/bulkOrders/{orderId}
  - userId: string
  - companyName: string
  - contactPerson: string
  - items: [{
      productId: string,
      designId: string,       # Custom design or existing
      fabric: string,          # "cotton"|"polyester"|"blend" etc.
      color: string,
      sizes: { XS, S, M, L, XL, XXL }  # quantities per size
      printType: "screen"|"digital"|"embroidery"
      customText: string
    }]
  - totalQuantity: number
  - quotedPrice: number
  - status: "inquiry"|"quoted"|"approved"|"inProduction"|"shipped"|"delivered"
  - adminNotes: string
  - deliveryDate: timestamp
  - createdAt: timestamp

/reviews/{reviewId}
  - userId: string
  - productId: string
  - rating: number (1-5)
  - title: string
  - body: string
  - images: string[]
  - verified: boolean
  - createdAt: timestamp

/cart/{userId}
  - items: [{ productId, size, color, quantity }]
  - updatedAt: timestamp

/wishlist/{userId}
  - productIds: string[]

/userInteractions/{userId}
  - viewedProducts: string[]
  - searchHistory: string[]
  - categoryClicks: { [category]: number }
  - updatedAt: timestamp
```

### 4. Firebase Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /reviews/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🖥️ Frontend — Key Pages

### User Side
| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero banner, featured products, categories, recommendations |
| `/shop` | Shop | Filter/sort by category, price, size, color, fabric |
| `/product/:id` | ProductDetail | Images, size chart, add to cart, reviews, ML recommendations |
| `/cart` | Cart | Items, quantities, promo codes |
| `/checkout` | Checkout | Address, payment integration |
| `/orders` | My Orders | Order history, track order |
| `/bulk-order` | Bulk Order | Multi-step form: design → fabric → quantity → contact |
| `/profile` | Profile | Personal info, addresses, preferences |
| `/wishlist` | Wishlist | Saved products |

### Admin Side
| Route | Page |
|---|---|
| `/admin` | Dashboard (revenue, orders, stats) |
| `/admin/products` | Product CRUD |
| `/admin/orders` | Order management |
| `/admin/bulk-orders` | Bulk order requests + quoting |
| `/admin/users` | User management |
| `/admin/analytics` | Sales analytics |

---

## 🤖 ML Recommendation System

### Architecture
```
User visits product → Backend logs interaction → 
Periodic batch training (or real-time) → 
FastAPI returns recommendations → 
Frontend displays "You might also like"
```

### Algorithm: Collaborative Filtering + Content-Based Hybrid
- **Collaborative**: Users who bought X also bought Y
- **Content-Based**: Products similar to what user viewed (category, fabric, color tags)
- **Cold Start**: Show trending + category-based for new users

### ML Service Endpoints
```
GET  /recommend/user/{userId}?limit=10     # Personalized recs
GET  /recommend/product/{productId}?limit=6 # Similar products
POST /train                                 # Retrain model (admin only)
```

### Data Pipeline
```python
# userInteractions collection feeds the model
# Features: userId, productId, action (view=1, wishlist=2, purchase=5)
# Model: SVD (Surprise library) or implicit ALS
```

---

## 🛍️ Bulk Order Flow

```
Step 1: Select Category & Base Products
  → Choose product type, reference design or upload custom design

Step 2: Customize
  → Fabric: Cotton / Polyester / Cotton-Poly Blend / Linen
  → Colors (up to 3 per order)
  → Print type: Screen / Digital / Embroidery
  → Add custom text / logo upload

Step 3: Quantities
  → Table: Size × Color × Quantity (min 50 pieces per SKU)
  → Auto-calculates total

Step 4: Contact & Submit
  → Company details, delivery date requirement
  → Admin gets notified → quotes within 24hrs

Step 5: Admin Quotes → User Approves → Payment → Production
```

---

## 💳 Payment Integration

### Razorpay (Primary - India)
```javascript
// backend/src/services/payment.js
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

### Flow
1. Create order on backend → get `order_id`
2. Frontend opens Razorpay modal
3. On success → verify signature on backend → update Firestore
4. Send confirmation email

---

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
FIREBASE_PROJECT_ID=fashionflow-prod
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_STORAGE_BUCKET=fashionflow-prod.appspot.com
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=fashionflow-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fashionflow-prod
VITE_FIREBASE_STORAGE_BUCKET=fashionflow-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:5000/api
VITE_ML_URL=http://localhost:8000
```

### ML Service (.env)
```
FIREBASE_PROJECT_ID=fashionflow-prod
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
PORT=8000
```

---

## 📦 Installation & Running

```bash
# 1. Clone / unzip project
# 2. Install all dependencies

cd frontend && npm install
cd ../backend && npm install
cd ../ml-service && pip install -r requirements.txt

# 3. Set up .env files (see above)

# 4. Run all services
cd backend && npm run dev        # Port 5000
cd frontend && npm run dev       # Port 5173
cd ml-service && uvicorn main:app --reload  # Port 8000
```

---

## ✅ Development Progress Tracker

### Phase 1 — Foundation (Start here)
- [x] Project structure created
- [x] All config files written
- [ ] Firebase project created & configured
- [ ] Backend: server.js + middleware setup
- [ ] Backend: Firebase Admin SDK connected
- [ ] Frontend: Vite + TailwindCSS setup
- [ ] Frontend: Firebase client SDK + AuthContext

### Phase 2 — Core Features
- [ ] Auth: Register, Login, Google OAuth
- [ ] Products: CRUD (Admin) + List/Filter (User)
- [ ] Product detail page
- [ ] Cart system (Firestore-based)
- [ ] Checkout + Razorpay
- [ ] Order management

### Phase 3 — Advanced Features
- [ ] Bulk order multi-step form
- [ ] Admin bulk order quoting system
- [ ] Reviews & ratings
- [ ] Wishlist

### Phase 4 — ML System
- [ ] User interaction logging
- [ ] ML service (FastAPI + collaborative filtering)
- [ ] Recommendation UI on product page
- [ ] Recommendation UI on home page

### Phase 5 — Polish
- [ ] Email notifications (order confirmation, shipping)
- [ ] Search with filters
- [ ] Admin analytics dashboard
- [ ] Mobile responsiveness
- [ ] Performance optimization

---

## 🚀 What Has Been Built So Far

The following files are already scaffolded and ready:
1. `frontend/package.json` — all dependencies listed
2. `frontend/vite.config.js` — Vite config with aliases
3. `frontend/src/utils/firebase.js` — Firebase init
4. `frontend/src/utils/api.js` — Axios instance
5. `frontend/src/context/AuthContext.jsx` — Full auth context
6. `frontend/src/context/CartContext.jsx` — Cart context with Firestore sync
7. `frontend/src/pages/user/Home.jsx` — Home page with hero + sections
8. `frontend/src/pages/user/BulkOrder.jsx` — Full bulk order multi-step form
9. `frontend/src/components/common/Navbar.jsx` — Full navbar
10. `frontend/src/components/common/ProductCard.jsx` — Product card
11. `backend/server.js` — Express server with all middleware
12. `backend/package.json` — all dependencies
13. `backend/src/middleware/auth.js` — Firebase auth middleware
14. `backend/src/routes/` — All route files (products, orders, bulk, users, recommendations)
15. `backend/src/controllers/` — All controllers
16. `ml-service/main.py` — FastAPI ML service
17. `ml-service/recommender.py` — Collaborative filtering model

---

## 💡 Prompt for Next Claude Session

Copy and paste this:

```
I'm continuing development of FashionFlow — a MERN e-commerce clothing platform.
Tech stack: React + Vite + TailwindCSS (frontend), Node.js + Express (backend), 
Firebase Firestore (DB), Firebase Auth, Firebase Storage, FastAPI (ML service), 
Razorpay (payments).

Here is the full project handover document: [paste HANDOVER.md contents]

Current status: [describe what you've completed from the progress tracker above]

Next task: [e.g., "Build the product listing page with filters", 
           "Set up the backend products CRUD routes",
           "Build the ML recommendation service"]

Please continue from where we left off.
```

---

## 📞 Admin Credentials (Development)

Set first admin manually in Firestore:
```
/users/{your-uid} → role: "admin"
```

---

*Last updated: Project initialization. All architecture decisions finalized.*
