import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export function Slider({ label, value, min, max, step = 1, unit = "", onChange, className, ...props }: SliderProps) {
  // Calculate percentage for background gradient effect
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex justify-between items-end">
        <label className="text-sm font-semibold text-foreground/90 tracking-wide">
          {label}
        </label>
        <div className="bg-background/50 border border-border px-3 py-1 rounded-md text-primary font-mono text-sm font-bold shadow-inner">
          {value}{unit}
        </div>
      </div>
      <div className="relative w-full py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full relative z-10"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%)`
          }}
          {...props}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
