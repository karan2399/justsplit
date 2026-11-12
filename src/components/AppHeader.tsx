type Page = "split" | "about";

type AppHeaderProps = {
  activePage: Page;
  onlineTabs: number;
  presenceUnavailable: boolean;
  onNavigate: (page: Page) => void;
};

export function AppHeader({
  activePage,
  onlineTabs,
  presenceUnavailable,
  onNavigate,
}: AppHeaderProps) {
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
      <div
        className="presence-pill"
        title={
          presenceUnavailable
            ? "Only this tab can be counted because local storage is unavailable."
            : "Counts active JustSplit tabs in this browser on this device, not all site visitors."
        }
        aria-label={`JustSplit is open in ${onlineTabs} ${onlineTabs === 1 ? "tab" : "tabs"} on this device`}
      >
        <span className="presence-dot" />
        <span><strong>{onlineTabs}</strong> {onlineTabs === 1 ? "tab" : "tabs"} open here</span>
      </div>
    </header>
  );
}
