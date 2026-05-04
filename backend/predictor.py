import pickle
import os

# Define paths for saved model and vectorizer
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "vectorizer.pkl")

# Global variables to store loaded model and vectorizer (lazy loading)
_model = None
_vectorizer = None

def _load():
    """
    Loads the trained ML model and vectorizer only once.
    Uses lazy loading to improve performance.
    """
    global _model, _vectorizer

    # Load model only if not already loaded
    if _model is None:
        # Check if model file exists
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "model.pkl not found. Run train_model.py first."
            )

        # Load model and vectorizer from disk
        _model = pickle.load(open(MODEL_PATH, "rb"))
        _vectorizer = pickle.load(open(VECTORIZER_PATH, "rb"))

def get_ml_score(text: str) -> int:
    """
    Takes input text (job description) and returns fraud probability (0–100).

    Steps:
    1. Convert text to numerical vector using TF-IDF vectorizer
    2. Use trained ML model to predict probability
    3. Convert probability to percentage score
    """
    _load()  # Ensure model is loaded

    # Transform text into numerical features
    vec = _vectorizer.transform([text])

    # Predict probability of fraud (class 1)
    prob = _model.predict_proba(vec)[0][1]

    # Return score as integer percentage
    return round(prob * 100)