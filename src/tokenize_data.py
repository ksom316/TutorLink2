from sklearn.model_selection import train_test_split
from transformers import BertTokenizer
from datasets import Dataset
import json
import pickle  # To save label mappings

# Load intents.json
with open("intents.json", "r") as f:
    data = json.load(f)

# Extract texts and corresponding tags
texts = []
labels = []

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        texts.append(pattern)
        labels.append(intent["tag"])

# Map tags to numeric labels
# Create proper label mappings
unique_labels = sorted(set(labels))
label2id = {label: idx for idx, label in enumerate(unique_labels)}
id2label = {idx: label for label, idx in label2id.items()}

# Convert string labels to integer labels
numeric_labels = [label2id[label] for label in labels]

# Save label mappings for later use (in inference)
with open("label_mappings.pkl", "wb") as f:
    pickle.dump((label2id, id2label), f)

# Split the data
train_texts, val_texts, train_labels, val_labels = train_test_split(
    texts, numeric_labels, test_size=0.2, random_state=42
)

# Tokenize
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

def tokenize_function(example):
    return tokenizer(example["text"], padding="max_length", truncation=True, max_length=32)

# Prepare HuggingFace datasets
train_dataset = Dataset.from_dict({"text": train_texts, "label": train_labels})
val_dataset = Dataset.from_dict({"text": val_texts, "label": val_labels})

# Tokenize the datasets
tokenized_train = train_dataset.map(tokenize_function, batched=True)
tokenized_val = val_dataset.map(tokenize_function, batched=True)

# Save tokenized datasets if needed
tokenized_train.save_to_disk("tokenized_train")
tokenized_val.save_to_disk("tokenized_val")

with open("train_val_labels.pkl", "wb") as f:
    pickle.dump((train_labels, val_labels), f)

# (Optional) Debug print
print("Tokenization complete. Datasets ready.")
