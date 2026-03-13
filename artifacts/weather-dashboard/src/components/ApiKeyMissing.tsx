import { KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ApiKeyMissing() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">API Key Not Configured</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This page requires an OpenWeatherMap API key. Set the{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">OPENWEATHER_API_KEY</code>{" "}
            environment variable to enable live weather data.
          </p>
          <p className="text-muted-foreground text-xs">
            Sign up for a free key at{" "}
            <a
              href="https://openweathermap.org/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              openweathermap.org
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
