import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  CloudRain,
  BarChart3,
  Zap,
  Activity,
  TrendingUp,
  Thermometer,
  Droplets,
  Wind,
  Database,
  ArrowRight,
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-weather-data";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BarChart3,
    title: "EDA Explorer",
    description: "Deep-dive into 8,784 hourly weather records with interactive visualizations, correlation matrices, and distribution analysis.",
    href: "/eda",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description: "Discover insights like hottest/coldest days, monthly trends, weather frequency patterns, and seasonal variations.",
    href: "/analytics",
    color: "from-emerald-500/20 to-emerald-600/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Zap,
    title: "Live Prediction",
    description: "Input real-time sensor readings and get instant weather classification from our trained Random Forest model.",
    href: "/predict",
    color: "from-amber-500/20 to-amber-600/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Activity,
    title: "Model Performance",
    description: "Evaluate the ML pipeline with accuracy metrics, confusion matrix, classification report, and feature importances.",
    href: "/performance",
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HomePage() {
  const { data } = useDashboardData();

  const stats = [
    {
      icon: Database,
      label: "Total Records",
      value: data?.datasetInfo?.total_rows?.toLocaleString() || "8,784",
      color: "text-blue-400",
      bg: "bg-blue-500/20",
    },
    {
      icon: Thermometer,
      label: "Temp Range",
      value: "-33°C to 33°C",
      color: "text-red-400",
      bg: "bg-red-500/20",
    },
    {
      icon: Droplets,
      label: "Avg Humidity",
      value: "67%",
      color: "text-cyan-400",
      bg: "bg-cyan-500/20",
    },
    {
      icon: Wind,
      label: "Weather Classes",
      value: "8",
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-16 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-card via-card/80 to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <CloudRain className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-primary uppercase tracking-widest">
                AI Weather Analytics
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-[1.1] mb-6">
              Weather Intelligence{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Powered by ML
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Explore 8,784 hourly weather records, discover patterns through EDA, predict
              weather conditions with a Random Forest classifier achieving{" "}
              <span className="text-primary font-semibold">77.6% accuracy</span>, and
              evaluate model performance — all in one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/predict">
                <button className="px-6 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2">
                  Try Live Prediction
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/eda">
                <button className="px-6 py-3 rounded-xl font-bold text-foreground bg-white/5 border border-border/50 hover:bg-white/10 transition-all flex items-center gap-2">
                  Explore Data
                  <BarChart3 className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </p>
                      <h3 className="text-xl font-bold font-mono">{stat.value}</h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Link href={feature.href}>
                  <Card className="group cursor-pointer hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center ${feature.iconColor} shrink-0`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                            {feature.title}
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
