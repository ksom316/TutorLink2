# from flask import Flask, request, jsonify
# import pickle
# # from nltk.tokenize import word_tokenize
# from nltk.tokenize import TreebankWordTokenizer

# from nltk.stem import PorterStemmer
# import random
# from flask_cors import CORS

# stemmer = PorterStemmer()


# def preprocess(text):
#     tokenizer = TreebankWordTokenizer()
#     tokens = tokenizer.tokenize(text.lower())

#     return " ".join([stemmer.stem(t) for t in tokens])

# # Load model
# with open("chatbot_model.pkl", "rb") as f:
#     model, vectorizer, intents_data = pickle.load(f)

# # print("Loaded model:", type(model))
# # print("Loaded vectorizer:", type(vectorizer))
# # print("Loaded intents:", intents_data)
# for intent in intents_data["intents"]:
#     print(f"Tag: {intent['tag']}")
#     print(f"Patterns: {intent['patterns']}")
#     print(f"Responses: {intent['responses']}")
#     print("-" * 20)


# app = Flask(__name__)
# # CORS(app)
# CORS(app, supports_credentials=True)


# @app.route("/bot", methods=["POST"])
# def bot():
#     user_message = request.json.get("message")
#     processed = preprocess(user_message)
#     X = vectorizer.transform([processed])

#     # Get probabilities of all intents
#     probabilities = model.predict_proba(X)[0]
#     max_prob = max(probabilities)
#     intent_index = probabilities.argmax()

#     # Define a confidence threshold
#     CONFIDENCE_THRESHOLD = 0.6

#     if max_prob < CONFIDENCE_THRESHOLD:
#         return jsonify({"reply": "I'm not sure how to respond to that."})

#     intent = model.classes_[intent_index]

#     for intent_data in intents_data["intents"]:
#         if intent_data["tag"] == intent:
#             response = random.choice(intent_data["responses"])
#             return jsonify({"reply": response})

#     # Just in case no match is found (shouldn't happen)
#     return jsonify({"reply": "I'm not sure how to respond to that. I'll let your lecturer know about this message"})

# if __name__ == "__main__":
#     app.run(debug=True)


# # import nltk
# # nltk.download('punkt')


from flask import Flask, request, jsonify
from predict_intent import predict_intent
import json
import random
from flask_cors import CORS

# Load intents.json
with open("intents.json", "r") as f:
    intents_data = json.load(f)

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route("/bot", methods=["POST"])
def bot():
    user_message = request.json.get("message")
    print(f"\n[DEBUG] Received message: {user_message}")

    intent = predict_intent(user_message)
    print(f"[DEBUG] Predicted intent: {intent}")

    if intent == "human_help":
        print("[DEBUG] Detected 'human_help' intent — flagging manual response.")
        return jsonify({
            "reply": "Let me connect you with a tutor for assistance.",
            "manual_required": True
        })

    # Check if intent exists in intents.json
    found_response = False
    for intent_data in intents_data["intents"]:
        if intent_data["tag"] == intent:
            response = random.choice(intent_data["responses"])
            print(f"[DEBUG] Found response for intent '{intent}': {response}")
            found_response = True
            return jsonify({
                "reply": response,
                "manual_required": False
            })

    if not found_response:
        print(f"[DEBUG] No matching intent tag found for: {intent}")
        return jsonify({
            "reply": "I'm not sure how to respond to that. I'll inform your tutor.",
            "manual_required": True
        })




if __name__ == "__main__":
    app.run(debug=True)

