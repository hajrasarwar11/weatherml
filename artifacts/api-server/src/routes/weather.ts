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

async function fetchCurrentByCoords(
  lat: number,
  lon: number,
  apiKey: string
): Promise<Record<string, unknown>> {
  const resp = await fetch(
    `${OWM_BASE}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  const data = await resp.json();
  if (!resp.ok) throw Object.assign(new Error(data?.message ?? `HTTP ${resp.status}`), { status: resp.status, body: data });
  return data as Record<string, unknown>;
}

async function fetchOfficialAlerts(
  lat: number,
  lon: number,
  apiKey: string
): Promise<Array<{ event: string; description: string; start: number; end: number; sender_name: string }>> {
  try {
    const resp = await fetch(
      `${OWM_BASE}/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&exclude=minutely,hourly,daily,current`
    );
    if (!resp.ok) return [];
    const data = await resp.json() as Record<string, unknown>;
    if (Array.isArray(data.alerts)) {
      return data.alerts as Array<{ event: string; description: string; start: number; end: number; sender_name: string }>;
    }
    return [];
  } catch {
    return [];
  }
}

function deriveRuleAlerts(current: Record<string, unknown>): Array<{
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
}> {
  const alerts: Array<{
    id: string;
    title: string;
    description: string;
    severity: "critical" | "warning" | "info";
  }> = [];

  const main = (current.main ?? {}) as Record<string, number>;
  const wind = (current.wind ?? {}) as Record<string, number>;
  const visibility = (current.visibility as number) ?? 10000;
  const weatherArr = (current.weather as Array<{ id: number; main: string; description: string }>) ?? [];

  if (visibility < 1000) {
    alerts.push({
      id: "fog",
      title: "Dense Fog Advisory",
      description: `Visibility is critically low at ${(visibility / 1000).toFixed(2)} km. Reduce speed and use fog lights.`,
      severity: "critical",
    });
  } else if (visibility < 5000) {
    alerts.push({
      id: "low-vis",
      title: "Reduced Visibility",
      description: `Visibility is below 5 km (${(visibility / 1000).toFixed(1)} km). Drive with caution.`,
      severity: "warning",
    });
  }

  const windKmh = (wind.speed ?? 0) * 3.6;
  if (windKmh > 80) {
    alerts.push({
      id: "high-wind",
      title: "High Wind Warning",
      description: `Wind gusts of ${windKmh.toFixed(0)} km/h. Secure outdoor items and avoid driving high-profile vehicles.`,
      severity: "critical",
    });
  } else if (windKmh > 60) {
    alerts.push({
      id: "storm-wind",
      title: "Storm Wind Advisory",
      description: `Sustained winds at ${windKmh.toFixed(0)} km/h. Expect difficult driving conditions; secure loose objects.`,
      severity: "warning",
    });
  }

  if (main.humidity > 90) {
    alerts.push({
      id: "humidity",
      title: "Extreme Humidity Alert",
      description: `Humidity level at ${main.humidity}%. May cause discomfort and health risks for sensitive individuals.`,
      severity: "warning",
    });
  }

  if (main.temp !== undefined && main.temp < -20) {
    alerts.push({
      id: "extreme-cold",
      title: "Extreme Cold Warning",
      description: `Temperature at ${main.temp.toFixed(1)}°C. Limit time outdoors; frostbite risk within minutes of exposure.`,
      severity: "critical",
    });
  } else if (main.temp !== undefined && main.temp < -10) {
    alerts.push({
      id: "cold",
      title: "Cold Temperature Advisory",
      description: `Temperature at ${main.temp.toFixed(1)}°C. Bundle up to prevent frostbite on exposed skin.`,
      severity: "warning",
    });
  }

  if (main.temp !== undefined && main.temp > 35) {
    alerts.push({
      id: "heat",
      title: "Heat Warning",
      description: `Temperature at ${main.temp.toFixed(1)}°C. Stay hydrated and avoid prolonged sun exposure.`,
      severity: "critical",
    });
  }

  if (main.pressure !== undefined && main.pressure < 1000) {
    alerts.push({
      id: "low-pressure",
      title: "Low Pressure System",
      description: `Barometric pressure at ${(main.pressure / 10).toFixed(1)} kPa indicates an approaching storm system.`,
      severity: "info",
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

  return alerts;
}

router.get("/weather/alerts", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).json({ error: "OPENWEATHER_API_KEY not configured" });
    return;
  }

  const latParam = req.query.lat as string | undefined;
  const lonParam = req.query.lon as string | undefined;
  const cityParam = (req.query.city as string) || "Toronto";

  try {
    let current: Record<string, unknown>;
    let lat: number;
    let lon: number;

    if (latParam && lonParam) {
      lat = parseFloat(latParam);
      lon = parseFloat(lonParam);
      current = await fetchCurrentByCoords(lat, lon, apiKey);
    } else {
      const resp = await fetch(
        `${OWM_BASE}/weather?q=${encodeURIComponent(cityParam)}&appid=${apiKey}&units=metric`
      );
      current = await resp.json() as Record<string, unknown>;
      if (!resp.ok) {
        res.status(resp.status).json(current);
        return;
      }
      const coord = current.coord as Record<string, number>;
      lat = coord.lat;
      lon = coord.lon;
    }

    const [officialAlerts, ruleAlerts] = await Promise.all([
      fetchOfficialAlerts(lat, lon, apiKey),
      Promise.resolve(deriveRuleAlerts(current)),
    ]);

    const formattedOfficial = officialAlerts.map((a) => ({
      id: `official-${a.event.replace(/\s+/g, "-").toLowerCase()}`,
      title: a.event,
      description: a.description,
      severity: "critical" as const,
      source: "official",
      start: a.start,
      end: a.end,
      senderName: a.sender_name,
    }));

    const allAlerts = [
      ...formattedOfficial,
      ...ruleAlerts,
    ];

    const mainData = (current.main ?? {}) as Record<string, number>;
    res.json({
      city: current.name,
      country: (current.sys as Record<string, string>)?.country,
      lat,
      lon,
      current: {
        temp: mainData.temp,
        humidity: mainData.humidity,
        pressure: mainData.pressure,
        visibility: current.visibility,
        windSpeed: (current.wind as Record<string, number>)?.speed,
      },
      officialAlerts: formattedOfficial,
      ruleAlerts,
      alerts: allAlerts,
      allClear: allAlerts.length === 0,
    });
  } catch (err) {
    const e = err as Error & { status?: number; body?: unknown };
    const status = e.status ?? 500;
    res.status(status).json(e.body ?? { error: e.message ?? "Failed to fetch alerts data" });
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
