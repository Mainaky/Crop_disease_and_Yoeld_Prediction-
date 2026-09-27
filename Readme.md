# 🌾 CropGuard AI: Crop Health & Yield Predictor

A deep-learning and machine-learning mobile application for **Rice & Wheat crop disease classification**, **leaf infection severity calculation**, and **environmental-based yield forecasting**.

---

## 📱 Mobile App Features

- **Leaf Specimen Analysis**: Take live photos with the mobile camera, choose from the phone gallery, or load demonstration samples.
- **Crop Disease Classification**: Evaluates MobileNetV2 deep learning models across **6 Rice diseases** and **15 Wheat diseases** with confidence scoring.
- **Severity Estimation Meter**: Color-coded infection damage gauge (Green / Yellow / Orange / Red) based on leaf necrosis pixel density.
- **Yield Forecasting Engine**: Random Forest ML regressor predicting crop yield (in **kg/hectare** and **metric tons/hectare**) using 10 soil NPK, pH, and climate metrics.
- **Healthy Crop Yield Boost**: Automated heuristic (+15% yield bonus & 0% severity) when vigorous foliage is diagnosed.
- **Agronomic Advisory**: Prescriptive chemical sprays, cultural prevention practices, organic alternatives, and yield risk warnings.
- **Disease Encyclopedia**: Searchable in-app guide covering symptoms and management for all 21 diseases.
- **Archived Scan History**: Browse and re-inspect previous diagnoses with timestamps and thumbnails.
- **Configurable Backend / Offline Demo Mode**: Real-time ping tester and offline simulation mode so presentations to faculty never fail even without Wi-Fi.

---

## 🚀 Quick Start Guide

### Step 1: Start the Backend Server

You can start the unified FastAPI backend using the 1-click batch file or manually in your terminal:

```bash
# Option A: 1-Click Batch Script (Shows your local Wi-Fi IP automatically)
run_backend.bat

# Option B: Terminal Command
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> **Note**: When started on `0.0.0.0:8000`, the server is reachable by any mobile phone connected to the same Wi-Fi network at `http://<YOUR_IP>:8000` (e.g. `http://172.19.23.6:8000`).

---

### Step 2: Launch the Mobile App (React Native / Expo)

```bash
# Option A: 1-Click Batch Script
run_mobile_app.bat

# Option B: Terminal Command
cd mobile_app
npx expo start --port 8082
```

#### How to run it on your smartphone:
1. Install **Expo Go** on your Android phone (from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)) or iPhone (from App Store).
2. Open Expo Go and **scan the QR code** shown in the terminal.
3. The app will bundle and open natively on your phone!

#### How to run in web browser:
- In the Expo terminal, press `w` to open the app in your browser with mobile layout.

---

### Step 3: Instant Mobile Web PWA (Alternative)

If you prefer running the app in a web browser or deploying it to Vercel/Netlify:
- Open [`index.html`](file:///c:/Users/maina/Downloads/research_and_development-main/research_and_development-main/index.html) in any browser.
- On your phone's Chrome browser, tap the three dots `⋮` and select **"Add to Home Screen"** or **"Install App"** to install it as a standalone app!

---

## 🛠️ API Endpoints (`main.py`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and health check |
| `POST` | `/predict/full` | Unified inference: Accepts leaf image + soil/climate form data, returns disease diagnosis, severity %, yield forecast, and advisory |
| `POST` | `/predict/disease` | Disease diagnosis and severity calculation |
| `POST` | `/predict/yield` | Random Forest yield prediction from 10 soil/climate features |
| `POST` | `/predict/` | Backward-compatible legacy endpoint |

---

## 📂 Project Architecture

```
research_and_development-main/
├── main.py                     # Unified FastAPI server (Disease + Yield + Advisory)
├── crop_pipeline.py            # MobileNetV2 image preprocessing and inference pipeline
├── training.py                 # MobileNetV2 transfer learning training script
├── run_backend.bat             # 1-Click launcher for backend server
├── run_mobile_app.bat          # 1-Click launcher for mobile app
├── index.html                  # Mobile-first responsive PWA interface
├── model/
│   ├── rice_model.h5           # Trained MobileNetV2 model for Rice diseases (~23.6 MB)
│   ├── wheat_model.h5          # Trained MobileNetV2 model for Wheat diseases (~23.6 MB)
│   ├── crop_classifier.pth     # PyTorch crop classifier (~44.8 MB)
│   └── yield_model.pkl         # Trained Random Forest yield regressor
├── mobile_app/                 # Complete React Native (Expo) Mobile Application
│   ├── App.js                  # Main App with Tab Navigation
│   ├── app.json                # Expo config with Camera/Gallery permissions
│   ├── package.json            # Expo SDK 57 & React Native dependencies
│   └── src/
│       ├── screens/
│       │   ├── HomeScreen.js           # Camera, gallery, presets, soil/climate inputs
│       │   ├── ResultScreen.js         # Diagnosis card, severity gauge, yield card, advisory
│       │   ├── DiseaseGuideScreen.js   # 21-Disease catalog with symptoms & treatments
│       │   ├── HistoryScreen.js        # Archived scan records
│       │   └── SettingsScreen.js       # Live server connection tester & IP config
│       ├── services/
│       │   └── api.js                  # Live API service & offline presentation simulator
│       └── constants/
│           └── advisory.js             # Comprehensive 21-disease agronomic database
```