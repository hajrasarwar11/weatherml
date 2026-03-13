import streamlit as st
import pandas as pd
import numpy as np
import joblib
import json
import os
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

st.set_page_config(
    page_title="WeatherML — AI Weather Analytics",
    page_icon="🌧️",
    layout="wide",
    initial_sidebar_state="expanded",
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "weather_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "scripts", "ml", "model")

COLORS = ["#3b82f6","#8b5cf6","#06b6d4","#f59e0b","#ef4444","#10b981","#f97316","#ec4899"]
WEATHER_EMOJIS = {
    "Clear": "☀️", "Cloudy": "☁️", "Fog": "🌫️",
    "Freezing Precip": "🧊", "Haze": "🌁", "Other": "🌡️",
    "Rain": "🌧️", "Snow": "❄️",
}
MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

plt.rcParams.update({
    "figure.facecolor": "#0f172a",
    "axes.facecolor": "#1e293b",
    "axes.edgecolor": "#334155",
    "axes.labelcolor": "#94a3b8",
    "xtick.color": "#94a3b8",
    "ytick.color": "#94a3b8",
    "text.color": "#f1f5f9",
    "grid.color": "#1e293b",
    "grid.linewidth": 0.5,
})


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
        "Freezing Rain": "Freezing Precip", "Freezing Drizzle": "Freezing Precip",
        "Ice Pellets": "Freezing Precip", "Freezing Fog": "Fog",
        "Drizzle": "Rain", "Thunderstorms": "Rain", "Blowing Snow": "Snow",
    }
    df["WeatherGroup"] = df["Weather"].apply(
        lambda w: next((v for k, v in weather_map.items() if k.lower() in str(w).lower()), "Other")
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


def metric_card(label, value, sub="", color="#3b82f6"):
    st.markdown(
        f"""<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
        border-radius:12px;padding:1.1rem 1.3rem;margin-bottom:0.5rem">
        <div style="font-size:0.72rem;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em">{label}</div>
        <div style="font-size:1.7rem;font-weight:800;color:{color};font-family:monospace">{value}</div>
        <div style="font-size:0.68rem;color:#64748b;margin-top:0.1rem">{sub}</div></div>""",
        unsafe_allow_html=True,
    )


def fig_to_st(fig):
    st.pyplot(fig, use_container_width=True)
    plt.close(fig)


def main():
    st.markdown(
        """<style>
        .stApp{background-color:#0f172a;color:#f1f5f9}
        section[data-testid="stSidebar"]{background-color:#1e293b}
        h1,h2,h3{color:#f1f5f9!important}
        .stRadio label{color:#94a3b8}
        </style>""",
        unsafe_allow_html=True,
    )

    with st.sidebar:
        st.markdown("## 🌧️ WeatherML")
        st.caption("AI Weather Analytics Platform")
        st.divider()
        page = st.radio(
            "Navigate",
            ["🏠 Overview","🔬 EDA Explorer","📈 Analytics","🔮 Prediction","📊 Performance","ℹ️ About"],
            label_visibility="collapsed",
        )
        st.divider()
        st.caption("Random Forest · 77.6% accuracy")
        st.caption("8,782 hourly records · 8 classes")
        st.caption("Created by Hajra")

    df = load_data()
    model, le, scaler, metadata = load_model()

    if page == "🏠 Overview":
        page_overview(df)
    elif page == "🔬 EDA Explorer":
        page_eda(df)
    elif page == "📈 Analytics":
        page_analytics(df)
    elif page == "🔮 Prediction":
        page_prediction(model, le, scaler)
    elif page == "📊 Performance":
        page_performance(model, metadata)
    else:
        page_about()


def page_overview(df):
    st.markdown('<div style="display:inline-block;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.25);border-radius:999px;padding:0.3rem 0.9rem;color:#60a5fa;font-size:0.8rem;font-weight:600;margin-bottom:0.8rem">AI Weather Analytics</div>', unsafe_allow_html=True)
    st.title("Weather Intelligence Powered by ML")
    st.markdown("Explore **8,782 hourly weather records**, discover patterns, and predict weather conditions with a **Random Forest** classifier achieving **77.6% accuracy**.")

    c1, c2, c3, c4 = st.columns(4)
    with c1: metric_card("Total Records", "8,782", "hourly observations")
    with c2: metric_card("Model Accuracy", "77.6%", "test set performance", "#10b981")
    with c3: metric_card("Weather Classes", "8", "classification targets", "#8b5cf6")
    with c4: metric_card("Input Features", "10", "engineered features", "#f59e0b")

    st.divider()
    col_a, col_b = st.columns(2)

    with col_a:
        st.subheader("Weather Class Distribution")
        counts = df["WeatherGroup"].value_counts()
        fig, ax = plt.subplots(figsize=(6, 4))
        bars = ax.barh(counts.index.tolist(), counts.values, color=COLORS[:len(counts)])
        ax.set_xlabel("Count")
        ax.spines[["top","right"]].set_visible(False)
        for bar, val in zip(bars, counts.values):
            ax.text(bar.get_width() + 30, bar.get_y() + bar.get_height()/2, str(val), va="center", fontsize=9, color="#94a3b8")
        fig_to_st(fig)

    with col_b:
        st.subheader("Monthly Temperature & Humidity")
        monthly = df.groupby("Month")[["Temp_C", "Rel Hum_%"]].mean()
        months = [MONTH_NAMES[m - 1] for m in monthly.index]
        x = np.arange(len(months))
        fig, ax1 = plt.subplots(figsize=(6, 4))
        ax2 = ax1.twinx()
        ax1.bar(x - 0.2, monthly["Temp_C"], 0.4, color="#3b82f6", label="Temp (°C)")
        ax2.bar(x + 0.2, monthly["Rel Hum_%"], 0.4, color="#06b6d4", label="Humidity (%)")
        ax1.set_xticks(x); ax1.set_xticklabels(months, fontsize=8)
        ax1.set_ylabel("Temp (°C)", color="#3b82f6")
        ax2.set_ylabel("Humidity (%)", color="#06b6d4")
        ax1.spines[["top"]].set_visible(False)
        fig.legend(loc="upper left", bbox_to_anchor=(0.1, 0.95), framealpha=0)
        fig_to_st(fig)


def page_eda(df):
    st.title("🔬 EDA Explorer")
    st.caption("Raw data exploration — feature distributions, correlations, and scatter plots.")

    numeric_cols = ["Temp_C","Dew Point Temp_C","Rel Hum_%","Wind Speed_km/h","Visibility_km","Press_kPa"]
    tab1, tab2, tab3 = st.tabs(["📊 Distributions","🔗 Correlation Matrix","✦ Scatter Plot"])

    with tab1:
        selected = st.multiselect("Select features", numeric_cols, default=numeric_cols[:4])
        if selected:
            cols = st.columns(min(len(selected), 2))
            for i, col in enumerate(selected):
                with cols[i % 2]:
                    fig, ax = plt.subplots(figsize=(5, 3))
                    ax.hist(df[col].dropna(), bins=40, color=COLORS[i % len(COLORS)], edgecolor="none", alpha=0.85)
                    ax.set_title(col, color="#f1f5f9")
                    ax.spines[["top","right"]].set_visible(False)
                    fig_to_st(fig)

    with tab2:
        corr = df[numeric_cols].corr()
        fig, ax = plt.subplots(figsize=(7, 5))
        im = ax.imshow(corr.values, cmap="RdBu_r", vmin=-1, vmax=1, aspect="auto")
        ax.set_xticks(range(len(corr.columns)))
        ax.set_yticks(range(len(corr.columns)))
        labels = [c.replace("_", " ") for c in corr.columns]
        ax.set_xticklabels(labels, rotation=45, ha="right", fontsize=8)
        ax.set_yticklabels(labels, fontsize=8)
        for i in range(len(corr)):
            for j in range(len(corr.columns)):
                ax.text(j, i, f"{corr.values[i,j]:.2f}", ha="center", va="center",
                        fontsize=7, color="white" if abs(corr.values[i,j]) > 0.4 else "#94a3b8")
        plt.colorbar(im, ax=ax, fraction=0.03)
        ax.set_title("Feature Correlation Heatmap", color="#f1f5f9")
        fig_to_st(fig)

    with tab3:
        c1, c2 = st.columns(2)
        with c1: x_col = st.selectbox("X axis", numeric_cols, index=0)
        with c2: y_col = st.selectbox("Y axis", numeric_cols, index=2)
        sample = df.sample(min(1500, len(df)), random_state=42)
        groups = sample["WeatherGroup"].unique()
        fig, ax = plt.subplots(figsize=(7, 4))
        for i, g in enumerate(sorted(groups)):
            mask = sample["WeatherGroup"] == g
            ax.scatter(sample.loc[mask, x_col], sample.loc[mask, y_col],
                       color=COLORS[i % len(COLORS)], alpha=0.55, s=18, label=g)
        ax.set_xlabel(x_col); ax.set_ylabel(y_col)
        ax.legend(fontsize=7, framealpha=0, loc="best")
        ax.spines[["top","right"]].set_visible(False)
        fig_to_st(fig)

    with st.expander("📋 Dataset Sample (first 50 rows)"):
        st.dataframe(df.head(50), use_container_width=True)


def page_analytics(df):
    st.title("📈 Weather Analytics")

    monthly = df.groupby("Month").agg({
        "Temp_C":"mean","Dew Point Temp_C":"mean",
        "Rel Hum_%":"mean","Wind Speed_km/h":"mean",
        "Visibility_km":"mean","Press_kPa":"mean",
    }).reset_index()
    months = [MONTH_NAMES[m - 1] for m in monthly["Month"]]

    c1, c2, c3, c4 = st.columns(4)
    with c1: metric_card("Hottest Recorded", f"{df['Temp_C'].max():.1f}°C", "", "#ef4444")
    with c2: metric_card("Coldest Recorded", f"{df['Temp_C'].min():.1f}°C", "", "#3b82f6")
    with c3: metric_card("Avg Humidity", f"{df['Rel Hum_%'].mean():.1f}%", "yearly average", "#06b6d4")
    with c4: metric_card("Avg Wind Speed", f"{df['Wind Speed_km/h'].mean():.1f} km/h", "yearly average", "#10b981")

    st.divider()
    col_a, col_b = st.columns(2)

    with col_a:
        st.subheader("Weather Type Frequency")
        counts = df["WeatherGroup"].value_counts().sort_values()
        fig, ax = plt.subplots(figsize=(6, 4))
        bars = ax.barh(counts.index.tolist(), counts.values, color=COLORS[:len(counts)])
        for bar, val in zip(bars, counts.values):
            ax.text(bar.get_width() + 20, bar.get_y() + bar.get_height()/2, str(val), va="center", fontsize=9, color="#94a3b8")
        ax.spines[["top","right"]].set_visible(False)
        fig_to_st(fig)

    with col_b:
        st.subheader("Temperature Trend (Monthly Avg)")
        x = np.arange(len(months))
        fig, ax = plt.subplots(figsize=(6, 4))
        ax.plot(x, monthly["Temp_C"], color="#3b82f6", linewidth=2.5, marker="o", markersize=5, label="Temp (°C)")
        ax.plot(x, monthly["Dew Point Temp_C"], color="#8b5cf6", linewidth=1.8, linestyle="--", marker="o", markersize=4, label="Dew Point (°C)")
        ax.fill_between(x, monthly["Temp_C"], alpha=0.12, color="#3b82f6")
        ax.set_xticks(x); ax.set_xticklabels(months, fontsize=8)
        ax.legend(framealpha=0, fontsize=8)
        ax.spines[["top","right"]].set_visible(False)
        fig_to_st(fig)

    col_c, col_d = st.columns(2)
    with col_c:
        st.subheader("Monthly Wind Speed")
        x = np.arange(len(months))
        fig, ax = plt.subplots(figsize=(6, 3.5))
        ax.bar(x, monthly["Wind Speed_km/h"], color="#10b981", alpha=0.85)
        ax.set_xticks(x); ax.set_xticklabels(months, fontsize=8)
        ax.set_ylabel("km/h")
        ax.spines[["top","right"]].set_visible(False)
        fig_to_st(fig)

    with col_d:
        st.subheader("Monthly Pressure (kPa)")
        x = np.arange(len(months))
        fig, ax = plt.subplots(figsize=(6, 3.5))
        ax.plot(x, monthly["Press_kPa"], color="#8b5cf6", linewidth=2.5, marker="o", markersize=5)
        ax.fill_between(x, monthly["Press_kPa"], alpha=0.12, color="#8b5cf6")
        ax.set_xticks(x); ax.set_xticklabels(months, fontsize=8)
        ax.spines[["top","right"]].set_visible(False)
        fig_to_st(fig)


def page_prediction(model, le, scaler):
    st.title("🔮 Weather Prediction")
    st.markdown("Enter current sensor readings to classify the weather condition.")

    col_l, col_r = st.columns(2)
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
        month = st.slider("Month", 1, 12, 6)
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
        st.markdown(
            f'<div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);'
            f'border-radius:16px;padding:1.5rem;text-align:center;margin:1rem 0">'
            f'<div style="font-size:3rem">{emoji}</div>'
            f'<div style="font-size:1.6rem;font-weight:800;color:#f1f5f9">{predicted_label}</div>'
            f'<div style="color:#60a5fa;font-weight:700;font-size:1.1rem">{confidence*100:.1f}% confidence</div>'
            f'</div>',
            unsafe_allow_html=True,
        )

        st.markdown("**Class Probabilities**")
        classes = le.classes_
        sorted_idx = np.argsort(probabilities)[::-1]
        fig, ax = plt.subplots(figsize=(5, 3.5))
        bars = ax.barh(
            [classes[i] for i in sorted_idx],
            [probabilities[i] for i in sorted_idx],
            color=[COLORS[i % len(COLORS)] for i in range(len(sorted_idx))],
        )
        ax.set_xlim(0, 1)
        ax.spines[["top","right"]].set_visible(False)
        for bar, idx in zip(bars, sorted_idx):
            ax.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height()/2,
                    f"{probabilities[idx]*100:.1f}%", va="center", fontsize=8, color="#94a3b8")
        fig_to_st(fig)


def page_performance(model, metadata):
    st.title("📊 Model Performance")

    c1, c2, c3 = st.columns(3)
    with c1: metric_card("Test Accuracy", f"{metadata['test_accuracy']*100:.1f}%", "", "#10b981")
    with c2: metric_card("CV Accuracy", f"{metadata['cv_accuracy']*100:.1f}%", "", "#3b82f6")
    with c3: metric_card("Estimators", str(metadata["best_params"]["n_estimators"]), "Random Forest trees")

    st.subheader("Best Hyperparameters (GridSearchCV)")
    p = metadata["best_params"]
    st.dataframe(pd.DataFrame([{
        "n_estimators": p["n_estimators"],
        "max_depth": str(p["max_depth"]),
        "min_samples_split": p["min_samples_split"],
        "min_samples_leaf": p["min_samples_leaf"],
    }]), use_container_width=True, hide_index=True)

    st.subheader("Feature Importances")
    importances = model.feature_importances_
    feat_names = metadata["feature_columns"]
    sorted_idx = np.argsort(importances)
    fig, ax = plt.subplots(figsize=(7, 4))
    bars = ax.barh(
        [feat_names[i] for i in sorted_idx],
        [importances[i] for i in sorted_idx],
        color=COLORS[:len(sorted_idx)],
    )
    for bar, idx in zip(bars, sorted_idx):
        ax.text(bar.get_width() + 0.002, bar.get_y() + bar.get_height()/2,
                f"{importances[idx]:.3f}", va="center", fontsize=8, color="#94a3b8")
    ax.spines[["top","right"]].set_visible(False)
    ax.set_xlabel("Importance")
    fig_to_st(fig)


def page_about():
    st.title("ℹ️ About WeatherML")
    st.markdown('<div style="display:inline-block;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.25);border-radius:999px;padding:0.3rem 0.9rem;color:#60a5fa;font-size:0.8rem;font-weight:600">Created by Hajra</div>', unsafe_allow_html=True)
    st.markdown("""
    A complete **end-to-end machine learning project** combining data science (EDA),
    predictive modelling (**Random Forest with GridSearchCV**), and an interactive dashboard.
    Classifies weather into **8 categories** from **8,782 hourly sensor readings**.
    """)
    st.divider()
    st.subheader("🔬 ML Pipeline")
    steps = [
        ("1. Data Collection", "8,782 hourly weather observations with 13 features."),
        ("2. Preprocessing", "Handle missing values, encode 8 weather groups, engineer time features."),
        ("3. EDA & Analysis", "Distributions, correlations, class imbalance analysis."),
        ("4. Feature Engineering", "4 derived features — 10 total model inputs."),
        ("5. Model Training", "Random Forest + GridSearchCV. 80/20 split. 200 estimators."),
        ("6. Evaluation", "77.6% test accuracy. Saved with joblib for inference."),
    ]
    c1, c2 = st.columns(2)
    for i, (title, desc) in enumerate(steps):
        with [c1, c2][i % 2]:
            st.markdown(f"**{title}**")
            st.caption(desc)
    st.divider()
    st.subheader("🚀 Future Scope")
    for item in [
        "XGBoost and Deep Learning model comparison",
        "Export predictions as downloadable PDF",
        "Historical trend analysis with custom date ranges",
        "Multi-region support — compare multiple cities",
    ]:
        st.markdown(f"→ {item}")


if __name__ == "__main__":
    main()
