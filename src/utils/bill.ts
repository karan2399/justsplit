import type { Item, Person } from "../types";

export type BillTotals = {
  byPerson: Record<string, number>;
  grandTotal: number;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function calculateTotals(people: Person[], items: Item[]): BillTotals {
  const byPerson: Record<string, number> = Object.fromEntries(
    people.map((person) => [person.id, 0]),
  );
  let grandTotal = 0;

  for (const item of items) {
    const base = item.price * item.quantity;
    const total = base + (base * item.taxPercent) / 100;
    grandTotal += total;

    if (item.sharedBy.length === 0) continue;

    const share = total / item.sharedBy.length;
    item.sharedBy.forEach((personId) => {
      if (personId in byPerson) byPerson[personId] += share;
    });
  }

  return { byPerson, grandTotal };
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}
