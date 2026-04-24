# 🌿 Plant Disease Detector

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/Claude-Vision_API-CC785C?style=for-the-badge&logo=anthropic&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

<p align="center">
  AI-powered plant leaf analysis web app built with Flask and Claude Vision.<br/>
  Upload a leaf photo → get instant disease diagnosis, severity, treatment & prevention tips.
</p>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔍 **AI Diagnosis** | Detects 38+ plant diseases using Claude Vision |
| 📊 **Confidence Score** | Visual ring indicator showing model certainty |
| 💊 **Full Report** | Symptoms, causes, treatment steps, and prevention |
| 🖱️ **Drag & Drop** | Easy image upload (JPG, PNG, WEBP — max 10 MB) |
| ⚡ **Fast** | Results in under 2 seconds |
| 🛡️ **Error Handling** | Detects non-plant images and API failures gracefully |

---

## 🖼️ Demo

> Upload a leaf photo → AI analyzes it → Get a full diagnosis with confidence score, symptoms, causes, treatment & prevention tips.

---

## 🗂️ Project Structure

```
plant_disease_detector/
├── app.py                  # Flask backend + Anthropic Vision API
├── requirements.txt        # Python dependencies
├── README.md
├── templates/
│   └── index.html          # Jinja2 UI template
└── static/
    ├── css/
    │   └── style.css       # Styles and layout
    └── js/
        └── main.js         # Upload, fetch, result rendering
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone the repository

```bash
git clone https://github.com/ashish-bisht-iot/plant-disease-detector.git
cd plant-disease-detector
```

### 2. Create a virtual environment

```bash
# macOS / Linux
python -m venv venv
source venv/bin/activate

# Windows (cmd)
python -m venv venv
venv\Scripts\activate

# Windows (PowerShell)
python -m venv venv
venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set your API key

```bash
# macOS / Linux
export ANTHROPIC_API_KEY="sk-ant-..."

# Windows (cmd)
set ANTHROPIC_API_KEY=sk-ant-...

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="sk-ant-..."
```

### 5. Run the app

```bash
python app.py
```

Open **http://localhost:5000** in your browser.

---

## 🔌 API Reference

### `POST /analyze`

Accepts a leaf image and returns a structured JSON diagnosis.

**Request** — `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `image` | `file` | Leaf image (JPG, PNG, WEBP) |

**Success Response — `200 OK`**

```json
{
  "is_plant": true,
  "plant_name": "Tomato",
  "health_status": "Diseased",
  "disease_name": "Tomato Early Blight",
  "confidence": 87,
  "severity": "Moderate",
  "symptoms": ["Dark brown concentric rings on leaves", "Yellowing around lesions"],
  "causes": ["Alternaria solani fungus", "Warm and humid conditions"],
  "treatment": ["Remove infected leaves immediately", "Apply copper-based fungicide"],
  "prevention": ["Avoid overhead watering", "Rotate crops every season"],
  "summary": "The tomato leaf shows classic early blight symptoms with moderate severity."
}
```

**Error Response — `4xx / 5xx`**

```json
{ "error": "Description of what went wrong" }
```

---

## 🧠 How It Works

```
User uploads image
      ↓
Flask receives & base64-encodes it
      ↓
Sent to Claude claude-opus-4-5 (Vision API) with expert plant pathologist prompt
      ↓
Claude returns structured JSON diagnosis
      ↓
Frontend renders: health badge · confidence ring · symptoms · treatment
```

---

## 📝 Tips for Best Results

- 📷 Use a **clear, close-up photo** of a single leaf
- ☀️ Ensure **good lighting** — avoid shadows or blur
- 🍃 One leaf per photo gives the most accurate result
- 📁 Supported formats: **JPG, PNG, WEBP** (max 10 MB)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Built with 🌱 and <a href="https://www.anthropic.com">Claude AI</a></p>
