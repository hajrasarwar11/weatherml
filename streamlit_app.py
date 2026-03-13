import streamlit as st
import pandas as pd
import numpy as np
import joblib
import json
import os
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

st.set_page_config(
    page_title="WeatherML — AI Weather Analytics",
    page_icon="🌧️",
    layout="wide",
    initial_sidebar_state="expanded",
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "weather_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "scripts", "ml", "model")

COLORS = [
    "#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b",
    "#ef4444", "#10b981", "#f97316", "#ec4899",
]

WEATHER_EMOJIS = {
    "Clear": "☀️", "Cloudy": "☁️", "Fog": "🌫️",
    "Freezing Precip": "🧊", "Haze": "🌁", "Other": "🌡️",
    "Rain": "🌧️", "Snow": "❄️",
}


@st.cache_data(show_spinner="Loading dataset…")
def load_data():
    df = pd.read_csv(DATA_PATH)
    df["Date/Time"] = pd.to_datetime(df["Date/Time"])
    df["Hour"] = df["Date/Time"].dt.hour
    df["Month"] = df["Date/Time"].dt.month
    df["DayOfWeek"] = df["Date/Time"].dt.dayofweek
    df["Temp_DewPoint_Diff"] = df["Temp_C"] - df["Dew Point Temp_C"]

    weather_map = {
        "Rain": "Rain", "Snow": "Snow", "Clear": "Clear",
        "Cloudy": "Cloudy", "Fog": "Fog", "Haze": "Haze",
        "Freezing Rain": "Freezing Precip",
        "Freezing Drizzle": "Freezing Precip",
        "Ice Pellets": "Freezing Precip",
        "Freezing Fog": "Fog",
        "Drizzle": "Rain",
        "Thunderstorms": "Rain",
        "Blowing Snow": "Snow",
    }
    df["WeatherGroup"] = df["Weather"].apply(
        lambda w: next(
            (v for k, v in weather_map.items() if k.lower() in str(w).lower()),
            "Other",
        )
    )
    return df


@st.cache_resource(show_spinner="Loading ML model…")
def load_model():
    model = joblib.load(os.path.join(MODEL_DIR, "weather_model.joblib"))
    le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.joblib"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.joblib"))
    with open(os.path.join(MODEL_DIR, "metadata.json")) as f:
        metadata = json.load(f)
    return model, le, scaler, metadata


def dark_chart_layout(fig, title="", height=400):
    fig.update_layout(
        title=title,
        height=height,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#94a3b8", size=12),
        title_font=dict(color="#f1f5f9", size=15),
        legend=dict(bgcolor="rgba(0,0,0,0)", bordercolor="rgba(255,255,255,0.1)"),
        xaxis=dict(gridcolor="rgba(255,255,255,0.07)", zerolinecolor="rgba(255,255,255,0.07)"),
        yaxis=dict(gridcolor="rgba(255,255,255,0.07)", zerolinecolor="rgba(255,255,255,0.07)"),
        margin=dict(l=10, r=10, t=50, b=10),
    )
    return fig


def main():
    st.markdown(
        """
        <style>
        .stApp { background-color: #0f172a; color: #f1f5f9; }
        section[data-testid="stSidebar"] { background-color: #1e293b; }
        .metric-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 1.2rem 1.4rem;
            margin-bottom: 0.5rem;
        }
        .metric-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.25rem; }
        .metric-value { font-size: 1.8rem; font-weight: 800; color: #f1f5f9; font-family: monospace; }
        .metric-sub { font-size: 0.7rem; color: #64748b; margin-top: 0.15rem; }
        .hero-badge {
            display: inline-block;
            background: rgba(59,130,246,0.12);
            border: 1px solid rgba(59,130,246,0.25);
            border-radius: 999px;
            padding: 0.3rem 0.9rem;
            color: #60a5fa;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 0.8rem;
        }
        h1, h2, h3 { color: #f1f5f9 !important; }
        </style>
        """,
        unsafe_allow_html=True,
    )

    with st.sidebar:
        st.markdown("## 🌧️ WeatherML")
        st.caption("AI Weather Analytics Platform")
        st.divider()
        page = st.radio(
            "Navigate",
            ["🏠 Overview", "🔬 EDA Explorer", "📈 Analytics", "🔮 Prediction", "📊 Performance", "ℹ️ About"],
            label_visibility="collapsed",
        )
        st.divider()
        st.caption("Random Forest · 77.6% accuracy")
        st.caption("8,782 hourly records · 8 classes")
        st.caption("Created by Hajra")

    df = load_data()
    model, le, scaler, metadata = load_model()

    if page == "🏠 Overview":
        page_overview(df, metadata)
    elif page == "🔬 EDA Explorer":
        page_eda(df)
    elif page == "📈 Analytics":
        page_analytics(df)
    elif page == "🔮 Prediction":
        page_prediction(model, le, scaler)
    elif page == "📊 Performance":
        page_performance(df, model, le, scaler, metadata)
    else:
        page_about(metadata)


def page_overview(df, metadata):
    st.markdown('<div class="hero-badge">AI Weather Analytics</div>', unsafe_allow_html=True)
    st.title("Weather Intelligence Powered by ML")
    st.markdown(
        "Explore **8,782 hourly weather records**, discover patterns, predict weather conditions "
        "with a **Random Forest** classifier achieving **77.6% accuracy**, and evaluate model performance."
    )

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown('<div class="metric-card"><div class="metric-label">Total Records</div>'
                    '<div class="metric-value">8,782</div>'
                    '<div class="metric-sub">hourly observations</div></div>', unsafe_allow_html=True)
    with c2:
        st.markdown('<div class="metric-card"><div class="metric-label">Model Accuracy</div>'
                    '<div class="metric-value">77.6%</div>'
                    '<div class="metric-sub">test set performance</div></div>', unsafe_allow_html=True)
    with c3:
        st.markdown('<div class="metric-card"><div class="metric-label">Weather Classes</div>'
                    '<div class="metric-value">8</div>'
                    '<div class="metric-sub">classification targets</div></div>', unsafe_allow_html=True)
    with c4:
        st.markdown('<div class="metric-card"><div class="metric-label">Input Features</div>'
                    '<div class="metric-value">10</div>'
                    '<div class="metric-sub">engineered features</div></div>', unsafe_allow_html=True)

    st.divider()
    col_a, col_b = st.columns(2)

    with col_a:
        class_counts = df["WeatherGroup"].value_counts().reset_index()
        class_counts.columns = ["Weather", "Count"]
        fig = px.bar(
            class_counts, x="Count", y="Weather", orientation="h",
            color="Weather", color_discrete_sequence=COLORS,
        )
        dark_chart_layout(fig, "Weather Class Distribution", 350)
        fig.update_layout(showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        monthly = df.groupby("Month")[["Temp_C", "Rel Hum_%"]].mean().reset_index()
        month_names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        monthly["MonthName"] = monthly["Month"].apply(lambda m: month_names[m - 1])
        fig2 = go.Figure()
        fig2.add_trace(go.Bar(name="Temp (°C)", x=monthly["MonthName"], y=monthly["Temp_C"], marker_color="#3b82f6"))
        fig2.add_trace(go.Bar(name="Humidity (%)", x=monthly["MonthName"], y=monthly["Rel Hum_%"], marker_color="#06b6d4"))
        dark_chart_layout(fig2, "Monthly Temperature & Humidity", 350)
        st.plotly_chart(fig2, use_container_width=True)


def page_eda(df):
    st.title("🔬 EDA Explorer")
    st.caption("Raw data exploration — feature distributions, correlations, and scatter plots.")

    numeric_cols = ["Temp_C", "Dew Point Temp_C", "Rel Hum_%", "Wind Speed_km/h", "Visibility_km", "Press_kPa"]

    tab1, tab2, tab3 = st.tabs(["📊 Distributions", "🔗 Correlation Matrix", "✦ Scatter Plot"])

    with tab1:
        selected = st.multiselect("Select features", numeric_cols, default=numeric_cols[:4])
        if selected:
            cols = st.columns(min(len(selected), 2))
            for i, col in enumerate(selected):
                with cols[i % 2]:
                    fig = px.histogram(df, x=col, nbins=40, color_discrete_sequence=[COLORS[i % len(COLORS)]])
                    dark_chart_layout(fig, col, 280)
                    st.plotly_chart(fig, use_container_width=True)

    with tab2:
        corr = df[numeric_cols].corr()
        fig = px.imshow(
            corr, text_auto=".2f", aspect="auto",
            color_continuous_scale="RdBu_r", zmin=-1, zmax=1,
        )
        dark_chart_layout(fig, "Feature Correlation Heatmap", 500)
        fig.update_traces(textfont_size=11)
        st.plotly_chart(fig, use_container_width=True)

    with tab3:
        c1, c2 = st.columns(2)
        with c1:
            x_col = st.selectbox("X axis", numeric_cols, index=0)
        with c2:
            y_col = st.selectbox("Y axis", numeric_cols, index=2)

        sample = df.sample(min(1500, len(df)), random_state=42)
        fig = px.scatter(
            sample, x=x_col, y=y_col, color="WeatherGroup",
            color_discrete_sequence=COLORS, opacity=0.65,
            hover_data=["WeatherGroup"],
        )
        dark_chart_layout(fig, f"{x_col} vs {y_col}", 450)
        st.plotly_chart(fig, use_container_width=True)

    with st.expander("📋 Dataset Sample (first 50 rows)"):
        st.dataframe(df.head(50), use_container_width=True)


def page_analytics(df):
    st.title("📈 Weather Analytics")

    month_names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    monthly = df.groupby("Month").agg({
        "Temp_C": "mean", "Dew Point Temp_C": "mean",
        "Rel Hum_%": "mean", "Wind Speed_km/h": "mean",
        "Visibility_km": "mean", "Press_kPa": "mean",
    }).reset_index()
    monthly["MonthName"] = monthly["Month"].apply(lambda m: month_names[m - 1])

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Hottest Recorded</div>'
                    f'<div class="metric-value" style="color:#ef4444">{df["Temp_C"].max():.1f}°C</div></div>',
                    unsafe_allow_html=True)
    with c2:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Coldest Recorded</div>'
                    f'<div class="metric-value" style="color:#3b82f6">{df["Temp_C"].min():.1f}°C</div></div>',
                    unsafe_allow_html=True)
    with c3:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Avg Humidity</div>'
                    f'<div class="metric-value" style="color:#06b6d4">{df["Rel Hum_%"].mean():.1f}%</div></div>',
                    unsafe_allow_html=True)
    with c4:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Avg Wind Speed</div>'
                    f'<div class="metric-value" style="color:#10b981">{df["Wind Speed_km/h"].mean():.1f} km/h</div></div>',
                    unsafe_allow_html=True)

    st.divider()

    col_a, col_b = st.columns(2)
    with col_a:
        class_counts = df["WeatherGroup"].value_counts().reset_index()
        class_counts.columns = ["Weather", "Count"]
        fig = px.bar(
            class_counts, x="Count", y="Weather", orientation="h",
            color="Weather", color_discrete_sequence=COLORS,
            text="Count",
        )
        dark_chart_layout(fig, "Weather Type Frequency", 380)
        fig.update_layout(showlegend=False)
        fig.update_traces(textposition="outside")
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        fig2 = go.Figure()
        fig2.add_trace(go.Scatter(
            x=monthly["MonthName"], y=monthly["Temp_C"],
            name="Temperature (°C)", mode="lines+markers",
            line=dict(color="#3b82f6", width=3),
            marker=dict(size=7),
        ))
        fig2.add_trace(go.Scatter(
            x=monthly["MonthName"], y=monthly["Dew Point Temp_C"],
            name="Dew Point (°C)", mode="lines+markers",
            line=dict(color="#8b5cf6", width=2, dash="dot"),
            marker=dict(size=5),
        ))
        dark_chart_layout(fig2, "Temperature Trend (Monthly Avg)", 380)
        st.plotly_chart(fig2, use_container_width=True)

    col_c, col_d = st.columns(2)
    with col_c:
        fig3 = go.Figure()
        fig3.add_trace(go.Bar(
            x=monthly["MonthName"], y=monthly["Wind Speed_km/h"],
            name="Wind Speed (km/h)", marker_color="#10b981",
        ))
        dark_chart_layout(fig3, "Monthly Wind Speed", 320)
        st.plotly_chart(fig3, use_container_width=True)

    with col_d:
        fig4 = go.Figure()
        fig4.add_trace(go.Scatter(
            x=monthly["MonthName"], y=monthly["Press_kPa"],
            mode="lines+markers", fill="tozeroy",
            line=dict(color="#8b5cf6", width=3),
            fillcolor="rgba(139,92,246,0.12)",
            marker=dict(size=7),
        ))
        dark_chart_layout(fig4, "Monthly Pressure (kPa)", 320)
        st.plotly_chart(fig4, use_container_width=True)


def page_prediction(model, le, scaler):
    st.title("🔮 Weather Prediction")
    st.markdown("Enter current sensor readings to classify the weather condition.")

    col_l, col_r = st.columns([1, 1])

    with col_l:
        st.subheader("Sensor Inputs")
        temp = st.slider("Temperature (°C)", -30.0, 40.0, 15.0, 0.1)
        dew_point = st.slider("Dew Point (°C)", -30.0, 30.0, 5.0, 0.1)
        rel_hum = st.slider("Relative Humidity (%)", 0, 100, 72)
        wind_speed = st.slider("Wind Speed (km/h)", 0.0, 120.0, 14.0, 0.5)
        visibility = st.slider("Visibility (km)", 0.0, 50.0, 24.0, 0.5)
        pressure = st.slider("Pressure (kPa)", 96.0, 105.0, 101.2, 0.1)

    with col_r:
        st.subheader("Time Context")
        hour = st.slider("Hour of Day", 0, 23, 12)
        month = st.slider("Month", 1, 12, 6, format="%d")
        dow_name = st.selectbox("Day of Week", ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"])
        day_of_week = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].index(dow_name)

        temp_dew_diff = temp - dew_point
        features = np.array([[temp, dew_point, rel_hum, wind_speed, visibility,
                               pressure, hour, month, day_of_week, temp_dew_diff]])
        features_scaled = scaler.transform(features)
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        predicted_label = le.inverse_transform([prediction])[0]
        confidence = float(max(probabilities))

        emoji = WEATHER_EMOJIS.get(predicted_label, "🌡️")
        st.markdown(f"### Prediction")
        st.markdown(
            f'<div class="metric-card" style="text-align:center">'
            f'<div style="font-size:3rem">{emoji}</div>'
            f'<div style="font-size:1.6rem;font-weight:800;color:#f1f5f9">{predicted_label}</div>'
            f'<div style="color:#60a5fa;font-weight:700">{confidence*100:.1f}% confidence</div>'
            f'</div>',
            unsafe_allow_html=True,
        )

        st.markdown("#### Class Probabilities")
        prob_df = pd.DataFrame({
            "Weather": le.classes_,
            "Probability": probabilities,
        }).sort_values("Probability", ascending=True)

        fig = px.bar(
            prob_df, x="Probability", y="Weather", orientation="h",
            color="Probability", color_continuous_scale="Blues",
            range_x=[0, 1], text=prob_df["Probability"].apply(lambda p: f"{p*100:.1f}%"),
        )
        dark_chart_layout(fig, "", 300)
        fig.update_layout(coloraxis_showscale=False)
        fig.update_traces(textposition="outside")
        st.plotly_chart(fig, use_container_width=True)


def page_performance(df, model, le, scaler, metadata):
    st.title("📊 Model Performance")

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Test Accuracy</div>'
                    f'<div class="metric-value" style="color:#10b981">{metadata["test_accuracy"]*100:.1f}%</div></div>',
                    unsafe_allow_html=True)
    with c2:
        st.markdown(f'<div class="metric-card"><div class="metric-label">CV Accuracy</div>'
                    f'<div class="metric-value" style="color:#3b82f6">{metadata["cv_accuracy"]*100:.1f}%</div></div>',
                    unsafe_allow_html=True)
    with c3:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Estimators</div>'
                    f'<div class="metric-value">{metadata["best_params"]["n_estimators"]}</div>'
                    f'<div class="metric-sub">Random Forest trees</div></div>',
                    unsafe_allow_html=True)

    st.subheader("Best Hyperparameters (GridSearchCV)")
    params = metadata["best_params"]
    param_df = pd.DataFrame([{
        "n_estimators": params["n_estimators"],
        "max_depth": str(params["max_depth"]),
        "min_samples_split": params["min_samples_split"],
        "min_samples_leaf": params["min_samples_leaf"],
    }])
    st.dataframe(param_df, use_container_width=True, hide_index=True)

    st.subheader("Feature Importances")
    importances = model.feature_importances_
    feat_names = metadata["feature_columns"]
    fi_df = pd.DataFrame({"Feature": feat_names, "Importance": importances}).sort_values(
        "Importance", ascending=True
    )
    fig = px.bar(
        fi_df, x="Importance", y="Feature", orientation="h",
        color="Importance", color_continuous_scale="Blues", text=fi_df["Importance"].apply(lambda v: f"{v:.3f}"),
    )
    dark_chart_layout(fig, "", 380)
    fig.update_layout(coloraxis_showscale=False)
    fig.update_traces(textposition="outside")
    st.plotly_chart(fig, use_container_width=True)


def page_about(metadata):
    st.title("ℹ️ About WeatherML")
    st.markdown(
        '<div class="hero-badge">Created by Hajra</div>',
        unsafe_allow_html=True,
    )
    st.markdown(
        """
        A complete **end-to-end machine learning project** that combines data science (EDA),
        predictive modelling (**Random Forest with GridSearchCV**), and an interactive dashboard.
        Built to classify weather conditions into **8 categories** from **8,782 hourly sensor readings**.
        """
    )

    st.divider()
    st.subheader("🔬 ML Pipeline")
    pipeline_steps = [
        ("1. Data Collection", "8,782 hourly weather observations with 13 features including temperature, humidity, wind speed, visibility, and pressure."),
        ("2. Preprocessing", "Handle missing values, encode weather categories into 8 groups, engineer time-based features (Hour, Month, DayOfWeek, Temp-DewPoint diff)."),
        ("3. EDA & Analysis", "Explore distributions, correlations, class imbalances. Generate statistical summaries and visualisations."),
        ("4. Feature Engineering", "4 derived features from timestamps and sensor data — 10 total model inputs."),
        ("5. Model Training", "Random Forest with GridSearchCV. 80/20 train-test split. 200 estimators."),
        ("6. Evaluation", "77.6% test accuracy. Model saved with joblib for real-time inference."),
    ]
    cols = st.columns(2)
    for i, (title, desc) in enumerate(pipeline_steps):
        with cols[i % 2]:
            st.markdown(f"**{title}**")
            st.caption(desc)
            st.markdown("")

    st.divider()
    st.subheader("🛠️ Tech Stack")
    tech = {
        "ML": ["Python 3", "scikit-learn", "Random Forest", "GridSearchCV", "pandas", "numpy", "joblib"],
        "Dashboard": ["Streamlit", "Plotly"],
        "Full-stack App": ["React", "Vite", "TypeScript", "Tailwind CSS", "Recharts", "Framer Motion", "Express.js"],
    }
    cols2 = st.columns(3)
    for i, (cat, items) in enumerate(tech.items()):
        with cols2[i]:
            st.markdown(f"**{cat}**")
            for item in items:
                st.markdown(f"- {item}")

    st.divider()
    st.subheader("🚀 Future Scope")
    future = [
        "XGBoost and Deep Learning model comparison with accuracy benchmarks",
        "Export predictions and reports as downloadable PDF",
        "Historical trend analysis with custom date-range selectors",
        "Multi-region support — save and compare multiple cities",
    ]
    for item in future:
        st.markdown(f"→ {item}")


if __name__ == "__main__":
    main()
