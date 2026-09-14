"use client";

import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600",
        theme === "dark"
          ? "border-gray-700 bg-gray-800 text-yellow-400 hover:bg-gray-700"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.1rem] w-[1.1rem]" />
      ) : (
        <Moon className="h-[1.1rem] w-[1.1rem]" />
      )}
    </button>
  );
}
