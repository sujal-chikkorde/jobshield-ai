import pickle
import numpy as np

m = pickle.load(open("model.pkl", "rb"))
v = pickle.load(open("vectorizer.pkl", "rb"))
print("classes:", m.classes_)

names = np.array(v.get_feature_names_out())
order = np.argsort(m.coef_[0])
print("\nWords pushing toward CLASS 1:", list(names[order[-30:]][::-1]))
print("\nWords pushing toward CLASS 0:", list(names[order[:30]]))

tests = {
    "scam": "Earn Rs 3000 per day from home. Pay Rs 250 registration fee. WhatsApp only. Join today!",
    "legit": "We are hiring a Software Engineer with 2+ years of experience in Java and Spring. Responsibilities include designing APIs. Apply via our careers page. Interview process: 3 rounds.",
}
for k, t in tests.items():
    print(k, "-> [P(class0), P(class1)] =", m.predict_proba(v.transform([t]))[0])