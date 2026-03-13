import { CloudRain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/40 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CloudRain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-display font-bold text-foreground leading-tight">
                WeatherML
              </p>
              <p className="text-xs text-muted-foreground">
                AI Weather Analytics Platform
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center sm:text-right">
            &copy; {new Date().getFullYear()} WeatherML. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
