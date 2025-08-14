from transformers import BertForSequenceClassification, Trainer, TrainingArguments, BertTokenizer
from tokenize_data import tokenized_train, tokenized_val, train_labels, val_labels
from sklearn.preprocessing import LabelEncoder
import torch
import numpy as np
import pickle
from datasets import load_from_disk

# Load tokenized datasets
tokenized_train = load_from_disk("tokenized_train")
tokenized_val = load_from_disk("tokenized_val")

# Load train/val labels
with open("train_val_labels.pkl", "rb") as f:
    train_labels, val_labels = pickle.load(f)

# Load label mappings
with open("label_mappings.pkl", "rb") as f:
    label2id, id2label = pickle.load(f)
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Encode text labels into numeric IDs
label_encoder = LabelEncoder()
train_labels_encoded = label_encoder.fit_transform(train_labels)
val_labels_encoded = label_encoder.transform(val_labels)

# Add encoded labels to the tokenized datasets
tokenized_train = tokenized_train.add_column("labels", train_labels_encoded)
tokenized_val = tokenized_val.add_column("labels", val_labels_encoded)

# Load BERT model for classification
model = BertForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=len(label2id),
    id2label=id2label,
    label2id=label2id
)

# Define metrics
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    accuracy = np.mean(predictions == labels)
    return {"accuracy": accuracy}

# ✅ Compatible TrainingArguments
training_args = TrainingArguments(
    output_dir="./bert_intent_model",
    logging_dir="./logs",
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=5,
    weight_decay=0.01,
    logging_steps=10,
    save_steps=10,
    eval_steps=10
)

# Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_train,
    eval_dataset=tokenized_val,
    compute_metrics=compute_metrics
)

# Train the model
trainer.train()

# Save label mappings in model config
model.config.id2label = id2label
model.config.label2id = label2id

# Save model and tokenizer
trainer.save_model("bert_intent_model")
tokenizer.save_pretrained("bert_intent_model")

# Save label encoder
with open("label_encoder.pkl", "wb") as f:
    pickle.dump(label_encoder, f)
