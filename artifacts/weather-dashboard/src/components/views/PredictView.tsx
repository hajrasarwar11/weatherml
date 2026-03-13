import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useWeatherPrediction } from "@/hooks/use-weather-data";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Cloud, Loader2, Zap } from "lucide-react";
import { cn, formatPercentage } from "@/lib/utils";

export function PredictView() {
  const [inputs, setInputs] = useState({
    temp_c: 15.0,
    dew_point_temp_c: 10.0,
    rel_hum: 65,
    wind_speed_kmh: 15,
    visibility_km: 25,
    press_kpa: 101.2
  });

  const { mutate, data: result, isPending } = useWeatherPrediction();

  const handlePredict = () => {
    mutate({ data: inputs });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Input Form */}
      <Card className="lg:col-span-7 border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Sensor Readings Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            <Slider 
              label="Temperature" 
              value={inputs.temp_c} 
              min={-30} max={40} step={0.1} unit="°C"
              onChange={(val) => setInputs(prev => ({ ...prev, temp_c: val }))}
            />
            <Slider 
              label="Dew Point Temp" 
              value={inputs.dew_point_temp_c} 
              min={-40} max={30} step={0.1} unit="°C"
              onChange={(val) => setInputs(prev => ({ ...prev, dew_point_temp_c: val }))}
            />
            <Slider 
              label="Relative Humidity" 
              value={inputs.rel_hum} 
              min={0} max={100} step={1} unit="%"
              onChange={(val) => setInputs(prev => ({ ...prev, rel_hum: val }))}
            />
            <Slider 
              label="Wind Speed" 
              value={inputs.wind_speed_kmh} 
              min={0} max={100} step={1} unit=" km/h"
              onChange={(val) => setInputs(prev => ({ ...prev, wind_speed_kmh: val }))}
            />
            <Slider 
              label="Visibility" 
              value={inputs.visibility_km} 
              min={0} max={50} step={0.1} unit=" km"
              onChange={(val) => setInputs(prev => ({ ...prev, visibility_km: val }))}
            />
            <Slider 
              label="Pressure" 
              value={inputs.press_kpa} 
              min={95} max={105} step={0.01} unit=" kPa"
              onChange={(val) => setInputs(prev => ({ ...prev, press_kpa: val }))}
            />
          </div>

          <button
            onClick={handlePredict}
            disabled={isPending}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg text-primary-foreground bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
          >
            {isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Running Model...
              </>
            ) : (
              "Predict Weather"
            )}
          </button>
        </CardContent>
      </Card>

      {/* Result Display */}
      <div className="lg:col-span-5 h-full relative">
        {/* Background Decorative Image */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
          <img 
            src={`${import.meta.env.BASE_URL}images/weather-hero.png`} 
            alt="Weather Abstract" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <AnimatePresence mode="wait">
          {!result && !isPending && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-border/50 rounded-2xl bg-card/40 backdrop-blur-sm"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 border border-border/50">
                <Cloud className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Waiting for input</h3>
              <p className="text-muted-foreground mt-2">Adjust the sensors on the left and hit predict to see the ML model's output.</p>
            </motion.div>
          )}

          {isPending && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 border border-border/50 rounded-2xl bg-card/40 backdrop-blur-sm"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-primary mt-6 tracking-wide">Processing Features...</h3>
            </motion.div>
          )}

          {result && !isPending && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="h-full rounded-2xl bg-gradient-to-br from-card to-card/50 border border-primary/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col"
            >
              <div className="p-8 pb-6 flex-grow flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center shadow-2xl mb-6 relative group"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all" />
                  <WeatherIcon condition={result.predicted_weather} className="w-16 h-16 text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-2">Prediction</p>
                  <h2 className="text-4xl font-black text-foreground mb-4 drop-shadow-md">{result.predicted_weather}</h2>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <span className="text-lg font-bold text-accent font-mono">{formatPercentage(result.confidence)}</span>
                  </div>
                </motion.div>
              </div>

              <div className="bg-black/40 p-6 border-t border-white/5 backdrop-blur-xl">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Class Probabilities</h4>
                <div className="space-y-3">
                  {Object.entries(result.probabilities || {})
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 4) // Show top 4
                    .map(([cls, prob], idx) => {
                      const p = prob as number;
                      return (
                        <div key={cls} className="flex items-center gap-3">
                          <div className="w-24 truncate text-sm font-medium text-foreground/80">{cls}</div>
                          <div className="flex-grow h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${p * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.4 + (idx * 0.1) }}
                              className={cn(
                                "h-full rounded-full",
                                idx === 0 ? "bg-primary" : "bg-primary/40"
                              )}
                            />
                          </div>
                          <div className="w-12 text-right text-xs font-mono text-muted-foreground">{formatPercentage(p)}</div>
                        </div>
                      );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
