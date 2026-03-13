import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudRain,
  Home,
  BarChart3,
  Zap,
  Activity,
  TrendingUp,
  Info,
  Menu,
  X,
  Gauge,
  Calendar,
  Map,
  Bell,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/eda", label: "EDA Explorer", icon: BarChart3 },
  { path: "/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/predict", label: "Prediction", icon: Zap },
  { path: "/performance", label: "Performance", icon: Activity },
  { path: "/dashboard", label: "Live Weather", icon: Gauge },
  { path: "/forecast", label: "Forecast", icon: Calendar },
  { path: "/map", label: "Map", icon: Map },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/about", label: "About", icon: Info },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <CloudRain className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold tracking-tight text-white leading-tight">
                WeatherML
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">
                AI Analytics Platform
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 p-1 bg-card/60 border border-border/40 rounded-xl backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors outline-none ${
                      isActive
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                  </button>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
