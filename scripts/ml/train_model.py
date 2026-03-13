import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, '..', '..', 'attached_assets', '20_Project_1_-_Weather_Dataset_1773363359387.csv')
MODEL_DIR = os.path.join(SCRIPT_DIR, 'model')

os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("STEP 1: LOAD AND UNDERSTAND DATA (EDA)")
print("=" * 60)

df = pd.read_csv(DATA_PATH)

print(f"\nDataset Shape: {df.shape}")
print(f"Total Rows: {df.shape[0]}, Total Columns: {df.shape[1]}")
print(f"\nColumn Names:\n{list(df.columns)}")
print(f"\nData Types:\n{df.dtypes}")
print(f"\nFirst 5 Rows:\n{df.head()}")
print(f"\nStatistical Summary:\n{df.describe()}")
print(f"\nWeather Class Distribution:\n{df['Weather'].value_counts()}")
print(f"\nNumber of Unique Weather Classes: {df['Weather'].nunique()}")

print("\n" + "=" * 60)
print("STEP 2: HANDLE MISSING VALUES")
print("=" * 60)

print(f"\nMissing Values Per Column:\n{df.isnull().sum()}")
print(f"Total Missing Values: {df.isnull().sum().sum()}")

numeric_cols = ['Temp_C', 'Dew Point Temp_C', 'Rel Hum_%', 'Wind Speed_km/h', 'Visibility_km', 'Press_kPa']
for col in numeric_cols:
    if df[col].isnull().sum() > 0:
        df[col].fillna(df[col].median(), inplace=True)
        print(f"Filled {col} missing values with median")

if df['Weather'].isnull().sum() > 0:
    df.dropna(subset=['Weather'], inplace=True)
    print("Dropped rows with missing Weather values")

print(f"Missing values after handling: {df.isnull().sum().sum()}")

print("\n" + "=" * 60)
print("STEP 3: FEATURE ENGINEERING")
print("=" * 60)

df['Date/Time'] = pd.to_datetime(df['Date/Time'])
df['Hour'] = df['Date/Time'].dt.hour
df['Month'] = df['Date/Time'].dt.month
df['DayOfWeek'] = df['Date/Time'].dt.dayofweek

df['Temp_DewPoint_Diff'] = df['Temp_C'] - df['Dew Point Temp_C']

print(f"New features added: Hour, Month, DayOfWeek, Temp_DewPoint_Diff")
print(f"Updated shape: {df.shape}")

weather_mapping = {}
for w in df['Weather'].unique():
    w_lower = w.lower()
    if 'snow' in w_lower and 'rain' not in w_lower:
        weather_mapping[w] = 'Snow'
    elif 'rain' in w_lower and 'freezing' not in w_lower and 'snow' not in w_lower:
        weather_mapping[w] = 'Rain'
    elif 'fog' in w_lower and 'freezing' not in w_lower:
        weather_mapping[w] = 'Fog'
    elif 'clear' in w_lower:
        weather_mapping[w] = 'Clear'
    elif 'cloudy' in w_lower:
        weather_mapping[w] = 'Cloudy'
    elif 'drizzle' in w_lower or 'freezing' in w_lower:
        weather_mapping[w] = 'Freezing Precip'
    elif 'thunder' in w_lower:
        weather_mapping[w] = 'Thunderstorm'
    elif 'haze' in w_lower:
        weather_mapping[w] = 'Haze'
    else:
        weather_mapping[w] = 'Other'

df['Weather_Grouped'] = df['Weather'].map(weather_mapping)

print(f"\nGrouped Weather Distribution:\n{df['Weather_Grouped'].value_counts()}")

min_samples = 10
class_counts = df['Weather_Grouped'].value_counts()
valid_classes = class_counts[class_counts >= min_samples].index.tolist()
df = df[df['Weather_Grouped'].isin(valid_classes)]
print(f"\nAfter filtering rare classes (< {min_samples} samples):")
print(f"Remaining classes: {valid_classes}")
print(f"Dataset size: {df.shape[0]}")

print("\n" + "=" * 60)
print("STEP 4: ENCODE AND SCALE DATA")
print("=" * 60)

feature_cols = ['Temp_C', 'Dew Point Temp_C', 'Rel Hum_%', 'Wind Speed_km/h',
                'Visibility_km', 'Press_kPa', 'Hour', 'Month', 'DayOfWeek', 'Temp_DewPoint_Diff']

X = df[feature_cols].values
y = df['Weather_Grouped'].values

le = LabelEncoder()
y_encoded = le.fit_transform(y)
print(f"Label classes: {list(le.classes_)}")

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
print(f"Features scaled using StandardScaler")
print(f"X shape: {X_scaled.shape}, y shape: {y_encoded.shape}")

print("\n" + "=" * 60)
print("STEP 5: SPLIT INTO TRAIN AND TEST")
print("=" * 60)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"Training set: {X_train.shape[0]} samples")
print(f"Test set: {X_test.shape[0]} samples")
print(f"Stratified split confirmed")

print("\n" + "=" * 60)
print("STEP 6: TRAIN MODEL WITH HYPERPARAMETER TUNING")
print("=" * 60)

rf = RandomForestClassifier(random_state=42, n_jobs=-1)

param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [10, 20, None],
    'min_samples_split': [2, 5],
    'min_samples_leaf': [1, 2],
}

print("Running GridSearchCV (this may take a moment)...")
grid_search = GridSearchCV(
    rf, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=0
)
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"\nBest Parameters: {grid_search.best_params_}")
print(f"Best CV Accuracy: {grid_search.best_score_:.4f}")

print("\n" + "=" * 60)
print("STEP 7: TESTING AND EVALUATION")
print("=" * 60)

y_pred = best_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nTest Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

cm = confusion_matrix(y_test, y_pred)
print(f"Confusion Matrix:\n{cm}")

print("\n" + "=" * 60)
print("STEP 8: SAVE MODEL")
print("=" * 60)

joblib.dump(best_model, os.path.join(MODEL_DIR, 'weather_model.joblib'))
joblib.dump(le, os.path.join(MODEL_DIR, 'label_encoder.joblib'))
joblib.dump(scaler, os.path.join(MODEL_DIR, 'scaler.joblib'))

metadata = {
    'feature_columns': feature_cols,
    'classes': list(le.classes_),
    'best_params': grid_search.best_params_,
    'cv_accuracy': float(grid_search.best_score_),
    'test_accuracy': float(accuracy),
}
with open(os.path.join(MODEL_DIR, 'metadata.json'), 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"Model saved to: {MODEL_DIR}/weather_model.joblib")
print(f"Label encoder saved to: {MODEL_DIR}/label_encoder.joblib")
print(f"Scaler saved to: {MODEL_DIR}/scaler.joblib")
print(f"Metadata saved to: {MODEL_DIR}/metadata.json")

print("\n" + "=" * 60)
print("STEP 9: EXPORT EDA STATS AND MODEL METRICS")
print("=" * 60)

class_dist = df['Weather_Grouped'].value_counts().to_dict()

monthly_stats = df.groupby('Month').agg({
    'Temp_C': 'mean',
    'Dew Point Temp_C': 'mean',
    'Rel Hum_%': 'mean',
    'Wind Speed_km/h': 'mean',
    'Visibility_km': 'mean',
    'Press_kPa': 'mean',
}).round(2)
monthly_stats_dict = {}
for month in monthly_stats.index:
    monthly_stats_dict[str(month)] = monthly_stats.loc[month].to_dict()

corr_matrix = df[numeric_cols].corr().round(3)
corr_dict = {}
for col in corr_matrix.columns:
    corr_dict[col] = corr_matrix[col].to_dict()

feature_importances = dict(zip(feature_cols, [round(float(x), 4) for x in best_model.feature_importances_]))

report_dict = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
per_class_metrics = {}
for cls in le.classes_:
    if cls in report_dict:
        per_class_metrics[cls] = {
            'precision': round(report_dict[cls]['precision'], 4),
            'recall': round(report_dict[cls]['recall'], 4),
            'f1_score': round(report_dict[cls]['f1-score'], 4),
            'support': int(report_dict[cls]['support']),
        }

cm_list = cm.tolist()

scatter_sample = df.sample(min(500, len(df)), random_state=42)[['Temp_C', 'Rel Hum_%', 'Weather_Grouped']].to_dict(orient='records')

hourly_dist = df.groupby(['Hour', 'Weather_Grouped']).size().reset_index(name='count')
hourly_dict = hourly_dist.to_dict(orient='records')

stats = {
    'dataset_info': {
        'total_rows': int(df.shape[0]),
        'total_columns': int(df.shape[1]),
        'feature_columns': feature_cols,
        'numeric_columns': numeric_cols,
    },
    'class_distribution': class_dist,
    'monthly_stats': monthly_stats_dict,
    'correlation_matrix': corr_dict,
    'feature_importances': feature_importances,
    'model_metrics': {
        'test_accuracy': float(accuracy),
        'cv_accuracy': float(grid_search.best_score_),
        'best_params': {k: v if v is not None else 'None' for k, v in grid_search.best_params_.items()},
        'per_class_metrics': per_class_metrics,
        'confusion_matrix': cm_list,
        'class_labels': list(le.classes_),
    },
    'scatter_data': scatter_sample,
    'hourly_distribution': hourly_dict,
}

stats_path = os.path.join(MODEL_DIR, 'stats.json')
with open(stats_path, 'w') as f:
    json.dump(stats, f, indent=2, default=str)

print(f"Stats exported to: {stats_path}")
print("\nDONE! All model artifacts and stats have been saved.")
