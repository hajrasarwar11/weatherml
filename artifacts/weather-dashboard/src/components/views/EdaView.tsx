import { Fragment } from "react";
import type { DashboardData } from "@/hooks/use-weather-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, ScatterChart, Scatter, ZAxis
} from "recharts";
import { Activity, Database, Droplets, Thermometer } from "lucide-react";
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
    <div className="overflow-x-auto pb-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `max-content repeat(${keys.length}, minmax(40px, 1fr))` }}>
        <div className="p-2"></div>
        {keys.map(k => (
          <div key={k} className="p-1 text-[9px] font-mono text-muted-foreground truncate text-center">
            {k.replace(/_/g, ' ')}
          </div>
        ))}
        
        {keys.map(rowKey => (
          <Fragment key={rowKey}>
            <div className="p-1 text-[9px] font-mono text-muted-foreground flex items-center justify-end text-right pr-2 truncate">
              {rowKey.replace(/_/g, ' ')}
            </div>
            {keys.map(colKey => {
              const val = matrix[rowKey]?.[colKey] ?? 0;
              return (
                <div 
                  key={`${rowKey}-${colKey}`}
                  className="aspect-square flex items-center justify-center rounded-sm text-[8px] font-mono font-medium transition-transform hover:scale-110 hover:z-10 cursor-crosshair border border-white/5"
                  style={{ 
                    backgroundColor: getColor(val),
                    color: Math.abs(val) > 0.4 ? 'white' : 'hsl(var(--muted-foreground))'
                  }}
                  title={`${rowKey} x ${colKey}: ${val}`}
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Records</p>
              <h3 className="text-2xl font-bold font-mono">{datasetInfo.total_rows?.toLocaleString() || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Features</p>
              <h3 className="text-2xl font-bold font-mono">{datasetInfo.feature_columns?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Weather Classes</p>
              <h3 className="text-2xl font-bold font-mono">{data.classDistData?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Numeric Cols</p>
              <h3 className="text-2xl font-bold font-mono">{datasetInfo.numeric_columns?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weather Class Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.classDistData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" tick={{fontSize: 12}} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.classDistData?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Average Temperature (°C)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Temp_C" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temperature vs Humidity (Sample)</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" dataKey="temp" name="Temperature" unit="°C" stroke="#94a3b8" />
                <YAxis type="number" dataKey="humidity" name="Humidity" unit="%" stroke="#94a3b8" />
                <ZAxis type="category" dataKey="weather" name="Weather" />
                <Tooltip 
                  cursor={{strokeDasharray: '3 3'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Scatter name="Weather" data={data.scatterData} fill="#3b82f6" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Correlation Matrix</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center overflow-auto">
            {data.corrMatrix && <CorrelationHeatmap matrix={data.corrMatrix} />}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
