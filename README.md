# 🧵 FashionFlow — E-Commerce Clothing Platform

A full-stack MERN clothing e-commerce platform with bulk orders & ML-based recommendations.

## Quick Start

```bash
# 1. Frontend
cd frontend && npm install && cp .env.example .env
# Fill in .env with your Firebase config
npm run dev   # → http://localhost:5173

# 2. Backend
cd backend && npm install && cp .env.example .env
# Fill in .env with Firebase Admin SDK + Razorpay keys
npm run dev   # → http://localhost:5000

# 3. ML Service
cd ml-service && pip install -r requirements.txt
# Add firebase-credentials.json (Service Account JSON from Firebase)
uvicorn main:app --reload   # → http://localhost:8000
```

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage
- **ML**: Python FastAPI + Collaborative Filtering (SVD)
- **Payments**: Razorpay

## Features
- 🛍️ Browse & buy clothing (Men / Women / Kids)
- 📦 Bulk order system with custom designs & fabrics
- 🤖 ML-based personalized recommendations
- 👤 User profiles, order history, wishlist
- ⚙️ Admin panel: products, orders, analytics

## See HANDOVER.md for full architecture & continuation guide.
