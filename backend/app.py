from flask import Flask, request, jsonify
from flask_cors import CORS
from txtai.pipeline import Summary
from PyPDF2 import PdfReader
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize once
summary = Summary()

def extract_text_from_pdf(file_path):
    with open(file_path, "rb") as f:
        reader = PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    return text

@app.route("/summarize-text", methods=["POST"])
def summarize_text():
    data = request.get_json()
    input_text = data.get("text", "")
    if not input_text:
        return jsonify({"error": "No text provided"}), 400
    result = summary(input_text)
    return jsonify({"summary": result})

@app.route("/summarize-document", methods=["POST"])
def summarize_document():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join("uploads", file.filename)
    os.makedirs("uploads", exist_ok=True)
    file.save(file_path)

    extracted_text = extract_text_from_pdf(file_path)
    doc_summary = summary(extracted_text)

    return jsonify({
        "extracted_text": extracted_text,
        "summary": doc_summary
    })

if __name__ == "__main__":
    app.run(debug=True)
