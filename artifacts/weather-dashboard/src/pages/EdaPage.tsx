import { CloudRain, Activity, Loader2 } from "lucide-react";
import { useDashboardData } from "@/hooks/use-weather-data";
import { EdaView } from "@/components/views/EdaView";

export function EdaPage() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading EDA data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <Activity className="w-10 h-10 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Failed to load data</h2>
        <p className="text-muted-foreground mt-2">Make sure the API server is running.</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">EDA Explorer</h1>
        <p className="text-muted-foreground">
          Explore the dataset with interactive visualizations and statistical summaries
        </p>
      </div>
      <EdaView data={data} />
    </div>
  );
}
