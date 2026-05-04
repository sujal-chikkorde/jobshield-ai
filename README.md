# JobShield AI — Fake Job & Internship Detector

AI-powered tool to detect fake job and internship postings using a 3-layer pipeline.

## Team
- P1 — Backend + Flask API + Claude LLM
- P2 — Frontend Dashboard (React)
- P3 — Input Panel + OCR (Tesseract.js)
- P4 — Rules Engine + ML Model

## Tech Stack
- Frontend: React + Vite + Tailwind + Recharts
- Backend: Flask + Claude API
- ML: scikit-learn + TF-IDF + Logistic Regression
- OCR: Tesseract.js

## How to Run

### Frontend
cd frontend
npm install
npm run dev

### Backend
cd backend
pip install -r requirements.txt
python app.py

## API
POST /analyze
Body: { "text": "job description" }
