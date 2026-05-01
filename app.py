import os
import json
import base64
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from groq import Groq
from PIL import Image
import io

load_dotenv()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB limit

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


SYSTEM_PROMPT = """You are an expert plant pathologist and agronomist with decades of experience 
diagnosing plant diseases from leaf images. Analyze the provided leaf image carefully and respond 
ONLY with a valid JSON object — no markdown, no explanation outside the JSON.

Return this exact structure:
{
  "is_plant": true or false,
  "plant_name": "Common name of the plant (or null if not a plant)",
  "health_status": "Healthy" | "Diseased" | "Unknown",
  "disease_name": "Name of disease (or null if healthy/unknown)",
  "confidence": 0-100 (integer),
  "severity": "None" | "Mild" | "Moderate" | "Severe",
  "symptoms": ["symptom 1", "symptom 2"],
  "causes": ["cause 1", "cause 2"],
  "treatment": ["treatment step 1", "treatment step 2"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "summary": "One-sentence plain-English summary of findings."
}

Rules:
- If the image is not a plant leaf, set is_plant to false and fill other fields with null or empty arrays.
- Be specific about disease names (e.g. "Tomato Early Blight" not just "blight").
- Confidence should reflect how certain you are given image quality and clarity.
- Keep each array item concise (under 15 words).
- Return ONLY the JSON object, no markdown fences, no extra text.
"""


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/history")
def history():
    return render_template("history.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Use JPG, PNG, or WEBP."}), 400

    try:
        image_bytes = file.read()

        # Validate it's a real image
        Image.open(io.BytesIO(image_bytes)).verify()

        mime_type = file.content_type or "image/jpeg"
        img_b64 = base64.b64encode(image_bytes).decode("utf-8")

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{img_b64}"}
                    },
                    {
                        "type": "text",
                        "text": "Analyze this leaf image and return the JSON diagnosis."
                    }
                ]}
            ],
            max_tokens=1024
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        result = json.loads(raw.strip())
        return jsonify(result)

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response. Please try again."}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
