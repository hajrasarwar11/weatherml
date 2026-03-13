import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Droplets, Wind, ThermometerSun, Sunrise, Sunset } from "lucide-react";
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
import { useApiKeyStatus, useDailyForecast, useForecast } from "@/hooks/use-live-weather";
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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DailyItem {
  dt: number;
  temp: { day: number; min: number; max: number; night: number; eve: number; morn: number };
  feels_like: { day: number; night: number; eve: number; morn: number };
  humidity: number;
  wind_speed: number;
  pop: number;
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  pressure: number;
  uvi?: number;
  sunrise?: number;
  sunset?: number;
}

interface ForecastListItem {
  dt: number;
  main: { temp: number; humidity: number; temp_min: number; temp_max: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  wind: { speed: number };
  pop: number;
}

function groupFallbackByDay(list: ForecastListItem[]) {
  const days: Record<string, {
    date: string; dayLabel: string; minTemp: number; maxTemp: number;
    icon: string; description: string; humidity: number; windSpeed: number; pop: number;
    hourly: { time: string; temp: number }[];
  }> = {};

  for (const item of list) {
    const dt = new Date(item.dt * 1000);
    const dateStr = dt.toISOString().split("T")[0];
    if (!days[dateStr]) {
      days[dateStr] = {
        date: dateStr,
        dayLabel: DAY_LABELS[dt.getDay()],
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
        icon: item.weather[0]?.icon || "01d",
        description: item.weather[0]?.description || "",
        humidity: item.main.humidity,
        windSpeed: item.wind?.speed ?? 0,
        pop: item.pop ?? 0,
        hourly: [],
      };
    }
    const day = days[dateStr];
    day.minTemp = Math.min(day.minTemp, item.main.temp_min);
    day.maxTemp = Math.max(day.maxTemp, item.main.temp_max);
    day.pop = Math.max(day.pop, item.pop ?? 0);
    day.hourly.push({
      time: dt.toLocaleTimeString("en-US", { hour: "numeric" }),
      temp: Math.round(item.main.temp),
    });
  }
  return Object.values(days).slice(0, 7);
}

export function ForecastPage() {
  const [city, setCity] = useState("Toronto");
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const { data: keyStatus, isLoading: keyLoading } = useApiKeyStatus();
  const { data: dailyData, isLoading: dailyLoading, error: dailyError } = useDailyForecast(city);
  const { data: fallbackForecast, isLoading: fallbackLoading } = useForecast(city);

  if (keyLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (keyStatus && !keyStatus.configured) return <ApiKeyMissing />;

  const isLoading = dailyLoading && fallbackLoading;
  const error = dailyError && !fallbackForecast?.list;

  const dailyItems: DailyItem[] = Array.isArray(dailyData?.daily)
    ? (dailyData.daily as DailyItem[]).slice(0, 7)
    : [];

  const fallbackDays = !dailyItems.length && fallbackForecast?.list
    ? groupFallbackByDay(fallbackForecast.list as ForecastListItem[])
    : [];

  const useDaily = dailyItems.length > 0;
  const totalDays = useDaily ? dailyItems.length : fallbackDays.length;
  const cityName = dailyData?.city?.name ?? fallbackForecast?.city?.name ?? city;
  const cityCountry = dailyData?.city?.country ?? fallbackForecast?.city?.country ?? "";

  function formatLocalTime(ts: number | undefined) {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function getDayLabel(dt: number) {
    return DAY_LABELS[new Date(dt * 1000).getDay()];
  }

  function getDateStr(dt: number) {
    return new Date(dt * 1000).toISOString().split("T")[0].slice(5);
  }

  const selectedDaily = useDaily ? dailyItems[selectedDay] : null;
  const selectedFallback = !useDaily && fallbackDays.length > 0 ? fallbackDays[selectedDay] : null;

  const tempBarData = selectedDaily
    ? [
        { label: "Morn", temp: Math.round(selectedDaily.temp.morn) },
        { label: "Day", temp: Math.round(selectedDaily.temp.day) },
        { label: "Eve", temp: Math.round(selectedDaily.temp.eve) },
        { label: "Night", temp: Math.round(selectedDaily.temp.night) },
      ]
    : selectedFallback?.hourly.map((h) => ({ label: h.time, temp: h.temp })) ?? [];

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
            {useDaily ? "7-Day Forecast" : "5-Day Hourly Forecast"}
          </h1>
          <p className="text-muted-foreground">
            {cityName && cityCountry ? `${cityName}, ${cityCountry}` : "Detailed weather forecast"}
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
              {dailyError instanceof Error ? dailyError.message : "Failed to load forecast"}
            </p>
          </CardContent>
        </Card>
      )}

      {totalDays > 0 && (
        <>
          <div className={`grid gap-3 ${totalDays >= 7 ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-7" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"}`}>
            {useDaily
              ? dailyItems.map((day, i) => (
                  <Card
                    key={day.dt}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${i === selectedDay ? "border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" : ""}`}
                    onClick={() => setSelectedDay(i)}
                  >
                    <CardContent className="p-3 text-center">
                      <p className="text-sm font-medium text-muted-foreground">{getDayLabel(day.dt)}</p>
                      <p className="text-xs text-muted-foreground">{getDateStr(day.dt)}</p>
                      <img
                        src={getWeatherIconUrl(day.weather[0]?.icon || "01d")}
                        alt={day.weather[0]?.description}
                        className="w-10 h-10 mx-auto my-1"
                      />
                      <p className="text-xs capitalize text-muted-foreground truncate">
                        {day.weather[0]?.description}
                      </p>
                      <div className="flex justify-center gap-1.5 mt-1.5">
                        <span className="text-sm font-bold">{Math.round(day.temp.max)}°</span>
                        <span className="text-sm text-muted-foreground">{Math.round(day.temp.min)}°</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1 text-xs text-blue-400">
                        <Droplets className="w-3 h-3" />
                        {Math.round((day.pop ?? 0) * 100)}%
                      </div>
                    </CardContent>
                  </Card>
                ))
              : fallbackDays.map((day, i) => (
                  <Card
                    key={day.date}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${i === selectedDay ? "border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" : ""}`}
                    onClick={() => setSelectedDay(i)}
                  >
                    <CardContent className="p-3 text-center">
                      <p className="text-sm font-medium text-muted-foreground">{day.dayLabel}</p>
                      <p className="text-xs text-muted-foreground">{day.date.slice(5)}</p>
                      <img
                        src={getWeatherIconUrl(day.icon)}
                        alt={day.description}
                        className="w-10 h-10 mx-auto my-1"
                      />
                      <p className="text-xs capitalize text-muted-foreground truncate">{day.description}</p>
                      <div className="flex justify-center gap-1.5 mt-1.5">
                        <span className="text-sm font-bold">{Math.round(day.maxTemp)}°</span>
                        <span className="text-sm text-muted-foreground">{Math.round(day.minTemp)}°</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1 text-xs text-blue-400">
                        <Droplets className="w-3 h-3" />
                        {Math.round(day.pop * 100)}%
                      </div>
                    </CardContent>
                  </Card>
                ))
            }
          </div>

          {(selectedDaily || selectedFallback) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <ThermometerSun className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature Range</p>
                    <p className="text-lg font-bold font-mono">
                      {selectedDaily
                        ? `${Math.round(selectedDaily.temp.min)}° — ${Math.round(selectedDaily.temp.max)}°C`
                        : `${Math.round(selectedFallback!.minTemp)}° — ${Math.round(selectedFallback!.maxTemp)}°C`}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <Droplets className="w-6 h-6 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                    <p className="text-lg font-bold font-mono">
                      {selectedDaily ? selectedDaily.humidity : selectedFallback!.humidity}%
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <Wind className="w-6 h-6 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wind Speed</p>
                    <p className="text-lg font-bold font-mono">
                      {selectedDaily
                        ? `${(selectedDaily.wind_speed * 3.6).toFixed(1)} km/h`
                        : `${(selectedFallback!.windSpeed * 3.6).toFixed(1)} km/h`}
                    </p>
                  </div>
                </CardContent>
              </Card>
              {selectedDaily && (selectedDaily.sunrise || selectedDaily.sunset) && (
                <Card>
                  <CardContent className="p-5 space-y-1">
                    <div className="flex items-center gap-2">
                      <Sunrise className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs text-muted-foreground">Sunrise</span>
                      <span className="text-sm font-mono ml-auto">{formatLocalTime(selectedDaily.sunrise)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sunset className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-xs text-muted-foreground">Sunset</span>
                      <span className="text-sm font-mono ml-auto">{formatLocalTime(selectedDaily.sunset)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {tempBarData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDaily
                    ? `Temperature by Time of Day — ${getDayLabel(selectedDaily.dt)} (${getDateStr(selectedDaily.dt)})`
                    : selectedFallback
                    ? `Hourly Temperature — ${selectedFallback.dayLabel} (${selectedFallback.date.slice(5)})`
                    : "Temperature"}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tempBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="°" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="temp" radius={[6, 6, 0, 0]} barSize={40} name="Temp (°C)">
                      {tempBarData.map((_e, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            tempBarData[idx].temp > 25
                              ? "#ef4444"
                              : tempBarData[idx].temp > 15
                              ? "#f59e0b"
                              : tempBarData[idx].temp > 5
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
