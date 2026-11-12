type AboutPageProps = {
  onStart: () => void;
};

const steps = [
  ["01", "Add your people", "Enter everyone joining the bill. Names are saved in this browser so your group is ready next time."],
  ["02", "Add the items", "Add each item and its price, then choose a quantity and tax rate if needed."],
  ["03", "Choose who shares", "Select the people sharing each item. The total is divided evenly between them."],
  ["04", "Settle up", "Check the summary to see the bill total and each person's share. Remove a person or item any time."],
];

export function AboutPage({ onStart }: AboutPageProps) {
  return (
    <section className="about-page page-enter">
      <button className="back-link" onClick={onStart}>
        <span aria-hidden="true">←</span> Back to your split
      </button>
      <div className="about-hero">
        <span className="eyebrow">A little less math, a lot more dinner</span>
        <h1>Good times are better when the bill is easy.</h1>
        <p>
          JustSplit is a simple, front-end bill splitter. Add your group,
          list what you ordered, and see exactly what each person owes.
        </p>
      </div>
      <div className="howto-grid">
        {steps.map(([number, title, description]) => (
          <article className="howto-card" key={number}>
            <span className="step-number">{number}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <p className="privacy-note">
        Your saved names stay in your browser's local storage. Bills and item details
        are temporary and clear when you refresh.
      </p>
      <section className="developer-card" aria-labelledby="developer-heading">
        <div className="developer-avatar" aria-hidden="true">K</div>
        <div className="developer-info">
          <span className="eyebrow">ABOUT THE DEVELOPER</span>
          <h2 id="developer-heading">Karan Patel</h2>
          <p>Software Engineer | Angular, React &amp; TypeScript | Front-End Architecture | REST API Integration</p>
          <a href="https://karan2399.github.io/portfolio/" target="_blank" rel="noreferrer">
            Visit my portfolio <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <button className="button button-primary about-cta" onClick={onStart}>
        Start splitting <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
