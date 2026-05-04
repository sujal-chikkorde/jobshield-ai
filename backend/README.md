# JobShield AI — Backend

The Flask-based backend powering JobShield AI's 3-layer fake job detection pipeline.

## Architecture

```
Job Description Text
        │
        ▼
┌─────────────────────┐
│  Layer 1: Rule Engine│  → Regex + keyword flags
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Layer 2: ML Model  │  → TF-IDF + Logistic Regression (0–100 score)
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Layer 3: Gemini AI │  → Human-readable explanation + safety tips
└─────────────────────┘
        │
        ▼
     JSON Response
```

## Tech Stack

- **Framework**: Flask + Flask-CORS
- **ML**: Scikit-learn (TF-IDF + Logistic Regression trained on EMSCAD dataset)
- **LLM**: Google Gemini API (gemini-2.5-flash)
- **Language**: Python 3.14

## Project Structure

```
backend/
├── app.py            # Flask server + /analyze route
├── analyzer.py       # Layer 3 — Gemini AI explanation
├── rule_engine.py    # Layer 1 — Rule-based red flag detection
├── predictor.py      # Layer 2 — ML fraud score prediction
├── model.pkl         # Trained Logistic Regression model
├── vectorizer.pkl    # Trained TF-IDF vectorizer
├── requirements.txt  # Python dependencies
├── .env.example      # Environment variable template
└── .gitignore
```

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
```
Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_key_here
```
Get a free key at [aistudio.google.com](https://aistudio.google.com)

### 3. Run the server
```bash
python app.py
```
Server starts at `http://localhost:5000`

## API Reference

### `POST /analyze`

Analyzes a job description for fraud.

**Request:**
```json
{
  "text": "Job description text here"
}
```

**Response:**
```json
{
  "rule_flags": ["Scam phrase detected: 'registration fee'"],
  "ml_score": 82,
  "risk_level": "High",
  "explanation": "This posting shows strong signs of fraud...",
  "safety_tips": [
    "Never pay any upfront fees to apply for a job",
    "Verify the company on LinkedIn before applying",
    "Report this posting to your college placement cell"
  ]
}
```

**Risk Levels:**
| Score | Risk Level |
|-------|------------|
| 0–30  | Low        |
| 31–70 | Medium     |
| 71–100| High       |

### `GET /health`
Returns `{"status": "ok"}` — used to check if server is running.

## Team

| Person | Responsibility |
|--------|---------------|
| P1 | Flask server, Gemini AI integration (`app.py`, `analyzer.py`) |
| P2 | React frontend, dashboard UI |
| P3 | OCR input handling (Tesseract.js) |
| P4 | Rule engine, ML model training (`rule_engine.py`, `predictor.py`) |