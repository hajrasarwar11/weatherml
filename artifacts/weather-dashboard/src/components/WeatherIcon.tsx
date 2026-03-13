import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  CloudLightning, 
  CloudFog, 
  CloudDrizzle,
  HelpCircle
} from "lucide-react";

export function WeatherIcon({ condition, className = "w-6 h-6" }: { condition: string, className?: string }) {
  const c = condition.toLowerCase();
  
  if (c.includes("snow")) return <CloudSnow className={className} />;
  if (c.includes("thunder")) return <CloudLightning className={className} />;
  if (c.includes("freezing") || c.includes("drizzle")) return <CloudDrizzle className={className} />;
  if (c.includes("rain")) return <CloudRain className={className} />;
  if (c.includes("fog") || c.includes("haze")) return <CloudFog className={className} />;
  if (c.includes("clear")) return <Sun className={className} />;
  if (c.includes("cloud")) return <Cloud className={className} />;
  
  return <HelpCircle className={className} />;
}
