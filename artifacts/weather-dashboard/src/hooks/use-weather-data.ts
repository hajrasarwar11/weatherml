import { useGetEdaStats, usePredictWeather } from "@workspace/api-client-react";
import { safelyCast } from "@/lib/utils";

// Types for our typed UI mappings
export interface MonthlyStat {
  month: string;
  Temp_C: number;
  "Dew Point Temp_C": number;
  "Rel Hum_%": number;
  "Wind Speed_km/h": number;
  Visibility_km: number;
  Press_kPa: number;
}

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

export function useDashboardData() {
  const { data, isLoading, error } = useGetEdaStats();

  if (!data) return { data: null, isLoading, error };

  // Transform data for charts
  const classDistData: ClassDist[] = Object.entries(data.class_distribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const rawMonthly = safelyCast<Record<string, MonthlyStat>>(data.monthly_stats || {});
  const monthlyData = Object.keys(rawMonthly)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((m) => ({
      month: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ][parseInt(m) - 1],
      ...rawMonthly[m],
    }));

  const featureImportanceData: FeatureImportance[] = Object.entries(data.feature_importances || {})
    .map(([feature, importance]) => ({ feature, importance }))
    .sort((a, b) => b.importance - a.importance);

  const rawMetrics = safelyCast<Record<string, any>>(data.model_metrics || {});
  const perClassMetrics = safelyCast<Record<string, ClassMetric>>(rawMetrics.per_class_metrics || {});

  const corrMatrix = safelyCast<Record<string, Record<string, number>>>(data.correlation_matrix || {});
  
  const confusionMatrix = safelyCast<number[][]>(rawMetrics.confusion_matrix || []);
  const classLabels = safelyCast<string[]>(rawMetrics.class_labels || []);

  const rawScatter = safelyCast<any[]>(data.scatter_data || []);
  const scatterData = rawScatter.map((d: any) => ({
    temp: Number(d["Temp_C"] ?? d.Temp_C ?? 0),
    humidity: Number(d["Rel Hum_%"] ?? 0),
    weather: d["Weather_Grouped"] ?? d.Weather_Grouped ?? "Unknown",
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
      testAccuracy: rawMetrics.test_accuracy || 0,
      cvAccuracy: rawMetrics.cv_accuracy || 0,
      bestParams: rawMetrics.best_params || {},
    },
    isLoading,
    error,
  };
}

export function useWeatherPrediction() {
  return usePredictWeather();
}
