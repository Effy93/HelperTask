import { useEffect, useState } from "react";

type Theme = "default" | "dsy";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) ?? "default";
  });

  useEffect(() => {
    if (theme === "dsy") {
      document.documentElement.setAttribute("data-theme", "dsy");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dsy" ? "default" : "dsy"));

  return { theme, isDsy: theme === "dsy", toggleTheme };
}
