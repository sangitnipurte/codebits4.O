# CityPulse AI — Urban Risk Intelligence
### PS10: AI-Driven City-Scale Event Causality & Impact Prediction Engine
### Codebits 4.0 Hackathon · 2026

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Add your OpenWeather API key
Open `app.py` line 10 and replace:
```python
OPENWEATHER_API_KEY = "YOUR_API_KEY_HERE"
```
Get a **free** key at → https://openweathermap.org/api

### 3. Run the server
```bash
python app.py
```

### 4. Open in browser
```
http://localhost:5000
```
Select a city on the landing page → View live risk dashboard.

---

## 📁 Project Structure

```
citypulse/
├── app.py                  ← Flask backend (weather API + simulation engine)
├── requirements.txt
├── README.md
├── templates/
│   ├── index.html          ← City selection landing page
│   └── dashboard.html      ← CityPulse AI risk dashboard
└── static/
    ├── style.css           ← All styles
    ├── logo.png            ← (add your logo here)
    └── JS/
        └── script.js       ← Charts, flow diagram, simulation logic
```

---

## 📡 API Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | City selection landing page |
| `GET /dashboard` | Risk dashboard |
| `GET /risk?city=Mumbai` | Live risk JSON for one city |
| `GET /risk/all` | Risk JSON for all 10 cities |

### Example `/risk` Response
```json
{
  "city": "Mumbai",
  "api_live": true,
  "weather": {
    "main": "Rain",
    "description": "heavy intensity rain",
    "rain_level": "heavy",
    "temp": 29.4,
    "humidity": 88,
    "wind_speed": 5.2
  },
  "weather_type": "rain",
  "probabilities": {
    "drain_overload": 0.6512,
    "road_flooding": 0.4821,
    "traffic_congestion": 0.3944,
    "emergency_delay": 0.2531
  },
  "risk_levels": {
    "drain_overload": "high",
    "road_flooding": "moderate"
  },
  "ai_alert": "🔴 Heavy rain alert. Drain Overload risk at 65%. Avoid low-lying areas.",
  "simulation_runs": 10000
}
```

---

## 🌦️ Causal Chain Types

| Weather | Event Chain |
|---------|------------|
| 🌧️ Rain | Rain → Drain Overload → Road Flooding → Traffic Congestion → Emergency Delay |
| ⛈️ Thunderstorm | Storm → Power Outage → Flash Flood → Emergency Response → Property Damage |
| 🌫️ Haze/Fog | Haze → Visibility Loss → Air Quality Alert → Slow Traffic → Flight Delays |
| ☀️ Clear | Clear → No Drain Risk → Roads Clear → Normal Traffic → Services OK |

---

## 🔑 Key Features
- Real-time weather via **OpenWeather API**
- **Monte Carlo simulation** (10,000 runs per request)
- **AI-generated alert messages** from backend
- **5 dynamic causal chain types** — changes per weather
- **Graceful fallback** — works offline with mock data
- **10 Indian cities** supported
- Auto-refresh every 30 seconds
