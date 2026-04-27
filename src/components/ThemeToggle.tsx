import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem("turkmen-ai-theme");
    if (stored === "light" || stored === "dark") return stored;
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("turkmen-ai-theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className="relative p-2 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary text-foreground transition-all hover:shadow-glow"
      title={theme === "dark" ? "Açyk tema" : "Garaňky tema"}
      aria-label="Tema çalyşmak"
    >
      <Sun
        size={18}
        className={`transition-all ${theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0 absolute inset-2"}`}
      />
      <Moon
        size={18}
        className={`transition-all ${theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute inset-2"}`}
      />
    </button>
  );
}
