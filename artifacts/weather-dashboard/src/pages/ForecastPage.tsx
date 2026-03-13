import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Droplets, Wind, ThermometerSun } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useApiKeyStatus, useForecast } from "@/hooks/use-live-weather";
import { ApiKeyMissing } from "@/components/ApiKeyMissing";
import { CitySearch } from "@/components/CitySearch";

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#f1f5f9",
};

function getWeatherIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

interface DayForecast {
  date: string;
  dayLabel: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pop: number;
  hourly: { time: string; temp: number; humidity: number }[];
}

function groupForecastByDay(list: Record<string, unknown>[]): DayForecast[] {
  const days: Record<string, DayForecast> = {};
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (const item of list) {
    const dt = new Date((item.dt as number) * 1000);
    const dateStr = dt.toISOString().split("T")[0];
    const main = item.main as Record<string, number>;
    const weather = (item.weather as Record<string, string>[])?.[0];
    const wind = item.wind as Record<string, number>;

    if (!days[dateStr]) {
      days[dateStr] = {
        date: dateStr,
        dayLabel: dayNames[dt.getDay()],
        minTemp: main.temp_min,
        maxTemp: main.temp_max,
        icon: weather?.icon || "01d",
        description: weather?.description || "",
        humidity: main.humidity,
        windSpeed: wind?.speed ?? 0,
        pop: (item.pop as number) ?? 0,
        hourly: [],
      };
    }
    const day = days[dateStr];
    day.minTemp = Math.min(day.minTemp, main.temp_min);
    day.maxTemp = Math.max(day.maxTemp, main.temp_max);
    if (dt.getHours() >= 11 && dt.getHours() <= 14) {
      day.icon = weather?.icon || day.icon;
      day.description = weather?.description || day.description;
    }
    day.pop = Math.max(day.pop, (item.pop as number) ?? 0);
    day.hourly.push({
      time: dt.toLocaleTimeString("en-US", { hour: "numeric" }),
      temp: Math.round(main.temp),
      humidity: main.humidity,
    });
  }
  return Object.values(days).slice(0, 7);
}

export function ForecastPage() {
  const [city, setCity] = useState("Toronto");
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const { data: keyStatus, isLoading: keyLoading } = useApiKeyStatus();
  const { data: forecast, isLoading, error } = useForecast(city);

  if (keyLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (keyStatus && !keyStatus.configured) return <ApiKeyMissing />;

  const days = forecast?.list ? groupForecastByDay(forecast.list) : [];
  const selected = days[selectedDay];

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
            5-Day Hourly Forecast
          </h1>
          <p className="text-muted-foreground">
            {forecast?.city?.name ? `${forecast.city.name}, ${forecast.city.country}` : "Detailed weather forecast"}
          </p>
        </div>
        <CitySearch city={city} onCityChange={(c) => { setCity(c); setSelectedDay(0); }} />
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
              {error instanceof Error ? error.message : "Failed to load forecast"}
            </p>
          </CardContent>
        </Card>
      )}

      {days.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {days.map((day, i) => (
              <Card
                key={day.date}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  i === selectedDay ? "border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" : ""
                }`}
                onClick={() => setSelectedDay(i)}
              >
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground">{day.dayLabel}</p>
                  <p className="text-xs text-muted-foreground">{day.date.slice(5)}</p>
                  <img
                    src={getWeatherIconUrl(day.icon)}
                    alt={day.description}
                    className="w-12 h-12 mx-auto my-1"
                  />
                  <p className="text-sm capitalize text-muted-foreground">{day.description}</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <span className="text-sm font-bold">{Math.round(day.maxTemp)}°</span>
                    <span className="text-sm text-muted-foreground">{Math.round(day.minTemp)}°</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs text-blue-400">
                    <Droplets className="w-3 h-3" />
                    {Math.round(day.pop * 100)}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <ThermometerSun className="w-6 h-6 text-amber-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature Range</p>
                    <p className="text-lg font-bold font-mono">
                      {Math.round(selected.minTemp)}° — {Math.round(selected.maxTemp)}°C
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <Droplets className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                    <p className="text-lg font-bold font-mono">{selected.humidity}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <Wind className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wind Speed</p>
                    <p className="text-lg font-bold font-mono">
                      {(selected.windSpeed * 3.6).toFixed(1)} km/h
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selected && selected.hourly.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hourly Temperature — {selected.dayLabel} ({selected.date.slice(5)})</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selected.hourly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="°" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="temp" radius={[6, 6, 0, 0]} barSize={30} name="Temp (°C)">
                      {selected.hourly.map((_e, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            selected.hourly[idx].temp > 25
                              ? "#ef4444"
                              : selected.hourly[idx].temp > 15
                              ? "#f59e0b"
                              : selected.hourly[idx].temp > 5
                              ? "#3b82f6"
                              : "#06b6d4"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}
