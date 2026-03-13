import { Fragment } from "react";
import type { DashboardData } from "@/hooks/use-weather-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis
} from "recharts";
import { Activity, Database, Droplets, Thermometer, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#f97316", "#ec4899"
];

function CorrelationHeatmap({ matrix }: { matrix: Record<string, Record<string, number>> }) {
  const keys = Object.keys(matrix);
  
  const getColor = (val: number) => {
    if (val < 0) return `rgba(220, 38, 38, ${Math.abs(val)})`;
    return `rgba(59, 130, 246, ${val})`;
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `max-content repeat(${keys.length}, minmax(36px, 1fr))` }}
      >
        <div className="p-1" />
        {keys.map((k) => (
          <div key={k} className="p-1 text-[9px] font-mono text-muted-foreground truncate text-center">
            {k.replace(/_/g, " ")}
          </div>
        ))}

        {keys.map((rowKey) => (
          <Fragment key={rowKey}>
            <div className="p-1 text-[9px] font-mono text-muted-foreground flex items-center justify-end text-right pr-2 truncate">
              {rowKey.replace(/_/g, " ")}
            </div>
            {keys.map((colKey) => {
              const val = matrix[rowKey]?.[colKey] ?? 0;
              return (
                <div
                  key={`${rowKey}-${colKey}`}
                  className="aspect-square flex items-center justify-center rounded-sm text-[8px] font-mono font-medium transition-transform hover:scale-110 hover:z-10 cursor-crosshair border border-white/5"
                  style={{
                    backgroundColor: getColor(val),
                    color: Math.abs(val) > 0.4 ? "white" : "hsl(var(--muted-foreground))",
                  }}
                  title={`${rowKey} × ${colKey}: ${val.toFixed(2)}`}
                >
                  {val.toFixed(1)}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function EdaView({ data }: { data: DashboardData }) {
  const datasetInfo = data.datasetInfo;
  const featureCols: string[] = datasetInfo.feature_columns ?? [];
  const numericCols: string[] = datasetInfo.numeric_columns ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card via-card/80 to-blue-500/5 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Raw Data Exploration</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Explore the underlying structure of the dataset — feature distributions, inter-feature correlations,
            and scatter relationships. This view focuses on the raw data before any modelling is applied.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Database className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">Total Records</p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono">{datasetInfo.total_rows?.toLocaleString() || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">Model Features</p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono">{featureCols.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Thermometer className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">Weather Classes</p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono">{data.classDistData?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">Numeric Cols</p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono">{numericCols.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {featureCols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Model Input Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These {featureCols.length} features are fed into the Random Forest classifier after preprocessing and feature engineering.
            </p>
            <div className="flex flex-wrap gap-2">
              {featureCols.map((f, i) => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-border/50 bg-card/60"
                  style={{ color: COLORS[i % COLORS.length] }}
                >
                  {f}
                </span>
              ))}
            </div>
            {datasetInfo.target_column && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Target column:</span>
                <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium border border-primary/40 bg-primary/10 text-primary">
                  {datasetInfo.target_column}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temperature vs Humidity (Sample)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  type="number"
                  dataKey="temp"
                  name="Temperature"
                  unit="°C"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="humidity"
                  name="Humidity"
                  unit="%"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                />
                <ZAxis type="category" dataKey="weather" name="Weather" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                    fontSize: "12px",
                  }}
                />
                <Scatter name="Weather" data={data.scatterData}>
                  {data.scatterData?.map((entry, index) => {
                    const hash = (entry.weather || "")
                      .split("")
                      .reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
                    return (
                      <Cell key={`cell-${index}`} fill={COLORS[hash % COLORS.length]} opacity={0.65} />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Correlation Matrix</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center overflow-auto py-2">
            {data.corrMatrix ? (
              <CorrelationHeatmap matrix={data.corrMatrix} />
            ) : (
              <p className="text-sm text-muted-foreground py-8">Correlation data not available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
