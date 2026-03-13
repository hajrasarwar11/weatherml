import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  Brain,
  Code2,
  ArrowRight,
  Layers,
  Filter,
  BarChart3,
  Cpu,
  CheckCircle2,
  CloudRain,
  Sparkles,
} from "lucide-react";

const pipelineSteps = [
  {
    icon: Database,
    title: "1. Data Collection",
    description: "8,784 hourly weather observations with 13 features including temperature, humidity, wind speed, visibility, and pressure.",
  },
  {
    icon: Filter,
    title: "2. Preprocessing",
    description: "Handle missing values, encode weather categories into 8 groups, engineer time-based features (Hour, Month, DayOfWeek, Temp-DewPoint diff).",
  },
  {
    icon: BarChart3,
    title: "3. EDA & Analysis",
    description: "Explore distributions, correlations, class imbalances. Generate statistical summaries and visualizations for all features.",
  },
  {
    icon: Layers,
    title: "4. Feature Engineering",
    description: "Create 4 derived features from timestamps and sensor data. Total of 10 input features for the model.",
  },
  {
    icon: Cpu,
    title: "5. Model Training",
    description: "Random Forest classifier with GridSearchCV for hyperparameter tuning. 80/20 train-test split with cross-validation.",
  },
  {
    icon: CheckCircle2,
    title: "6. Evaluation & Deployment",
    description: "77.6% test accuracy. Model saved with joblib, served via Express API for real-time predictions.",
  },
];

const techStack = [
  { name: "React", category: "Frontend" },
  { name: "Vite", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Recharts", category: "Frontend" },
  { name: "Framer Motion", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Express.js", category: "Backend" },
  { name: "Node.js", category: "Backend" },
  { name: "Python 3", category: "ML" },
  { name: "scikit-learn", category: "ML" },
  { name: "pandas", category: "ML" },
  { name: "Random Forest", category: "ML" },
  { name: "GridSearchCV", category: "ML" },
  { name: "joblib", category: "ML" },
];

const futureScope = [
  "Live weather API integration (OpenWeatherMap) for real-time dashboard",
  "Interactive weather map with Leaflet and weather tile overlays",
  "7-day forecast with hourly breakdown",
  "Weather alerts system based on model predictions",
  "XGBoost / Deep Learning model comparison",
  "Multi-city support with location search",
  "Historical trend analysis with custom date ranges",
  "Export reports and predictions as PDF",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AboutPage() {
  const categoryColors: Record<string, string> = {
    Frontend: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Backend: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    ML: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 pb-10"
    >
      <section className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card via-card/80 to-accent/5 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <CloudRain className="w-8 h-8 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">
              About
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground mb-4">
            AI Weather Analytics Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            A complete end-to-end machine learning project that combines data science (EDA),
            predictive modeling (Random Forest with GridSearchCV), and a professional
            full-stack web application. Built to classify weather conditions into 8 categories
            from hourly sensor readings.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Dataset</h2>
        <p className="text-muted-foreground mb-6">
          The dataset contains hourly weather observations with the following characteristics:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Records", value: "8,784", desc: "hourly observations" },
            { label: "Features", value: "13", desc: "original columns" },
            { label: "Weather Classes", value: "8", desc: "target categories" },
            { label: "Model Inputs", value: "10", desc: "engineered features" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-black font-mono text-primary">{item.value}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Snow", "Rain", "Fog", "Clear", "Cloudy", "Freezing Precip", "Haze", "Other"].map(
            (cls) => (
              <span
                key={cls}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
              >
                {cls}
              </span>
            )
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent" />
          ML Pipeline
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.title} variants={itemVariants}>
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-foreground text-sm">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span
              key={tech.name}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                categoryColors[tech.category] || "bg-white/5 text-foreground border-border"
              }`}
            >
              {tech.name}
            </span>
          ))}
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Future Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {futureScope.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
