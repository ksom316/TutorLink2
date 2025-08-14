import json
import random
import pickle
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from nltk.stem import PorterStemmer
# from nltk.tokenize import word_tokenize
from nltk.tokenize import TreebankWordTokenizer
import nltk

nltk.download('punkt')

stemmer = PorterStemmer()


stemmer = PorterStemmer()
tokenizer = TreebankWordTokenizer()

def tokenize_and_stem(text):
    tokens = tokenizer.tokenize(text)
    return [stemmer.stem(w.lower()) for w in tokens]

# Load intents
with open('intents.json') as f:
    data = json.load(f)

corpus = []
labels = []

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        corpus.append(" ".join(tokenize_and_stem(pattern)))
        labels.append(intent["tag"])

# Vectorize
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(corpus)
y = labels

# Train model
model = LogisticRegression()
model.fit(X, y)

# Save model and vectorizer
with open("chatbot_model.pkl", "wb") as f:
    pickle.dump((model, vectorizer, data), f)

print("Model trained and saved as chatbot_model.pkl")
