import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "vectorizer.pkl")

_model = None
_vectorizer = None

def _load():
    global _model, _vectorizer
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "model.pkl not found. Run train_model.py first."
            )
        _model = pickle.load(open(MODEL_PATH, "rb"))
        _vectorizer = pickle.load(open(VECTORIZER_PATH, "rb"))

def get_ml_score(text: str) -> int:
    """Returns fraud probability as integer 0 to 100"""
    _load()
    vec = _vectorizer.transform([text])
    prob = _model.predict_proba(vec)[0][1]
    return round(prob * 100)