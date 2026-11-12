import type { ReactNode } from "react";

type SplitPageProps = {
  peopleSection: ReactNode;
  itemsSection: ReactNode;
  summary: ReactNode;
  formError: string;
  storageError: boolean;
};

export function SplitPage({
  peopleSection,
  itemsSection,
  summary,
  formError,
  storageError,
}: SplitPageProps) {
  return (
    <div className="split-page page-enter">
      <section className="welcome-row">
        <div>
          <span className="eyebrow">THE EASY WAY TO SETTLE UP</span>
          <h1>Make it a fair split.</h1>
          <p>Add your crew, add the order, and leave the math to us.</p>
        </div>
        <div className="welcome-illustration" aria-hidden="true">
          <span className="sparkle sparkle-one">✳</span>
          <span className="plate">☺</span>
          <span className="sparkle sparkle-two">✦</span>
        </div>
      </section>

      {storageError && (
        <div className="storage-warning" role="alert">
          Names could not be saved in this browser. Check your storage settings and try again.
        </div>
      )}
      {formError && <div className="form-message" role="alert">{formError}</div>}

      <div className="content-grid">
        <div className="main-column">
          {peopleSection}
          {itemsSection}
        </div>
        {summary}
      </div>
    </div>
  );
}
