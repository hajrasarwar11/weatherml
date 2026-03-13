import { useState } from "react";
import { Search, MapPin } from "lucide-react";

interface CitySearchProps {
  city: string;
  onCityChange: (city: string) => void;
}

export function CitySearch({ city, onCityChange }: CitySearchProps) {
  const [input, setInput] = useState(city);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCityChange(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1 max-w-xs">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search city..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border/60 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <button
        type="submit"
        className="px-3 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
      >
        <Search className="w-4 h-4" />
        Search
      </button>
    </form>
  );
}
