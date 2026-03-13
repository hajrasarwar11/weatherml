import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

const STATS_PATH = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "..",
  "scripts",
  "ml",
  "model",
  "stats.json"
);

const PREDICT_SCRIPT = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "..",
  "scripts",
  "ml",
  "predict.py"
);

router.get("/eda-stats", (_req, res) => {
  try {
    if (!fs.existsSync(STATS_PATH)) {
      res.status(500).json({ error: "Stats file not found. Run the training pipeline first." });
      return;
    }
    const data = JSON.parse(fs.readFileSync(STATS_PATH, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read stats file" });
  }
});

router.post("/predict", (req, res) => {
  const { temp_c, dew_point_temp_c, rel_hum, wind_speed_kmh, visibility_km, press_kpa } = req.body;

  if (
    temp_c === undefined ||
    dew_point_temp_c === undefined ||
    rel_hum === undefined ||
    wind_speed_kmh === undefined ||
    visibility_km === undefined ||
    press_kpa === undefined
  ) {
    res.status(400).json({ error: "All sensor readings are required" });
    return;
  }

  const inputData = JSON.stringify({
    temp_c: Number(temp_c),
    dew_point_temp_c: Number(dew_point_temp_c),
    rel_hum: Number(rel_hum),
    wind_speed_kmh: Number(wind_speed_kmh),
    visibility_km: Number(visibility_km),
    press_kpa: Number(press_kpa),
  });

  const python = spawn("python3", [PREDICT_SCRIPT]);

  let stdout = "";
  let stderr = "";

  python.stdout.on("data", (data: Buffer) => {
    stdout += data.toString();
  });

  python.stderr.on("data", (data: Buffer) => {
    stderr += data.toString();
  });

  python.on("close", (code: number | null) => {
    if (code !== 0) {
      console.error("Python predict error:", stderr);
      res.status(500).json({ error: "Prediction failed: " + stderr });
      return;
    }
    try {
      const result = JSON.parse(stdout.trim());
      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed to parse prediction result" });
    }
  });

  python.stdin.write(inputData);
  python.stdin.end();
});

export default router;
