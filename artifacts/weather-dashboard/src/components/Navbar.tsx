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
  Mail,
} from "lucide-react";

const navGroups = [
  {
    label: "ML Analytics",
    items: [
      { path: "/", label: "Home", icon: Home },
      { path: "/eda", label: "EDA", icon: BarChart3 },
      { path: "/analytics", label: "Analytics", icon: TrendingUp },
      { path: "/predict", label: "Prediction", icon: Zap },
      { path: "/performance", label: "Performance", icon: Activity },
    ],
  },
  {
    label: "Live Weather",
    items: [
      { path: "/dashboard", label: "Live Weather", icon: Gauge },
      { path: "/forecast", label: "Forecast", icon: Calendar },
      { path: "/map", label: "Map", icon: Map },
      { path: "/alerts", label: "Alerts", icon: Bell },
    ],
  },
];

const extraItems = [
  { path: "/about", label: "About", icon: Info },
  { path: "/contact", label: "Contact", icon: Mail },
];

const allItems = [...navGroups.flatMap((g) => g.items), ...extraItems];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-display font-bold tracking-tight text-white leading-tight">
                WeatherML
              </p>
              <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">
                AI Analytics Platform
              </p>
            </div>
          </Link>

          <nav
            className="hidden xl:flex items-center gap-0.5 p-1 bg-card/60 border border-border/40 rounded-xl backdrop-blur-md overflow-x-auto"
            aria-label="Main navigation"
          >
            {navGroups.map((group, gi) => (
              <div key={group.label} className="flex items-center gap-0.5">
                {gi > 0 && (
                  <div className="w-px h-5 bg-border/50 mx-1" />
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors outline-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        isActive
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navbar-active"
                          className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
            <div className="w-px h-5 bg-border/50 mx-1" />
            {extraItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors outline-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <nav
            className="hidden lg:flex xl:hidden items-center gap-0.5 p-1 bg-card/60 border border-border/40 rounded-xl backdrop-blur-md"
            aria-label="Main navigation"
          >
            {navGroups.map((group, gi) => (
              <div key={group.label} className="flex items-center gap-0.5">
                {gi > 0 && (
                  <div className="w-px h-5 bg-border/50 mx-1" />
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      title={item.label}
                      className={`relative flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        isActive
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={item.label}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navbar-active-md"
                          className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1">
                        <Icon className="w-4 h-4" />
                        {isActive && <span className="text-[11px]">{item.label}</span>}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
            <div className="w-px h-5 bg-border/50 mx-1" />
            {extraItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={item.label}
                  className={`relative flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                >
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-md"
                      className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    <Icon className="w-4 h-4" />
                    {isActive && <span className="text-[11px]">{item.label}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            <nav
              className="max-w-[1600px] mx-auto px-4 py-3 space-y-3"
              aria-label="Mobile navigation"
            >
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1.5">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.path;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/60 outline-none ${
                            isActive
                              ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="border-t border-border/30 pt-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
                {extraItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/60 outline-none ${
                        isActive
                          ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
