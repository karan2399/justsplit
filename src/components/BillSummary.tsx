import type { Item, Person } from "../types";
import type { BillTotals } from "../utils/bill";
import { formatCurrency } from "../utils/bill";

type BillSummaryProps = {
  people: Person[];
  items: Item[];
  totals: BillTotals;
  pdfError: string;
  onDownloadPdf: () => void;
};

export function BillSummary({
  people,
  items,
  totals,
  pdfError,
  onDownloadPdf,
}: BillSummaryProps) {
  return (
    <aside className="summary-card">
      <div className="summary-top">
        <span className="summary-label">YOUR BILL BREAKDOWN</span>
        <span className="summary-emoji" aria-hidden="true">✦</span>
        <h2>Looking good.</h2>
        <p>A clear view of who's paying what.</p>
        <div className="total-block">
          <span>Bill total</span>
          <strong>{formatCurrency(totals.grandTotal)}</strong>
        </div>
      </div>
      <div className="summary-details">
        <div className="summary-subheading">
          <h3>Everyone's share</h3>
          <span>{people.length}</span>
        </div>
        {people.length > 0 ? (
          <ul className="share-summary">
            {people.map((person) => (
              <li key={person.id}>
                <span className="summary-person">
                  <span className="avatar summary-avatar">{person.name.charAt(0).toUpperCase()}</span>
                  {person.name}
                </span>
                <strong>{formatCurrency(totals.byPerson[person.id] ?? 0)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="summary-empty">Add your people to see each share.</p>
        )}
        {items.some((item) => item.sharedBy.length === 0) && (
          <p className="unassigned-note">Some items still need people assigned.</p>
        )}
        <div className="summary-footer">
          <span>Split the good times, not the friendship.</span>
          <span aria-hidden="true">♡</span>
        </div>
        {pdfError && <p className="pdf-error" role="alert">{pdfError}</p>}
        <button className="button button-primary pdf-button" onClick={onDownloadPdf}>
          <span aria-hidden="true">↓</span> Download bill PDF
        </button>
      </div>
    </aside>
  );
}
