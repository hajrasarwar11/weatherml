import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Thermometer, Wind, CloudRain, Layers } from "lucide-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useApiKeyStatus } from "@/hooks/use-live-weather";
import { ApiKeyMissing } from "@/components/ApiKeyMissing";
import { CitySearch } from "@/components/CitySearch";
import "leaflet/dist/leaflet.css";

const LAYERS = [
  { id: "temp_new", label: "Temperature", icon: Thermometer, color: "text-red-400" },
  { id: "wind_new", label: "Wind", icon: Wind, color: "text-cyan-400" },
  { id: "precipitation_new", label: "Precipitation", icon: CloudRain, color: "text-blue-400" },
  { id: "clouds_new", label: "Clouds", icon: Layers, color: "text-gray-400" },
] as const;

const API_BASE = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

function CityFlyTo({ city }: { city: string }) {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    async function geocode() {
      try {
        const res = await fetch(`${API_BASE}/weather/geocode?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          map.flyTo([data[0].lat, data[0].lon], 8, { duration: 1.5 });
        }
      } catch {
        /* ignore */
      }
    }
    geocode();
    return () => { cancelled = true; };
  }, [city, map]);

  return null;
}

export function WeatherMapPage() {
  const [city, setCity] = useState("Toronto");
  const [activeLayer, setActiveLayer] = useState<string>("temp_new");
  const { data: keyStatus, isLoading: keyLoading } = useApiKeyStatus();

  const tileProxyUrl = `${API_BASE}/weather/tiles/${activeLayer}/{z}/{x}/{y}`;

  if (keyLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (keyStatus && !keyStatus.configured) return <ApiKeyMissing />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            Weather Map
          </h1>
          <p className="text-muted-foreground">Interactive weather overlay map</p>
        </div>
        <CitySearch city={city} onCityChange={setCity} />
      </div>

      <div className="flex flex-wrap gap-2">
        {LAYERS.map((layer) => {
          const Icon = layer.icon;
          return (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeLayer === layer.id
                  ? "bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${activeLayer === layer.id ? "text-white" : layer.color}`} />
              {layer.label}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 h-[500px] md:h-[600px]">
          <MapContainer
            center={[43.65, -79.38]}
            zoom={6}
            className="w-full h-full"
            style={{ background: "#0f172a" }}
          >
            <TileLayer
              attribution='Map tiles by <a href="https://carto.com">CartoDB</a>. Weather overlays by <a href="https://openweathermap.org">OpenWeatherMap</a>.'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <TileLayer
              url={tileProxyUrl}
              opacity={0.6}
            />
            <CityFlyTo city={city} />
          </MapContainer>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Map tiles by CartoDB. Weather overlays by OpenWeatherMap.
      </p>
    </motion.div>
  );
}
