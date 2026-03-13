import { useGetEdaStats, usePredictWeather } from "@workspace/api-client-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface ClassDist {
  name: string;
  value: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ClassMetric {
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

interface MonthlyStatRaw {
  Temp_C: number;
  "Dew Point Temp_C": number;
  "Rel Hum_%": number;
  "Wind Speed_km/h": number;
  Visibility_km: number;
  Press_kPa: number;
}

interface ModelMetrics {
  test_accuracy: number;
  cv_accuracy: number;
  best_params: { n_estimators?: number; max_depth?: number | null };
  per_class_metrics: Record<string, ClassMetric>;
  confusion_matrix: number[][];
  class_labels: string[];
}

interface ScatterPoint {
  temp: number;
  humidity: number;
  weather: string;
}

interface ScatterRaw {
  Temp_C: number;
  "Rel Hum_%": number;
  Weather_Grouped: string;
}

function asRecord<T>(val: unknown): T {
  return val as T;
}

export function useDashboardData() {
  const { data, isLoading, error } = useGetEdaStats();

  if (!data) return { data: null, isLoading, error };

  const classDistData: ClassDist[] = Object.entries(data.class_distribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const rawMonthly = asRecord<Record<string, MonthlyStatRaw>>(data.monthly_stats || {});
  const monthlyData = Object.keys(rawMonthly)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((m) => {
      const { ...stats } = rawMonthly[m];
      return { ...stats, month: MONTH_NAMES[parseInt(m) - 1] };
    });

  const featureImportanceData: FeatureImportance[] = Object.entries(data.feature_importances || {})
    .map(([feature, importance]) => ({ feature, importance }))
    .sort((a, b) => b.importance - a.importance);

  const metrics = asRecord<ModelMetrics>(data.model_metrics || {});
  const perClassMetrics = metrics.per_class_metrics || {};
  const corrMatrix = asRecord<Record<string, Record<string, number>>>(data.correlation_matrix || {});
  const confusionMatrix = metrics.confusion_matrix || [];
  const classLabels = metrics.class_labels || [];

  const rawScatter = asRecord<ScatterRaw[]>(data.scatter_data || []);
  const scatterData: ScatterPoint[] = rawScatter.map((d) => ({
    temp: Number(d.Temp_C ?? 0),
    humidity: Number(d["Rel Hum_%"] ?? 0),
    weather: d.Weather_Grouped ?? "Unknown",
  }));

  return {
    data: {
      ...data,
      classDistData,
      monthlyData,
      featureImportanceData,
      perClassMetrics,
      corrMatrix,
      confusionMatrix,
      classLabels,
      scatterData,
      testAccuracy: metrics.test_accuracy || 0,
      cvAccuracy: metrics.cv_accuracy || 0,
      bestParams: metrics.best_params || {},
    },
    isLoading,
    error,
  };
}

export type DashboardData = NonNullable<ReturnType<typeof useDashboardData>["data"]>;

export function useWeatherPrediction() {
  return usePredictWeather();
}
