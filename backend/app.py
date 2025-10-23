from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
import requests
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Hugging Face Inference API token (set in Render Environment Variables)
HF_API_TOKEN = os.environ.get("HF_API_TOKEN")  # your Hugging Face API token
HF_MODEL = "sshleifer/distilbart-cnn-12-6"  # summarization model

# Helper function to summarize text using Hugging Face API
def summarize_text_api(text):
    url = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {"inputs": text}
    response = requests.post(url, headers=headers, json=payload)
    result = response.json()
    if isinstance(result, list) and "summary_text" in result[0]:
        return result[0]["summary_text"]
    return str(result)

# Extract text from uploaded PDF
def extract_text_from_pdf(file_path):
    with open(file_path, "rb") as f:
        reader = PdfReader(f)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

# Endpoint: Summarize plain text
@app.route("/summarize-text", methods=["POST"])
def summarize_text_route():
    data = request.get_json()
    input_text = data.get("text", "")
    if not input_text:
        return jsonify({"error": "No text provided"}), 400

    summary = summarize_text_api(input_text)
    return jsonify({"summary": summary})

# Endpoint: Summarize PDF document
@app.route("/summarize-document", methods=["POST"])
def summarize_document_route():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)

    extracted_text = extract_text_from_pdf(file_path)
    doc_summary = summarize_text_api(extracted_text)

    return jsonify({
        "extracted_text": extracted_text,
        "summary": doc_summary
    })

# Correct port for Render
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
