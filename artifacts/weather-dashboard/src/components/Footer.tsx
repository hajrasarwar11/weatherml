import { Instagram, Facebook, Twitter, CloudRain } from "lucide-react";

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/hlofaam",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://facebook.com/hlofaam",
  },
  {
    icon: Twitter,
    label: "Twitter",
    href: "https://twitter.com/hlofaam",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/40 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CloudRain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-display font-bold text-foreground">
                WeatherML
              </p>
              <p className="text-xs text-muted-foreground">
                AI Weather Analytics Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  aria-label={link.label}
                >
                  <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="text-sm hidden sm:inline">@hlofaam</span>
                </a>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} WeatherML. Built by{" "}
            <a
              href="https://instagram.com/hlofaam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @hlofaam
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
