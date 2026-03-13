import { Router, type IRouter } from "express";

const router: IRouter = Router();

const OWM_BASE = "https://api.openweathermap.org/data/2.5";
const OWM_BASE_3 = "https://api.openweathermap.org/data/3.0";

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
  } catch (err) {
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
      `${OWM_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const data = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch forecast" });
  }
});

router.get("/weather/onecall", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).json({ error: "OPENWEATHER_API_KEY not configured" });
    return;
  }
  const lat = req.query.lat as string;
  const lon = req.query.lon as string;
  if (!lat || !lon) {
    res.status(400).json({ error: "lat and lon are required" });
    return;
  }
  try {
    const resp = await fetch(
      `${OWM_BASE_3}/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&exclude=minutely`
    );
    const data = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch one-call data" });
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
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${apiKey}`
    );
    const data = await resp.json();
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to geocode city" });
  }
});

router.get("/weather/api-key-status", (_req, res) => {
  const apiKey = getApiKey();
  res.json({ configured: !!apiKey });
});

router.get("/weather/tile-key", (_req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).json({ error: "OPENWEATHER_API_KEY not configured" });
    return;
  }
  res.json({ key: apiKey });
});

export default router;
