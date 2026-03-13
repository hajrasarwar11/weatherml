import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Mail, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@hlofaam",
    href: "https://instagram.com/hlofaam",
    color: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
    borderColor: "hover:border-pink-500/40",
    description: "Follow on Instagram",
  },
  {
    icon: Facebook,
    label: "Facebook",
    handle: "@hlofaam",
    href: "https://facebook.com/hlofaam",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-400",
    borderColor: "hover:border-blue-500/40",
    description: "Connect on Facebook",
  },
  {
    icon: Twitter,
    label: "Twitter / X",
    handle: "@hlofaam",
    href: "https://twitter.com/hlofaam",
    color: "from-sky-500/20 to-cyan-500/20",
    iconColor: "text-sky-400",
    borderColor: "hover:border-sky-500/40",
    description: "Follow on Twitter",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ContactPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 pb-10"
    >
      <section className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card via-card/80 to-primary/5 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-8 h-8 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">
              Contact
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Have questions about the platform, the ML model, or want to collaborate?
            Reach out through any of the social channels below.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm text-primary font-medium">Created by Hajra</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Social Media</h2>
        <p className="text-muted-foreground mb-6">Click any card to open the profile in a new tab.</p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <motion.div key={link.label} variants={itemVariants}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card
                    className={`h-full transition-all duration-200 cursor-pointer border-border/40 ${link.borderColor} hover:shadow-lg hover:-translate-y-1`}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                      >
                        <Icon className={`w-7 h-7 ${link.iconColor}`} />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-bold text-foreground text-lg">
                            {link.label}
                          </h3>
                          <p className={`text-sm font-medium mt-0.5 ${link.iconColor}`}>
                            {link.handle}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {link.description}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section>
        <Card className="border-border/30 bg-gradient-to-br from-card to-card/60">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-lg">About this project</h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  WeatherML is an end-to-end AI weather analytics platform built by Hajra.
                  It combines a Python Random Forest ML pipeline (77.6% accuracy) with a full-stack
                  React + Express web application, classifying 8,782 hourly weather records into
                  8 categories and providing live weather data via OpenWeatherMap.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
