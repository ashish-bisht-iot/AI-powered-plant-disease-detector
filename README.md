# 🌿 Plant Disease Detector

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/Groq-AI_Vision-F55036?style=for-the-badge&logo=groq&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

<p align="center">
  AI-powered plant leaf analysis web app built with Flask and Groq (free).<br/>
  Upload or capture a leaf photo → get instant disease diagnosis, severity, treatment & prevention tips.
</p>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔍 **AI Diagnosis** | Detects 38+ plant diseases using Groq Vision (Llama 4) |
| 📷 **Camera Support** | Take photo directly from laptop webcam or mobile camera |
| 🖱️ **Drag & Drop** | Easy image upload (JPG, PNG, WEBP — max 10 MB) |
| 📊 **Confidence Score** | Visual ring indicator showing model certainty |
| 💊 **Full Report** | Symptoms, causes, treatment steps, and prevention tips |
| 📋 **History Page** | Track all past diagnoses with thumbnails and details |
| 🔁 **No Duplicates** | Same leaf image is never saved twice in history |
| 🚫 **Smart Filtering** | Non-plant images are never saved to history |
| 🗑️ **Delete Records** | Remove individual or all history records |
| ⚡ **100% Free** | Powered by Groq — no billing or credit card needed |

---

## 🖼️ Pages

- **`/`** — Main analyzer page with upload, camera, and results
- **`/history`** — Diagnosis history with thumbnails, delete per record, clear all

---

## 🗂️ Project Structure

```
plant_disease_detector/
├── app.py                  # Flask backend + Groq Vision API
├── requirements.txt        # Python dependencies
├── .env                    # API key (not committed to git)
├── README.md
├── templates/
│   ├── index.html          # Main analyzer UI
│   └── history.html        # Diagnosis history page
└── static/
    ├── css/
    │   └── style.css       # Styles and layout
    └── js/
        └── main.js         # Upload, camera, fetch, history logic
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- A free [Groq API key](https://console.groq.com/keys)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/plant-disease-detector.git
cd plant-disease-detector
```

### 2. Create and activate a virtual environment

**Windows (cmd)**
```cmd
python -m venv venv
venv\Scripts\activate
```

**Windows (PowerShell)**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

**macOS / Linux**
```bash
python -m venv venv
source venv/bin/activate
```

> If PowerShell blocks activation, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 3. Install dependencies

```cmd
pip install -r requirements.txt
```

### 4. Get your free Groq API key

1. Go to 👉 **https://console.groq.com/keys**
2. Sign up for free (no credit card needed)
3. Click **Create API Key** and copy it

### 5. Create `.env` file

Create a file named `.env` in the project root:

```
GROQ_API_KEY=gsk_...your-key-here
```

> ⚠️ No quotes, no spaces around `=`

### 6. Run the app

```cmd
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
User uploads image or takes photo via webcam
              ↓
Flask receives & encodes image as base64
              ↓
Sent to Groq API (Llama 4 Scout Vision model)
              ↓
AI returns structured JSON diagnosis
              ↓
Frontend renders results:
health badge · confidence ring · symptoms · treatment
              ↓
If valid plant → saved to browser localStorage history
(duplicates and non-plants automatically filtered out)
```

---

## 📋 Requirements

```
flask>=3.0.0
groq>=0.9.0
pillow>=10.0.0
python-dotenv>=1.0.0
```

---

## 📝 Tips for Best Results

- 📷 Use a **clear, close-up photo** of a single leaf
- ☀️ Ensure **good lighting** — avoid shadows or blur
- 🍃 **One leaf per photo** gives the most accurate result
- 📁 Supported formats: **JPG, PNG, WEBP** (max 10 MB)
- 🌿 Works best with **common crop plants** (tomato, potato, corn, rice, etc.)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Built with 🌱 and <a href="https://groq.com">Groq AI</a> · Free forever</p>
