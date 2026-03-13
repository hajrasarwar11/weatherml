import { PredictView } from "@/components/views/PredictView";

export function PredictPage() {
  return (
    <div className="pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Live Weather Prediction
        </h1>
        <p className="text-muted-foreground">
          Input sensor readings and get instant AI-powered weather classification
        </p>
      </div>
      <PredictView />
    </div>
  );
}
