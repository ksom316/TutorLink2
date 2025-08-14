import torch
from transformers import BertTokenizer, BertForSequenceClassification
import torch.nn.functional as F

model = BertForSequenceClassification.from_pretrained("bert_intent_model")
tokenizer = BertTokenizer.from_pretrained("bert_intent_model")
model.eval()

label_map = model.config.id2label  # {0: "greeting", 1: "schedule_meeting", ...}
print(model.config.id2label)


def predict_intent(text, threshold=0.1):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=32)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = F.softmax(logits, dim=1)
        confidence, predicted_class = torch.max(probs, dim=1)

    confidence_value = confidence.item()
    predicted_label = label_map[predicted_class.item()]

    # 🔍 DEBUG: Print raw probabilities and confidence
    print(f"[DEBUG] Input: {text}")
    print(f"[DEBUG] Probabilities: {probs}")
    print(f"[DEBUG] Confidence: {confidence_value:.4f}")
    print(f"[DEBUG] Predicted label: {predicted_label}")

    if confidence_value < threshold:
        return "unknown"
    else:
        return predicted_label
