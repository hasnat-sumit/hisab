import type { ThemePreference } from "./constants";

const STORAGE_KEY = "hisab-theme";

// Runs before the page paints, so a dark theme never flashes light first. It is
// only a local copy: the saved preference lives with the user's settings.
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export function applyTheme(theme: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing can block storage. The class below still applies.
  }
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
