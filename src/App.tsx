import { useEffect, useState } from "react";
import { Home } from "./pages/Home";

type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "interactive-cv-theme";

function getInitialTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    const documentTheme = document.documentElement.dataset.theme;

    if (documentTheme === "light" || documentTheme === "dark") {
      return documentTheme;
    }
  }

  if (typeof window !== "undefined") {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  }

  return "dark";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const body = document.body;

  root.dataset.theme = theme;
  root.classList.toggle("theme-light", theme === "light");
  root.classList.toggle("theme-dark", theme === "dark");

  body.classList.toggle("theme-light", theme === "light");
  body.classList.toggle("theme-dark", theme === "dark");
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <Home
      theme={theme}
      onToggleTheme={() => {
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark",
        );
      }}
    />
  );
}
