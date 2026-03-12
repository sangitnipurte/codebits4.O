import requests
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# ─────────────────────────────────────────
# CONFIG — Get free key at openweathermap.org
# ─────────────────────────────────────────
OPENWEATHER_API_KEY = "yourapikey"
SIMULATION_RUNS = 10000

# ─────────────────────────────────────────
# RAIN LEVEL CLASSIFIER
# ─────────────────────────────────────────
RAIN_DESCRIPTION_MAP = {
    "light intensity drizzle": "light",
    "drizzle": "light",
    "heavy intensity drizzle": "moderate",
    "light intensity drizzle rain": "light",
    "drizzle rain": "moderate",
    "heavy intensity drizzle rain": "moderate",
    "shower rain and drizzle": "moderate",
    "heavy shower rain and drizzle": "heavy",
    "shower drizzle": "light",
    "light rain": "light",
    "moderate rain": "moderate",
    "heavy intensity rain": "heavy",
    "very heavy rain": "heavy",
    "extreme rain": "extreme",
    "freezing rain": "moderate",
    "light intensity shower rain": "light",
    "shower rain": "moderate",
    "heavy intensity shower rain": "heavy",
    "ragged shower rain": "moderate",
    "thunderstorm with light rain": "moderate",
    "thunderstorm with rain": "heavy",
    "thunderstorm with heavy rain": "extreme",
    "thunderstorm with light drizzle": "light",
    "thunderstorm with drizzle": "moderate",
    "thunderstorm": "heavy",
    "light thunderstorm": "moderate",
    "heavy thunderstorm": "extreme",
    "ragged thunderstorm": "extreme",
}

# ─────────────────────────────────────────
# MONTE CARLO PROBABILITIES
# ─────────────────────────────────────────
DRAIN_OVERLOAD_PROB     = {"none": 0.01, "light": 0.08, "moderate": 0.35, "heavy": 0.65, "extreme": 0.85}
ROAD_FLOOD_PROB         = {True: 0.70, False: 0.02}
TRAFFIC_CONGESTION_PROB = {True: 0.75, False: 0.18}
EMERGENCY_DELAY_PROB    = {True: 0.60, False: 0.08}

# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────
def risk_label(p):
    if p < 0.20: return "low"
    if p < 0.50: return "moderate"
    if p < 0.75: return "high"
    return "critical"

def classify_rain(main, description):
    if main not in ["Rain", "Drizzle", "Thunderstorm"]:
        return "none"
    return RAIN_DESCRIPTION_MAP.get(description.lower(), "moderate")

def get_weather_type(main):
    if main == "Thunderstorm": return "thunderstorm"
    if main in ["Rain", "Drizzle"]: return "rain"
    if main in ["Haze","Smoke","Dust","Sand","Fog","Mist","Ash","Squall"]: return "haze"
    return "clear"

def ai_alert(weather_type, rain_level, probs):
    """Generate contextual AI alert based on simulation results."""
    max_prob = max(probs.values()) if probs else 0
    max_key  = max(probs, key=probs.get) if probs else ""
    key_label = max_key.replace("_", " ").title()

    if weather_type == "thunderstorm":
        if max_prob > 0.70:
            return f"🚨 CRITICAL: Thunderstorm active. {key_label} at {max_prob*100:.0f}%. Evacuate flood-prone zones. Emergency services on high alert."
        return f"⚠️ Thunderstorm detected. Monitor {key_label} ({max_prob*100:.0f}%). Avoid travel and secure structures."

    if weather_type == "rain":
        if rain_level == "extreme":
            return "🚨 EXTREME rainfall. Drain overload imminent. Road flooding likely. Emergency services may be delayed — stay indoors."
        if rain_level == "heavy":
            return f"🔴 Heavy rain alert. {key_label} risk at {max_prob*100:.0f}%. Avoid low-lying areas and underpasses."
        if rain_level == "moderate":
            return f"⚠️ Moderate rainfall detected. Possible waterlogging. {key_label} probability: {max_prob*100:.0f}%."
        if rain_level == "light":
            return f"🌧️ Light rain. Low immediate risk. Monitor {key_label.lower()} zones."
        return "✅ No significant rainfall. All systems nominal."

    if weather_type == "haze":
        return f"🌫️ Haze detected. Visibility reduced. {key_label} at {max_prob*100:.0f}%. Wear masks outdoors."

    return "✅ Weather stable. No significant urban risk detected. All systems operational."

# ─────────────────────────────────────────
# SIMULATION ENGINES
# ─────────────────────────────────────────
def simulate_rain(rain_level, runs=SIMULATION_RUNS):
    drain = flood = traffic = delay = 0
    for _ in range(runs):
        d = random.random() < DRAIN_OVERLOAD_PROB[rain_level]; drain += d
        f = random.random() < (ROAD_FLOOD_PROB[True] if d else ROAD_FLOOD_PROB[False]); flood += f
        t = random.random() < (TRAFFIC_CONGESTION_PROB[True] if f else TRAFFIC_CONGESTION_PROB[False]); traffic += t
        e = random.random() < (EMERGENCY_DELAY_PROB[True] if t else EMERGENCY_DELAY_PROB[False]); delay += e
    return {
        "drain_overload":     round(drain   / runs, 4),
        "road_flooding":      round(flood   / runs, 4),
        "traffic_congestion": round(traffic / runs, 4),
        "emergency_delay":    round(delay   / runs, 4),
    }

def simulate_thunderstorm(runs=SIMULATION_RUNS):
    p = f = e = d = 0
    for _ in range(runs):
        po = random.random() < 0.72; p += po
        ff = random.random() < 0.80; f += ff
        er = random.random() < (0.75 if ff else 0.20); e += er
        pd = random.random() < (0.65 if (po and ff) else 0.15); d += pd
    return {
        "power_outage":       round(p / runs, 4),
        "flash_flood":        round(f / runs, 4),
        "emergency_response": round(e / runs, 4),
        "property_damage":    round(d / runs, 4),
    }

def simulate_haze(runs=SIMULATION_RUNS):
    v = a = t = f = 0
    for _ in range(runs):
        vl = random.random() < 0.70; v += vl
        aq = random.random() < 0.65; a += aq
        st = random.random() < (0.55 if vl else 0.15); t += st
        fd = random.random() < (0.40 if (vl and aq) else 0.10); f += fd
    return {
        "visibility_loss": round(v / runs, 4),
        "air_quality":     round(a / runs, 4),
        "slow_traffic":    round(t / runs, 4),
        "flight_delays":   round(f / runs, 4),
    }

def simulate_clear():
    return {
        "no_drain_risk":  round(0.02 + random.random() * 0.03, 4),
        "roads_clear":    round(0.94 + random.random() * 0.03, 4),
        "normal_traffic": round(0.88 + random.random() * 0.05, 4),
        "services_ok":    round(0.96 + random.random() * 0.02, 4),
    }

SIMULATORS = {
    "rain":         simulate_rain,
    "thunderstorm": simulate_thunderstorm,
    "haze":         simulate_haze,
    "clear":        simulate_clear,
}

# ─────────────────────────────────────────
# FALLBACK DATA (if API is unavailable)
# ─────────────────────────────────────────
FALLBACK = {
    "Pune":      {"main":"Rain",         "description":"moderate rain",               "temp":27, "humidity":80, "wind_speed":3.2},
    "Mumbai":    {"main":"Rain",         "description":"heavy intensity rain",         "temp":29, "humidity":88, "wind_speed":5.1},
    "Delhi":     {"main":"Haze",         "description":"haze",                         "temp":32, "humidity":55, "wind_speed":2.0},
    "Bengaluru": {"main":"Rain",         "description":"light intensity shower rain",  "temp":23, "humidity":72, "wind_speed":2.8},
    "Chennai":   {"main":"Thunderstorm", "description":"thunderstorm with heavy rain", "temp":31, "humidity":90, "wind_speed":6.0},
    "Hyderabad": {"main":"Rain",         "description":"moderate rain",               "temp":28, "humidity":75, "wind_speed":3.5},
    "Kolkata":   {"main":"Thunderstorm", "description":"thunderstorm with rain",      "temp":30, "humidity":85, "wind_speed":4.8},
    "Ahmedabad": {"main":"Clear",        "description":"clear sky",                   "temp":34, "humidity":40, "wind_speed":2.5},
    "Nagpur":    {"main":"Rain",         "description":"moderate rain",               "temp":29, "humidity":78, "wind_speed":3.0},
    "Surat":     {"main":"Rain",         "description":"heavy intensity rain",         "temp":30, "humidity":82, "wind_speed":4.2},
}

# ─────────────────────────────────────────
# WEATHER FETCH
# ─────────────────────────────────────────
def fetch_weather(city):
    try:
        url = (f"https://api.openweathermap.org/data/2.5/weather"
               f"?q={city},IN&appid={OPENWEATHER_API_KEY}&units=metric")
        r = requests.get(url, timeout=6)
        r.raise_for_status()
        d = r.json()
        return {
            "main":        d["weather"][0]["main"],
            "description": d["weather"][0]["description"],
            "temp":        round(d["main"]["temp"], 1),
            "feels_like":  round(d["main"]["feels_like"], 1),
            "humidity":    d["main"]["humidity"],
            "wind_speed":  d["wind"]["speed"],
            "icon":        d["weather"][0]["icon"],
            "city":        d["name"],
            "country":     d["sys"]["country"],
        }, None
    except Exception as e:
        return None, str(e)

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/risk")
def risk():
    city = request.args.get("city", "Pune").strip()

    weather, err = fetch_weather(city)
    api_live = True

    if not weather:
        weather  = FALLBACK.get(city, FALLBACK["Pune"]).copy()
        weather.update({"city": city, "country": "IN", "icon": "01d", "feels_like": weather["temp"]})
        api_live = False

    main        = weather["main"]
    description = weather.get("description", "")
    rain_level  = classify_rain(main, description)
    wtype       = get_weather_type(main)

    sim   = SIMULATORS[wtype]
    probs = sim(rain_level) if wtype == "rain" else sim()
    risks = {k: risk_label(v) for k, v in probs.items()}
    alert = ai_alert(wtype, rain_level, probs)

    return jsonify({
        "city":           city,
        "api_live":       api_live,
        "weather": {
            "main":        main,
            "description": description,
            "rain_level":  rain_level,
            "temp":        weather.get("temp"),
            "feels_like":  weather.get("feels_like"),
            "humidity":    weather.get("humidity"),
            "wind_speed":  weather.get("wind_speed"),
            "icon":        weather.get("icon", "01d"),
            "country":     weather.get("country", "IN"),
        },
        "weather_type":    wtype,
        "probabilities":   probs,
        "risk_levels":     risks,
        "ai_alert":        alert,
        "simulation_runs": SIMULATION_RUNS,
    })

@app.route("/risk/all")
def risk_all():
    cities  = list(FALLBACK.keys())
    results = {}
    for city in cities:
        weather, _ = fetch_weather(city)
        if not weather:
            weather = FALLBACK.get(city, FALLBACK["Pune"]).copy()
        main  = weather["main"]
        desc  = weather.get("description", "")
        rl    = classify_rain(main, desc)
        wtype = get_weather_type(main)
        sim   = SIMULATORS[wtype]
        probs = sim(rl) if wtype == "rain" else sim()
        results[city] = {
            "weather_type": wtype,
            "rain_level":   rl,
            "temp":         weather.get("temp"),
            "probabilities": probs,
            "risk_levels":  {k: risk_label(v) for k, v in probs.items()},
            "ai_alert":     ai_alert(wtype, rl, probs),
        }
    return jsonify(results)

# ─────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*52)
    print("  CityPulse AI — Urban Risk Intelligence System")
    print("  Dashboard: http://localhost:5000")
    print("  API:       http://localhost:5000/risk?city=Pune")
    print("="*52 + "\n")
    app.run(debug=True, port=5000)
