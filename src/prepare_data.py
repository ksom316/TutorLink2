import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle

# Load the intents.json file
with open("intents.json", "r") as f:
    data = json.load(f)

# Extract patterns and corresponding labels
texts = []
labels = []

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        texts.append(pattern)
        labels.append(intent["tag"])

# Encode string labels into numeric values
le = LabelEncoder()
encoded_labels = le.fit_transform(labels)

# Save the label encoder for future decoding
with open("label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)

# Split into training and validation sets
train_texts, val_texts, train_labels, val_labels = train_test_split(
    texts, encoded_labels, test_size=0.2, random_state=42)

# ✅ Check what you got
print("Sample text:", train_texts[0])
print("Encoded label:", train_labels[0])
print("Total samples:", len(texts))
