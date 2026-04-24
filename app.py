import os
import base64
import json
from flask import Flask, request, jsonify, render_template
import anthropic

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB limit

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def encode_image(image_bytes: bytes, media_type: str) -> str:
    return base64.standard_b64encode(image_bytes).decode("utf-8")


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
"""


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Use JPG, PNG, or WEBP."}), 400

    image_bytes = file.read()
    ext = file.filename.rsplit(".", 1)[1].lower()
    media_type_map = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
    }
    media_type = media_type_map.get(ext, "image/jpeg")
    image_data = encode_image(image_bytes, media_type)

    try:
        message = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Analyze this leaf image and return the JSON diagnosis.",
                        },
                    ],
                }
            ],
        )

        raw = message.content[0].text.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
        return jsonify(result)

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response. Please try again."}), 500
    except anthropic.APIError as e:
        return jsonify({"error": f"API error: {str(e)}"}), 502
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
