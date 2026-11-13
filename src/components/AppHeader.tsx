import { useEffect, useState } from "react";

type Page = "split" | "about";

type AppHeaderProps = {
  activePage: Page;
  onNavigate: (page: Page) => void;
};

export function AppHeader({
  activePage,
  onNavigate,
}: AppHeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const localTime = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const localDate = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <header className="topbar">
      <a
        className="brand"
        href="#home"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("split");
        }}
        aria-label="JustSplit home"
      >
        <span className="brand-mark" aria-hidden="true">J</span>
        <span>Just<span className="brand-accent">Split</span></span>
      </a>
      <nav className="topbar-nav" aria-label="Main navigation">
        <button
          className={`nav-link ${activePage === "split" ? "active" : ""}`}
          onClick={() => onNavigate("split")}
        >
          Split a bill
        </button>
        <button
          className={`nav-link ${activePage === "about" ? "active" : ""}`}
          onClick={() => onNavigate("about")}
        >
          How it works
        </button>
      </nav>
      <time
        className="local-datetime"
        dateTime={now.toISOString()}
        aria-label={`Local time and date: ${localTime}, ${localDate}`}
      >
        <span className="local-time">{localTime}</span>
        <span className="local-date">{localDate}</span>
      </time>
    </header>
  );
}
