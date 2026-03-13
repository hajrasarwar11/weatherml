import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useApiKeyStatus, useCurrentWeather } from "@/hooks/use-live-weather";
import { ApiKeyMissing } from "@/components/ApiKeyMissing";
import { CitySearch } from "@/components/CitySearch";

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  icon: React.ReactNode;
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

function deriveAlerts(data: Record<string, unknown>): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const main = data.main as Record<string, number>;
  const wind = data.wind as Record<string, number>;
  const visibility = data.visibility as number;

  if (visibility < 1000) {
    alerts.push({
      id: "fog",
      title: "Dense Fog Warning",
      description: `Visibility is extremely low at ${(visibility / 1000).toFixed(2)} km. Exercise caution when driving or traveling.`,
      severity: "critical",
      icon: <CloudFog className="w-6 h-6" />,
    });
  } else if (visibility < 5000) {
    alerts.push({
      id: "low-vis",
      title: "Low Visibility Advisory",
      description: `Visibility is reduced to ${(visibility / 1000).toFixed(1)} km. Be cautious during outdoor activities.`,
      severity: "warning",
      icon: <CloudFog className="w-6 h-6" />,
    });
  }

  const windKmh = (wind?.speed ?? 0) * 3.6;
  if (windKmh > 60) {
    alerts.push({
      id: "storm-wind",
      title: "Storm Wind Warning",
      description: `Wind speeds of ${windKmh.toFixed(1)} km/h detected. Secure loose objects and avoid unnecessary travel.`,
      severity: "critical",
      icon: <Wind className="w-6 h-6" />,
    });
  } else if (windKmh > 40) {
    alerts.push({
      id: "high-wind",
      title: "High Wind Advisory",
      description: `Wind speeds of ${windKmh.toFixed(1)} km/h. Be cautious of gusts.`,
      severity: "warning",
      icon: <Wind className="w-6 h-6" />,
    });
  }

  if (main.humidity > 90) {
    alerts.push({
      id: "humidity",
      title: "Extreme Humidity Alert",
      description: `Humidity level at ${main.humidity}%. May cause discomfort and potential health risks for sensitive individuals.`,
      severity: "warning",
      icon: <Droplets className="w-6 h-6" />,
    });
  }

  const pressureKpa = main.pressure / 10;
  if (pressureKpa < 100) {
    alerts.push({
      id: "pressure",
      title: "Low Pressure Alert",
      description: `Atmospheric pressure at ${pressureKpa.toFixed(1)} kPa indicates an approaching weather system. Expect changing conditions.`,
      severity: "info",
      icon: <Gauge className="w-6 h-6" />,
    });
  }

  if (main.temp > 35) {
    alerts.push({
      id: "heat",
      title: "Extreme Heat Warning",
      description: `Temperature at ${Math.round(main.temp)}°C. Stay hydrated and avoid prolonged sun exposure.`,
      severity: "critical",
      icon: <ThermometerSun className="w-6 h-6" />,
    });
  } else if (main.temp > 30) {
    alerts.push({
      id: "heat-advisory",
      title: "Heat Advisory",
      description: `Temperature at ${Math.round(main.temp)}°C. Take precautions against heat-related illness.`,
      severity: "warning",
      icon: <ThermometerSun className="w-6 h-6" />,
    });
  }

  if (main.temp < -20) {
    alerts.push({
      id: "extreme-cold",
      title: "Extreme Cold Warning",
      description: `Temperature at ${Math.round(main.temp)}°C. Risk of frostbite and hypothermia. Limit outdoor exposure.`,
      severity: "critical",
      icon: <ThermometerSnowflake className="w-6 h-6" />,
    });
  } else if (main.temp < -10) {
    alerts.push({
      id: "cold",
      title: "Cold Weather Advisory",
      description: `Temperature at ${Math.round(main.temp)}°C. Dress warmly and protect exposed skin.`,
      severity: "warning",
      icon: <ThermometerSnowflake className="w-6 h-6" />,
    });
  }

  return alerts;
}

export function AlertsPage() {
  const [city, setCity] = useState("Toronto");
  const { data: keyStatus, isLoading: keyLoading } = useApiKeyStatus();
  const { data: current, isLoading, error } = useCurrentWeather(city);

  if (keyLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (keyStatus && !keyStatus.configured) return <ApiKeyMissing />;

  const alerts = current ? deriveAlerts(current) : [];

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
            {current?.name ? `Active alerts for ${current.name}, ${current.sys?.country}` : "Rule-based weather alerts and advisories"}
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

      {current && !isLoading && (
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
                  No weather alerts for {current.name}. Conditions are within normal parameters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, i) => {
                const styles = getSeverityStyles(alert.severity);
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
                            {alert.icon}
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
                Fog warning: visibility &lt; 1 km | Storm warning: wind &gt; 60 km/h |
                Extreme humidity: &gt; 90% | Low pressure: &lt; 100 kPa |
                Heat/Cold: based on temperature extremes.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
