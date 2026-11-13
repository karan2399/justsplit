import type { FormEvent } from "react";
import type { Item, Person } from "../types";
import { ReceiptImport } from "./ReceiptImport";
import { formatCurrency } from "../utils/bill";

type ItemsSectionProps = {
  items: Item[];
  people: Person[];
  itemName: string;
  itemPrice: string;
  onItemNameChange: (value: string) => void;
  onItemPriceChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onImportItems: (items: Item[]) => void;
  onUpdateItem: (itemId: string, update: Partial<Item>) => void;
  onRemoveItem: (itemId: string) => void;
};

export function ItemsSection({
  items,
  people,
  itemName,
  itemPrice,
  onItemNameChange,
  onItemPriceChange,
  onSubmit,
  onImportItems,
  onUpdateItem,
  onRemoveItem,
}: ItemsSectionProps) {
  return (
    <section className="card items-card">
      <div className="section-heading">
        <div className="section-icon items-icon" aria-hidden="true">02</div>
        <div>
          <h2>What did you order?</h2>
          <p>Add items, then pick who shared each one.</p>
        </div>
      </div>
      <form className="add-form item-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="item-name">Item name</label>
        <input
          id="item-name"
          value={itemName}
          onChange={(event) => onItemNameChange(event.target.value)}
          placeholder="Item name"
        />
        <label className="price-input" htmlFor="item-price">
          <span aria-hidden="true">$</span>
          <input
            id="item-price"
            type="number"
            min="0.01"
            step="0.01"
            value={itemPrice}
            onChange={(event) => onItemPriceChange(event.target.value)}
            placeholder="0.00"
          />
        </label>
        <button className="button button-dark" type="submit">
          <span aria-hidden="true">+</span> Add item
        </button>
      </form>

      <ReceiptImport onImport={onImportItems} />

      {items.length > 0 ? (
        <div className="item-list">
          {items.map((item, index) => {
            const base = item.price * item.quantity;
            const total = base + (base * item.taxPercent) / 100;
            return (
              <article
                className="item-card"
                key={item.id}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="item-topline">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{formatCurrency(item.price)} each · {formatCurrency(total)} total</p>
                  </div>
                  <div className="item-controls">
                    <label>
                      <span>Qty</span>
                      <select
                        aria-label={`Quantity for ${item.name}`}
                        value={item.quantity}
                        onChange={(event) => onUpdateItem(item.id, { quantity: Number(event.target.value) })}
                      >
                        {[1, 2, 3, 4, 5].map((quantity) => (
                          <option key={quantity} value={quantity}>{quantity}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Tax</span>
                      <select
                        aria-label={`Tax for ${item.name}`}
                        value={item.taxPercent}
                        onChange={(event) => onUpdateItem(item.id, { taxPercent: Number(event.target.value) })}
                      >
                        {[0, 5, 8, 10, 13, 15, 18].map((tax) => (
                          <option key={tax} value={tax}>{tax === 0 ? "None" : `${tax}%`}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="icon-button remove-item"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      title={`Remove ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="share-row">
                  <span className="share-label">Shared by</span>
                  {people.length > 0 ? (
                    <div className="share-options">
                      {people.map((person) => (
                        <label
                          className={`share-option ${item.sharedBy.includes(person.id) ? "selected" : ""}`}
                          key={person.id}
                        >
                          <input
                            type="checkbox"
                            checked={item.sharedBy.includes(person.id)}
                            onChange={() => {
                              const sharedBy = item.sharedBy.includes(person.id)
                                ? item.sharedBy.filter((id) => id !== person.id)
                                : [...item.sharedBy, person.id];
                              onUpdateItem(item.id, { sharedBy });
                            }}
                          />
                          {person.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <span className="share-empty">Add people above to split this item</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-items">
          <span className="receipt-icon" aria-hidden="true">▤</span>
          <div>
            <strong>No items just yet</strong>
            <p>Your delicious decisions go here.</p>
          </div>
        </div>
      )}
    </section>
  );
}
