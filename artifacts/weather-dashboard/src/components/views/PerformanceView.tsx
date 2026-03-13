import { Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatPercentage } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

function ConfusionMatrixGrid({ matrix, labels }: { matrix: number[][], labels: string[] }) {
  let maxVal = 0;
  matrix.forEach(row => row.forEach(val => { if (val > maxVal) maxVal = val; }));

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `max-content repeat(${labels.length}, minmax(40px, 1fr))` }}>
        <div className="p-2"></div>
        {labels.map(l => (
          <div key={l} className="p-1 text-[9px] font-mono text-muted-foreground truncate text-center">
            {l}
          </div>
        ))}
        
        {matrix.map((row, i) => (
          <Fragment key={i}>
            <div className="p-1 text-[9px] font-mono text-muted-foreground flex items-center justify-end text-right pr-2 truncate">
              {labels[i]}
            </div>
            {row.map((val, j) => {
              const isDiagonal = i === j;
              const intensity = maxVal > 0 ? val / maxVal : 0;
              let bg = `rgba(255,255,255,0.02)`;
              if (val > 0) {
                 bg = isDiagonal 
                  ? `rgba(59, 130, 246, ${intensity * 0.8 + 0.2})`
                  : `rgba(168, 85, 247, ${intensity * 0.8 + 0.2})`;
              }

              return (
                <div 
                  key={`${i}-${j}`}
                  className="aspect-square flex items-center justify-center rounded-sm text-[9px] font-mono font-medium transition-transform hover:scale-110 hover:z-10 cursor-crosshair border border-white/5"
                  style={{ 
                    backgroundColor: bg,
                    color: intensity > 0.4 ? 'white' : '#94a3b8'
                  }}
                  title={`True: ${labels[i]}, Pred: ${labels[j]} = ${val}`}
                >
                  {val === 0 ? '-' : val}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function PerformanceView({ data }: { data: any }) {
  const { testAccuracy, cvAccuracy, bestParams, featureImportanceData, perClassMetrics, confusionMatrix, classLabels } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-[hsl(222,47%,9%)] to-[rgba(59,130,246,0.1)] border-blue-500/20">
          <CardContent className="p-8 flex flex-col justify-center h-full relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Random Forest Classifier</h3>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-6xl font-black text-foreground tracking-tighter">
                {formatPercentage(testAccuracy)}
              </span>
              <span className="text-xl font-medium text-blue-400">Test Accuracy</span>
            </div>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">CV Accuracy</p>
                <p className="text-lg font-mono font-bold">{formatPercentage(cvAccuracy)}</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-sm text-muted-foreground">Optimized Parameters</p>
                <p className="text-sm font-mono mt-1 text-blue-300/80">
                  estimators: {bestParams?.n_estimators} | depth: {bestParams?.max_depth || 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Top Features</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData?.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{fill: '#f1f5f9', fontSize: 11}} width={90} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                  {featureImportanceData?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" opacity={1 - (index * 0.15)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <p className="text-sm text-muted-foreground">True Class vs Predicted Class</p>
          </CardHeader>
          <CardContent className="flex justify-center p-6 bg-black/20 rounded-b-2xl border-t border-white/5">
            {confusionMatrix && classLabels && (
              <ConfusionMatrixGrid matrix={confusionMatrix} labels={classLabels} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classification Report</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-4 px-6 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Class</th>
                    <th className="py-4 px-6 font-semibold text-muted-foreground text-sm uppercase tracking-wider text-right">Precision</th>
                    <th className="py-4 px-6 font-semibold text-muted-foreground text-sm uppercase tracking-wider text-right">Recall</th>
                    <th className="py-4 px-6 font-semibold text-muted-foreground text-sm uppercase tracking-wider text-right">F1-Score</th>
                    <th className="py-4 px-6 font-semibold text-muted-foreground text-sm uppercase tracking-wider text-right">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(perClassMetrics || {}).map(([cls, metrics]: [string, any]) => (
                    <tr key={cls} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-6 font-medium text-foreground">{cls}</td>
                      <td className="py-3 px-6 text-right font-mono">{formatPercentage(metrics.precision)}</td>
                      <td className="py-3 px-6 text-right font-mono">{formatPercentage(metrics.recall)}</td>
                      <td className="py-3 px-6 text-right font-mono text-blue-400">{formatPercentage(metrics.f1_score)}</td>
                      <td className="py-3 px-6 text-right font-mono text-muted-foreground">{metrics.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  );
}
