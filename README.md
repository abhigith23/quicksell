# QuickSell - Local Buy & Sell Marketplace

A full-featured marketplace for Jaipur with real-time chat, AI pricing, image upload, and admin dashboard.

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env    # Fill in your API keys
npm run dev             # Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env    # Fill in your API keys
npm start               # Opens http://localhost:3000
```

## 🔑 Required API Keys
- **Firebase** → https://console.firebase.google.com
- **Cloudinary** → https://cloudinary.com
- **Groq** → https://console.groq.com
- **Gmail App Password** → https://myaccount.google.com/apppasswords

## 📁 Structure
```
quicksell/
├── backend/      → Node.js + Express + Firebase + Socket.io
└── frontend/     → React 18 + Tailwind CSS
```

## ✨ Features
- User auth (Email + Google)
- Create, search, filter listings
- Real-time chat with Socket.io
- AI price suggestions (Groq)
- Image upload (Cloudinary)
- Wishlist, Profile, Reports
- Admin dashboard (moderation, users, categories)
- Dark mode + Responsive design
