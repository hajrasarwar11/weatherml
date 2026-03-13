import { Router, type IRouter } from "express";

const router: IRouter = Router();

const OWM_BASE = "https://api.openweathermap.org/data/2.5";
const OWM_GEO = "https://api.openweathermap.org/geo/1.0";
const OWM_TILE = "https://tile.openweathermap.org/map";

function getApiKey(): string | null {
  return process.env.OPENWEATHER_API_KEY || null;
}

router.get("/weather/current", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).json({ error: "OPENWEATHER_API_KEY not configured" });
    return;
  }
  const city = (req.query.city as string) || "Toronto";
  try {
    const resp = await fetch(
      `${OWM_BASE}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const data = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch current weather" });
  }
});

router.get("/weather/forecast", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).json({ error: "OPENWEATHER_API_KEY not configured" });
    return;
  }
  const city = (req.query.city as string) || "Toronto";
  try {
    const resp = await fetch(
      `${OWM_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&cnt=40`
    );
    const data = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch forecast" });
  }
});

router.get("/weather/geocode", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).json({ error: "OPENWEATHER_API_KEY not configured" });
    return;
  }
  const city = (req.query.city as string) || "Toronto";
  try {
    const resp = await fetch(
      `${OWM_GEO}/direct?q=${encodeURIComponent(city)}&limit=5&appid=${apiKey}`
    );
    const data = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to geocode city" });
  }
});

router.get("/weather/alerts", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).json({ error: "OPENWEATHER_API_KEY not configured" });
    return;
  }
  const city = (req.query.city as string) || "Toronto";
  try {
    const resp = await fetch(
      `${OWM_BASE}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const current = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json(current);
      return;
    }

    const alerts: Array<{
      id: string;
      title: string;
      description: string;
      severity: "critical" | "warning" | "info";
      value?: number;
      threshold?: number;
      unit?: string;
    }> = [];

    const main = current.main ?? {};
    const wind = current.wind ?? {};
    const visibility = current.visibility ?? 10000;
    const weatherArr: Array<{ id: number; main: string; description: string }> =
      current.weather ?? [];

    if (visibility < 1000) {
      alerts.push({
        id: "fog",
        title: "Dense Fog Advisory",
        description: `Visibility is critically low at ${(visibility / 1000).toFixed(2)} km. Reduce speed and use fog lights.`,
        severity: "critical",
        value: visibility,
        threshold: 1000,
        unit: "m",
      });
    } else if (visibility < 5000) {
      alerts.push({
        id: "low-vis",
        title: "Reduced Visibility",
        description: `Visibility is below 5 km (${(visibility / 1000).toFixed(1)} km). Drive with caution.`,
        severity: "warning",
        value: visibility,
        threshold: 5000,
        unit: "m",
      });
    }

    const windKmh = (wind.speed ?? 0) * 3.6;
    if (windKmh > 80) {
      alerts.push({
        id: "high-wind",
        title: "High Wind Warning",
        description: `Wind gusts of ${windKmh.toFixed(0)} km/h. Secure outdoor items and avoid driving high-profile vehicles.`,
        severity: "critical",
        value: windKmh,
        threshold: 80,
        unit: "km/h",
      });
    } else if (windKmh > 50) {
      alerts.push({
        id: "wind-advisory",
        title: "Wind Advisory",
        description: `Sustained winds at ${windKmh.toFixed(0)} km/h. Expect difficult driving conditions.`,
        severity: "warning",
        value: windKmh,
        threshold: 50,
        unit: "km/h",
      });
    }

    if (main.temp !== undefined && main.temp < -20) {
      alerts.push({
        id: "extreme-cold",
        title: "Extreme Cold Warning",
        description: `Temperature at ${main.temp.toFixed(1)}°C. Limit time outdoors; frostbite risk within minutes of exposure.`,
        severity: "critical",
        value: main.temp,
        threshold: -20,
        unit: "°C",
      });
    } else if (main.temp !== undefined && main.temp < -10) {
      alerts.push({
        id: "cold",
        title: "Cold Temperature Advisory",
        description: `Temperature at ${main.temp.toFixed(1)}°C. Bundle up to prevent frostbite on exposed skin.`,
        severity: "warning",
        value: main.temp,
        threshold: -10,
        unit: "°C",
      });
    }

    if (main.temp !== undefined && main.temp > 35) {
      alerts.push({
        id: "heat",
        title: "Heat Warning",
        description: `Temperature at ${main.temp.toFixed(1)}°C. Stay hydrated and avoid prolonged sun exposure.`,
        severity: "critical",
        value: main.temp,
        threshold: 35,
        unit: "°C",
      });
    }

    if (main.pressure !== undefined && main.pressure < 980) {
      alerts.push({
        id: "low-pressure",
        title: "Low Pressure System",
        description: `Barometric pressure at ${(main.pressure / 10).toFixed(1)} kPa indicates an approaching storm system.`,
        severity: "info",
        value: main.pressure,
        threshold: 980,
        unit: "hPa",
      });
    }

    const weatherCondition = weatherArr[0]?.id ?? 0;
    if (weatherCondition >= 200 && weatherCondition < 300) {
      alerts.push({
        id: "thunderstorm",
        title: "Thunderstorm Alert",
        description: "Thunderstorm activity detected. Stay indoors and away from windows.",
        severity: "critical",
      });
    }
    if (weatherCondition >= 511 && weatherCondition <= 531) {
      alerts.push({
        id: "freezing-rain",
        title: "Freezing Rain / Sleet",
        description: "Freezing precipitation detected. Roads are likely icy — drive with extreme caution.",
        severity: "critical",
      });
    }

    res.json({
      city: current.name,
      country: current.sys?.country,
      current,
      alerts,
      allClear: alerts.length === 0,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch alerts data" });
  }
});

router.get("/weather/api-key-status", (_req, res) => {
  const apiKey = getApiKey();
  res.json({ configured: !!apiKey });
});

router.get("/weather/tiles/:layer/:z/:x/:y", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).end();
    return;
  }
  const { layer, z, x, y } = req.params;
  const validLayers = ["temp_new", "wind_new", "precipitation_new", "clouds_new", "pressure_new"];
  if (!validLayers.includes(layer)) {
    res.status(400).json({ error: "Invalid layer" });
    return;
  }
  try {
    const resp = await fetch(
      `${OWM_TILE}/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`
    );
    if (!resp.ok) {
      res.status(resp.status).end();
      return;
    }
    const buffer = await resp.arrayBuffer();
    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "public, max-age=600");
    res.send(Buffer.from(buffer));
  } catch {
    res.status(500).end();
  }
});

export default router;
