Perfect 👍 — here’s a **short, polished README.md just for the `frontend/` folder**.
This will make your React Native part look professional and demo-ready.

---

# 📱 AgriMind-X Frontend (React Native)

This is the **mobile-first interface** for **AgriMind-X**, a multimodal, multi-agent AI platform for sustainable farming.
The frontend is designed with **simplicity and accessibility** in mind — enabling farmers to interact via **voice, photos, and simple forms** in their local language.

---

## 🚀 Features

* **Voice Input** → Ask farming/finance questions in Hindi or English.
* **Camera Integration** → Take crop leaf photos for PestGuard disease detection.
* **OCR Integration** → Scan subsidy/loan documents for FinanceFlow.
* **Dashboard** → View agent recommendations, market forecasts, and sustainability impact.
* **Consent Gate** → Farmers approve/reject AI actions before execution.

---

## 📂 Project Structure

```
frontend/
├── App.js               # Root app entrypoint
├── README.md            # This file
├── screens/             # Screen components
│   ├── HomeScreen.js
│   ├── PestGuardScreen.js
│   ├── IrrigAIScreen.js
│   ├── FinanceFlowScreen.js
│   └── MarketScreen.js
└── components/          # Reusable UI components
    ├── VoiceButton.js
    ├── PhotoPicker.js
    └── Card.js
```

---

## ⚡ Quickstart

1. Install dependencies:

   ```bash
   npm install -g expo-cli
   npm install
   ```
2. Run the app:

   ```bash
   expo start
   ```
3. Open in your device with the Expo Go app (Android/iOS) or in a simulator.

---

## 🔌 API Integration

Set the backend API base URL in `App.js`:

```javascript
const API_BASE = "http://<your-ip>:8000";
```

Endpoints you’ll call:

* `POST /infer/pestguard` → Upload image for disease detection
* `POST /decide/irrigai` → Get irrigation recommendation
* `POST /ocr/financeflow` → Extract fields from scanned doc
* `POST /finance/submit` → Submit loan/subsidy form
* `GET /market/forecast` → Get market prediction
* `GET /events/recent` → Recent actions log

---

## 🎨 Design Principles

* **Farmer-friendly UI** → Large buttons, high contrast, bilingual labels.
* **Offline-first** → Cache recent recommendations for poor connectivity.
* **Modular screens** → Easy to extend with more agents.

---

## 📅 Hackathon Demo Flow (Frontend)

1. **Home Screen** → Farmer chooses voice, photo, or document input.
2. **PestGuard Screen** → Capture/upload leaf → get treatment suggestion.
3. **IrrigAI Screen** → Ask “When to water?” → get irrigation plan.
4. **FinanceFlow Screen** → Scan subsidy form → auto-filled preview → approve.
5. **Market Screen** → See “Sell/Hold” recommendation.
6. **Dashboard** → Review actions, savings, and impacts.

---

## 🔮 Future Roadmap

* Add **push notifications** for urgent crop/finance alerts.
* Offline **on-device AI inference** for disease detection.
* Multilingual **text-to-speech output**.
* **Progressive Web App (PWA)** wrapper for wider device compatibility.

---

## 📜 License

MIT
