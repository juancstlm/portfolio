"use client";

/**
 * Theme toggle. The theme itself is applied before first paint by the inline script in app/layout.tsx
 * (localStorage "theme" -> <html data-theme>); the icons swap in CSS, so nothing here renders differently
 * per theme and there is no hydration flash. A "themechange" event lets the commit peak repaint its canvas.
 */
export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    document.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };
  return (
    <button className="toggle" type="button" aria-label="Toggle dark theme" onClick={toggle}>
      <svg className="moon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 9.6A5.5 5.5 0 0 1 6.4 2.5a5.5 5.5 0 1 0 7.1 7.1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
      <svg className="sun" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
    </button>
  );
}

