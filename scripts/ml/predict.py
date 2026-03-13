import sys
import json
import joblib
import numpy as np
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, 'model')

model = joblib.load(os.path.join(MODEL_DIR, 'weather_model.joblib'))
le = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.joblib'))
scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.joblib'))

with open(os.path.join(MODEL_DIR, 'metadata.json'), 'r') as f:
    metadata = json.load(f)

input_data = json.loads(sys.stdin.read())

temp = float(input_data.get('temp_c', 0))
dew_point = float(input_data.get('dew_point_temp_c', 0))
rel_hum = float(input_data.get('rel_hum', 50))
wind_speed = float(input_data.get('wind_speed_kmh', 0))
visibility = float(input_data.get('visibility_km', 25))
pressure = float(input_data.get('press_kpa', 101))

hour = int(input_data.get('hour', 12))
month = int(input_data.get('month', 6))
day_of_week = int(input_data.get('day_of_week', 3))

temp_dewpoint_diff = temp - dew_point

features = np.array([[temp, dew_point, rel_hum, wind_speed, visibility, pressure,
                       hour, month, day_of_week, temp_dewpoint_diff]])

features_scaled = scaler.transform(features)

prediction = model.predict(features_scaled)[0]
probabilities = model.predict_proba(features_scaled)[0]

predicted_label = le.inverse_transform([prediction])[0]

prob_dict = {}
for i, cls in enumerate(le.classes_):
    prob_dict[cls] = round(float(probabilities[i]), 4)

result = {
    'predicted_weather': predicted_label,
    'probabilities': prob_dict,
    'confidence': round(float(max(probabilities)), 4),
}

print(json.dumps(result))
