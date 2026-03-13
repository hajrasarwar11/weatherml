import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/use-weather-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Thermometer,
  ThermometerSnowflake,
  Droplets,
  TrendingUp,
  Activity,
  CloudRain,
  Loader2,
} from "lucide-react";

const COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#f97316", "#ec4899",
];

const tooltipStyle = {
  backgroundColor: "#1e293b",
  borderColor: "#334155",
  borderRadius: "8px",
  color: "#f1f5f9",
};

export function AnalyticsPage() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <Activity className="w-10 h-10 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Failed to load analytics</h2>
        <p className="text-muted-foreground mt-2">Make sure the API server is running.</p>
      </div>
    );
  }

  const monthly = data.monthlyData || [];
  const classDist = data.classDistData || [];

  const hottestMonth = monthly.length
    ? monthly.reduce((prev, curr) => (curr.Temp_C > prev.Temp_C ? curr : prev))
    : null;
  const coldestMonth = monthly.length
    ? monthly.reduce((prev, curr) => (curr.Temp_C < prev.Temp_C ? curr : prev))
    : null;
  const avgHumidity = monthly.length
    ? (
        monthly.reduce((sum, m) => sum + (m["Rel Hum_%"] || 0), 0) / monthly.length
      ).toFixed(1)
    : "N/A";
  const avgWind = monthly.length
    ? (
        monthly.reduce((sum, m) => sum + (m["Wind Speed_km/h"] || 0), 0) / monthly.length
      ).toFixed(1)
    : "N/A";
  const mostHumidMonth = monthly.length
    ? monthly.reduce((prev, curr) => ((curr["Rel Hum_%"] || 0) > (prev["Rel Hum_%"] || 0) ? curr : prev))
    : null;

  const pieData = classDist;

  const totalRecords = classDist.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-10"
    >
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Weather Analytics
        </h1>
        <p className="text-muted-foreground">
          Statistical insights derived from {totalRecords.toLocaleString()} hourly weather
          observations
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-red-500/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Warmest Month</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {hottestMonth ? `${hottestMonth.Temp_C.toFixed(1)}°C` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {hottestMonth ? `${hottestMonth.month} (avg)` : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <ThermometerSnowflake className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Coldest Month</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {coldestMonth ? `${coldestMonth.Temp_C.toFixed(1)}°C` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {coldestMonth ? `${coldestMonth.month} (avg)` : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-cyan-500/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Avg Humidity</span>
            </div>
            <p className="text-2xl font-bold font-mono">{avgHumidity}%</p>
            <p className="text-xs text-muted-foreground mt-1">yearly average</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Avg Wind Speed</span>
            </div>
            <p className="text-2xl font-bold font-mono">{avgWind} km/h</p>
            <p className="text-xs text-muted-foreground mt-1">yearly average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-primary" />
              Weather Type Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pieData}
                layout="vertical"
                margin={{ top: 10, right: 40, left: 80, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#f1f5f9", fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [value.toLocaleString(), "Count"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Temperature & Humidity</CardTitle>
          </CardHeader>
          <CardContent className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar yAxisId="left" dataKey="Temp_C" name="Temp (°C)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="Rel Hum_%" name="Humidity (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temperature Trend (Monthly Avg)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="Temp_C"
                  name="Temperature (°C)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#tempGrad)"
                  dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }}
                />
                <Area
                  type="monotone"
                  dataKey="Dew Point Temp_C"
                  name="Dew Point (°C)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="none"
                  dot={{ r: 3, strokeWidth: 2, fill: "#0f172a" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wind Speed & Visibility Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#10b981" />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Wind Speed_km/h"
                  name="Wind Speed (km/h)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#0f172a" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Visibility_km"
                  name="Visibility (km)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#0f172a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Pressure Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis domain={["auto", "auto"]} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="Press_kPa"
                name="Pressure (kPa)"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#pressGrad)"
                dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
