import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  CloudRain,
  Sunrise,
  Sunset,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useApiKeyStatus, useCurrentWeather, useForecast } from "@/hooks/use-live-weather";
import { ApiKeyMissing } from "@/components/ApiKeyMissing";
import { CitySearch } from "@/components/CitySearch";

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#f1f5f9",
};

function formatTime(timestamp: number, timezone: number) {
  const d = new Date((timestamp + timezone) * 1000);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

function getWeatherIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function WeatherDashboardPage() {
  const [city, setCity] = useState("Toronto");
  const [sliderIndex, setSliderIndex] = useState(0);
  const { data: keyStatus, isLoading: keyLoading } = useApiKeyStatus();
  const { data: current, isLoading, error } = useCurrentWeather(city);
  const { data: forecast } = useForecast(city);

  if (keyLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (keyStatus && !keyStatus.configured) return <ApiKeyMissing />;

  const hourlyData = forecast?.list?.map((item: Record<string, unknown>) => {
    const dt = new Date((item.dt as number) * 1000);
    return {
      time: dt.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric" }),
      shortTime: dt.toLocaleTimeString("en-US", { hour: "numeric" }),
      temp: Math.round((item.main as Record<string, number>).temp),
      humidity: (item.main as Record<string, number>).humidity,
      feelsLike: Math.round((item.main as Record<string, number>).feels_like),
      windKmh: Math.round(((item.wind as Record<string, number>)?.speed ?? 0) * 3.6),
    };
  }) || [];

  const selectedHour = hourlyData[sliderIndex];

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
            Weather Dashboard
          </h1>
          <p className="text-muted-foreground">Live weather conditions powered by OpenWeatherMap</p>
        </div>
        <CitySearch city={city} onCityChange={(c) => { setCity(c); setSliderIndex(0); }} />
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

      {current && !error && (
        <>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4">
                  {current.weather?.[0]?.icon && (
                    <img
                      src={getWeatherIconUrl(current.weather[0].icon)}
                      alt={current.weather[0].description}
                      className="w-24 h-24"
                    />
                  )}
                  <div>
                    <p className="text-5xl font-bold font-mono">
                      {Math.round(current.main.temp)}°C
                    </p>
                    <p className="text-lg text-muted-foreground capitalize mt-1">
                      {current.weather?.[0]?.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {current.name}, {current.sys?.country}
                    </p>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <p className="text-xs text-muted-foreground mb-1">
                    Feels like {Math.round(current.main.feels_like)}°C
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Min {Math.round(current.main.temp_min)}°C / Max{" "}
                    {Math.round(current.main.temp_max)}°C
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Thermometer className="w-5 h-5 text-red-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Dew Point</p>
                <p className="text-lg font-bold font-mono">
                  {current.main.temp !== undefined
                    ? `${(current.main.temp - ((100 - current.main.humidity) / 5)).toFixed(1)}°C`
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-lg font-bold font-mono">{current.main.humidity}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Wind className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Wind Speed</p>
                <p className="text-lg font-bold font-mono">
                  {(current.wind.speed * 3.6).toFixed(1)} km/h
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Visibility</p>
                <p className="text-lg font-bold font-mono">
                  {(current.visibility / 1000).toFixed(1)} km
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Gauge className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Pressure</p>
                <p className="text-lg font-bold font-mono">
                  {(current.main.pressure / 10).toFixed(1)} kPa
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CloudRain className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Clouds</p>
                <p className="text-lg font-bold font-mono">{current.clouds?.all ?? 0}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Sunrise className="w-6 h-6 text-amber-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Sunrise</p>
                  <p className="text-lg font-bold font-mono">
                    {current.sys?.sunrise
                      ? formatTime(current.sys.sunrise, current.timezone)
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Sunset className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Sunset</p>
                  <p className="text-lg font-bold font-mono">
                    {current.sys?.sunset
                      ? formatTime(current.sys.sunset, current.timezone)
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {hourlyData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle>5-Day Temperature Trend (Forecast)</CardTitle>
                  {selectedHour && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium text-foreground">{selectedHour.time}</span>
                      <span className="font-mono text-primary">{selectedHour.temp}°C</span>
                      <span>·</span>
                      <span>{selectedHour.humidity}% RH</span>
                      <span>·</span>
                      <span>{selectedHour.windKmh} km/h</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="shortTime" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={3} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="°" />
                      <Tooltip contentStyle={tooltipStyle} />
                      {selectedHour && (
                        <ReferenceLine
                          x={selectedHour.shortTime}
                          stroke="#a78bfa"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        fill="url(#tempGrad)"
                        strokeWidth={2}
                        name="Temp (°C)"
                        dot={{ r: 3, fill: "#3b82f6" }}
                        activeDot={{ r: 5, fill: "#3b82f6" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="px-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Timeline</span>
                    <span className="text-xs text-muted-foreground">
                      Hour {sliderIndex + 1} of {hourlyData.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={hourlyData.length - 1}
                    value={sliderIndex}
                    onChange={(e) => setSliderIndex(Number(e.target.value))}
                    className="w-full h-2 rounded-full bg-card border border-border/50 accent-primary cursor-pointer"
                    aria-label="Select hour on temperature timeline"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{hourlyData[0]?.time}</span>
                    <span className="text-[10px] text-muted-foreground">{hourlyData[hourlyData.length - 1]?.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}
