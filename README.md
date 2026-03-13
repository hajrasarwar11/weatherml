# 🌧️ WeatherML — AI Weather Analytics Platform

> A complete end-to-end machine learning project: Random Forest classifier trained on 8,782 hourly weather records, achieving **77.6% test accuracy**, with an interactive Streamlit dashboard for exploration, analytics, and live predictions.

**Created by Hajra**

---

## 📸 Features

| Page | Description |
|------|-------------|
| 🏠 Overview | Dataset snapshot, class distribution, monthly climate charts |
| 🔬 EDA Explorer | Feature distributions, correlation heatmap, interactive scatter plots |
| 📈 Analytics | Monthly temperature/humidity/wind/pressure trends, record extremes |
| 🔮 Prediction | Real-time weather classification from sensor inputs with probability breakdown |
| 📊 Performance | Feature importances, GridSearchCV hyperparameters, accuracy metrics |
| ℹ️ About | ML pipeline walkthrough, tech stack, future scope |

---

## 🚀 Deploy on Streamlit Cloud

1. **Fork / push this repo to GitHub** (see steps below)
2. Go to [streamlit.io/cloud](https://streamlit.io/cloud) → **New app**
3. Select your GitHub repo
4. Set **Main file path** → `streamlit_app.py`
5. Click **Deploy** — done!

No environment variables or secrets are needed for the Streamlit version.

---

## 💻 Run Locally

```bash
# Clone the repo
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# Install dependencies
pip install -r requirements.txt

# Launch the Streamlit app
streamlit run streamlit_app.py
```

The app will open at `http://localhost:8501`.

---

## 📁 Project Structure

```
WeatherML/
├── streamlit_app.py          # Streamlit dashboard (Streamlit Cloud entry point)
├── requirements.txt          # Python dependencies for Streamlit Cloud
├── README.md
│
├── data/
│   └── weather_data.csv      # 8,782 hourly weather observations
│
├── scripts/
│   └── ml/
│       ├── train_model.py    # Full ML pipeline (EDA → preprocessing → training → evaluation)
│       ├── predict.py        # CLI prediction script (used by the Express API)
│       └── model/
│           ├── weather_model.joblib   # Trained Random Forest model
│           ├── label_encoder.joblib   # Weather class encoder
│           ├── scaler.joblib          # StandardScaler
│           ├── metadata.json          # Hyperparameters & accuracy scores
│           └── stats.json             # Aggregated dataset statistics for the API
│
└── artifacts/
    ├── weather-dashboard/    # React + Vite + TypeScript frontend
    └── api-server/           # Express.js REST API + OpenWeatherMap proxy
```

---

## 🧠 ML Pipeline

### Dataset
- **Source**: Hourly weather station records
- **Size**: 8,782 rows × 13 columns
- **Target**: `Weather` column mapped to 8 grouped classes

### Weather Classes
`Clear` · `Cloudy` · `Rain` · `Snow` · `Fog` · `Haze` · `Freezing Precip` · `Other`

### Pipeline Steps

```
Raw CSV → Missing value imputation → Feature engineering
       → Label encoding → Train/test split (80/20)
       → StandardScaler → GridSearchCV (Random Forest)
       → Evaluate → Save model with joblib
```

### Engineered Features (10 total)
| Feature | Source |
|---------|--------|
| `Temp_C` | Sensor |
| `Dew Point Temp_C` | Sensor |
| `Rel Hum_%` | Sensor |
| `Wind Speed_km/h` | Sensor |
| `Visibility_km` | Sensor |
| `Press_kPa` | Sensor |
| `Hour` | DateTime |
| `Month` | DateTime |
| `DayOfWeek` | DateTime |
| `Temp_DewPoint_Diff` | Engineered |

### Best Hyperparameters (GridSearchCV)
```json
{
  "n_estimators": 200,
  "max_depth": null,
  "min_samples_split": 2,
  "min_samples_leaf": 1
}
```

### Results
| Metric | Score |
|--------|-------|
| CV Accuracy | 76.6% |
| **Test Accuracy** | **77.6%** |

---

## 🛠️ Tech Stack

**ML & Data Science**
- Python 3.11, scikit-learn, pandas, numpy, joblib

**Streamlit Dashboard**
- Streamlit, Plotly

**Full-Stack Web App** *(separate from Streamlit)*
- React 18, Vite, TypeScript, Tailwind CSS, Recharts, Framer Motion
- Express.js, Node.js
- OpenWeatherMap API (live weather, forecasts, map tiles, alerts)

---

## 🗺️ Pushing to GitHub

If you're pushing this project to GitHub for the first time:

```bash
# 1. Initialise git (if not already done)
git init

# 2. Add your GitHub repo as remote
git remote add origin https://github.com/<your-username>/<your-repo>.git

# 3. Stage and commit everything
git add .
git commit -m "Initial commit — WeatherML AI Platform"

# 4. Push
git push -u origin main
```

> **Tip**: Make sure `data/weather_data.csv` and `scripts/ml/model/*.joblib` are committed — Streamlit Cloud needs them at runtime.

---

## 🔮 Future Scope

- XGBoost and Deep Learning model comparison with accuracy benchmarks
- Export predictions and reports as downloadable PDF
- Historical trend analysis with custom date-range selectors
- Multi-region support — save and compare multiple cities

---

## 📄 License

MIT © 2026 Hajra
