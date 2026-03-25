# ml-service/main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from recommender import FashionRecommender
import os

recommender = FashionRecommender()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    print("Loading recommendation model...")
    await recommender.load_or_train()
    print("Model ready!")
    yield

app = FastAPI(title="FashionFlow ML Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": recommender.model_loaded}

@app.get("/recommend/user/{user_id}")
async def recommend_for_user(user_id: str, limit: int = 10):
    """Get personalized product recommendations for a user"""
    try:
        recs = await recommender.get_user_recommendations(user_id, limit)
        return {"recommendations": recs, "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recommend/product/{product_id}")
async def similar_products(product_id: str, limit: int = 6):
    """Get similar products to a given product"""
    try:
        similar = await recommender.get_similar_products(product_id, limit)
        return {"similar": similar, "product_id": product_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def retrain_model(background_tasks: BackgroundTasks):
    """Retrain the recommendation model (admin use)"""
    background_tasks.add_task(recommender.train)
    return {"message": "Training started in background"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
