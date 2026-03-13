import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  CloudFog,
  Wind,
  Droplets,
  Gauge,
  ThermometerSun,
  ThermometerSnowflake,
  ShieldAlert,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useApiKeyStatus } from "@/hooks/use-live-weather";
import { ApiKeyMissing } from "@/components/ApiKeyMissing";
import { CitySearch } from "@/components/CitySearch";

const API_BASE = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

interface ApiAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
}

interface AlertsApiResponse {
  city: string;
  country: string;
  alerts: ApiAlert[];
  allClear: boolean;
}

function getAlertIcon(id: string, title: string): React.ReactNode {
  const lower = id + " " + title.toLowerCase();
  if (lower.includes("fog") || lower.includes("vis")) return <CloudFog className="w-6 h-6" />;
  if (lower.includes("wind") || lower.includes("storm")) return <Wind className="w-6 h-6" />;
  if (lower.includes("thunder")) return <Zap className="w-6 h-6" />;
  if (lower.includes("heat") || lower.includes("sun")) return <ThermometerSun className="w-6 h-6" />;
  if (lower.includes("cold") || lower.includes("freeze") || lower.includes("ice") || lower.includes("sleet")) return <ThermometerSnowflake className="w-6 h-6" />;
  if (lower.includes("pressure")) return <Gauge className="w-6 h-6" />;
  if (lower.includes("humid") || lower.includes("rain")) return <Droplets className="w-6 h-6" />;
  return <AlertTriangle className="w-6 h-6" />;
}

function getSeverityStyles(severity: string) {
  switch (severity) {
    case "critical":
      return {
        border: "border-red-500/50",
        bg: "bg-red-500/10",
        badge: "bg-red-500/20 text-red-400",
        icon: "text-red-400",
      };
    case "warning":
      return {
        border: "border-amber-500/50",
        bg: "bg-amber-500/10",
        badge: "bg-amber-500/20 text-amber-400",
        icon: "text-amber-400",
      };
    default:
      return {
        border: "border-blue-500/50",
        bg: "bg-blue-500/10",
        badge: "bg-blue-500/20 text-blue-400",
        icon: "text-blue-400",
      };
  }
}

function useWeatherAlerts(city: string) {
  return useQuery<AlertsApiResponse>({
    queryKey: ["weather-alerts", city],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/weather/alerts?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message ?? data?.error ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }
      return data as AlertsApiResponse;
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function AlertsPage() {
  const [city, setCity] = useState("Toronto");
  const { data: keyStatus, isLoading: keyLoading } = useApiKeyStatus();
  const { data, isLoading, error } = useWeatherAlerts(city);

  if (keyLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (keyStatus && !keyStatus.configured) return <ApiKeyMissing />;

  const alerts = data?.alerts ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            Weather Alerts
          </h1>
          <p className="text-muted-foreground">
            {data?.city
              ? `Active alerts for ${data.city}, ${data.country}`
              : "Rule-based weather alerts and advisories"}
          </p>
        </div>
        <CitySearch city={city} onCityChange={setCity} />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Failed to load weather data"}
            </p>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                Alert Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {alerts.filter((a) => a.severity === "critical").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">
                    {alerts.filter((a) => a.severity === "warning").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {alerts.filter((a) => a.severity === "info").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Advisories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">All Clear</h3>
                <p className="text-muted-foreground">
                  No weather alerts for {data.city}. Conditions are within normal parameters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, i) => {
                const styles = getSeverityStyles(alert.severity);
                const icon = getAlertIcon(alert.id, alert.title);
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <Card className={`border-l-4 ${styles.border}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl ${styles.bg} flex items-center justify-center shrink-0 ${styles.icon}`}
                          >
                            {icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-foreground">{alert.title}</h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${styles.badge}`}
                              >
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground text-center">
                Alerts are derived from current weather conditions using rule-based thresholds.
                Fog: visibility &lt; 1 km | Storm wind: &gt; 60 km/h | Extreme humidity: &gt; 90% |
                Extreme cold: &lt; −20 °C | Heat: &gt; 35 °C | Low pressure: &lt; 1000 hPa (100 kPa) |
                Thunderstorm / freezing rain when detected.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
