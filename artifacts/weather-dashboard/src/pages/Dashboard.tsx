import { useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, BarChart3, Activity, Zap } from "lucide-react";
import { useDashboardData } from "@/hooks/use-weather-data";
import { EdaView } from "@/components/views/EdaView";
import { PredictView } from "@/components/views/PredictView";
import { PerformanceView } from "@/components/views/PerformanceView";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"eda" | "predict" | "performance">("eda");
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <CloudRain className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
        </div>
        <h2 className="mt-8 text-2xl font-display font-bold text-foreground">Loading Datasets...</h2>
        <p className="text-muted-foreground mt-2">Fetching EDA stats and model metrics</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
          <Activity className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Failed to load data</h2>
        <p className="text-muted-foreground max-w-md">
          Make sure the Python ML pipeline has been run and the API is reachable.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "eda", label: "EDA Explorer", icon: BarChart3 },
    { id: "predict", label: "Live Predictor", icon: Zap },
    { id: "performance", label: "Model Performance", icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <CloudRain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold tracking-tight text-white">WeatherML</h1>
                <p className="text-xs text-muted-foreground font-medium">Predictive Intelligence Dashboard</p>
              </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex p-1 bg-card/80 border border-border/50 rounded-xl shadow-inner backdrop-blur-md">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors outline-none ${
                      isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === "eda" && <EdaView data={data} />}
        {activeTab === "predict" && <PredictView />}
        {activeTab === "performance" && <PerformanceView data={data} />}
      </main>
    </div>
  );
}
