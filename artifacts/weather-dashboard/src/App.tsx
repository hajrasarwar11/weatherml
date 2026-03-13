import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { EdaPage } from "@/pages/EdaPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { PredictPage } from "@/pages/PredictPage";
import { PerformancePage } from "@/pages/PerformancePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { WeatherDashboardPage } from "@/pages/WeatherDashboardPage";
import { ForecastPage } from "@/pages/ForecastPage";
import { WeatherMapPage } from "@/pages/WeatherMapPage";
import { AlertsPage } from "@/pages/AlertsPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/eda" component={EdaPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/predict" component={PredictPage} />
      <Route path="/performance" component={PerformancePage} />
      <Route path="/dashboard" component={WeatherDashboardPage} />
      <Route path="/forecast" component={ForecastPage} />
      <Route path="/map" component={WeatherMapPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
            <Navbar />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1 w-full">
              <Router />
            </main>
            <Footer />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
