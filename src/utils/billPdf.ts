import { jsPDF } from "jspdf";
import type { Item, Person } from "../types";
import type { BillTotals } from "./bill";
import { formatCurrency } from "./bill";

function pdfSafe(text: string): string {
  return text.normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^\x20-\x7E]/g, "?");
}

export function downloadBillPdf(people: Person[], items: Item[], totals: BillTotals): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 22;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeWrapped = (text: string, size = 10, lineHeight = 5) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    ensureSpace(lines.length * lineHeight);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight;
  };

  const writeSectionTitle = (title: string) => {
    ensureSpace(13);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(43, 74, 54);
    doc.text(title, margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 57);
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(36, 75, 54);
  doc.text("JustSplit - Bill Summary", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(112, 124, 114);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, y);
  y += 7;

  doc.setFillColor(234, 241, 232);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
  doc.setFontSize(10);
  doc.setTextColor(55, 82, 61);
  doc.text("BILL TOTAL", margin + 5, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(formatCurrency(totals.grandTotal), pageWidth - margin - 5, y + 12, { align: "right" });
  y += 24;

  writeSectionTitle("Items");
  if (items.length === 0) {
    writeWrapped("No items have been added.");
  } else {
    items.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      const taxAmount = subtotal * item.taxPercent / 100;
      const itemTotal = subtotal + taxAmount;
      const sharingPeople = people
        .filter((person) => item.sharedBy.includes(person.id))
        .map((person) => person.name);
      const sharedBy = sharingPeople.length > 0
        ? sharingPeople.map(pdfSafe).join(", ")
        : "Not assigned";

      ensureSpace(22);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(47, 66, 53);
      doc.text(`${index + 1}. ${pdfSafe(item.name)}`, margin, y);
      doc.text(formatCurrency(itemTotal), pageWidth - margin, y, { align: "right" });
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 110, 101);
      writeWrapped(
        `${formatCurrency(item.price)} each x ${item.quantity} - Subtotal ${formatCurrency(subtotal)} - Tax ${item.taxPercent}% (${formatCurrency(taxAmount)})`,
        9,
        4.5,
      );
      writeWrapped(`Shared by: ${sharedBy}`, 9, 4.5);
      y += 3;
    });
  }

  writeSectionTitle("Each person's share");
  if (people.length === 0) {
    writeWrapped("No people have been added.");
  } else {
    people.forEach((person) => {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(47, 66, 53);
      doc.text(pdfSafe(person.name), margin, y);
      doc.text(formatCurrency(totals.byPerson[person.id] ?? 0), pageWidth - margin, y, { align: "right" });
      y += 5;
      const shares = items.flatMap((item) => {
        if (!item.sharedBy.includes(person.id) || item.sharedBy.length === 0) return [];
        const amount = item.price * item.quantity * (1 + item.taxPercent / 100) / item.sharedBy.length;
        return [`${pdfSafe(item.name)}: ${formatCurrency(amount)}`];
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 110, 101);
      writeWrapped(shares.length > 0 ? shares.join(" | ") : "No assigned items", 9, 4.5);
      y += 3;
    });
  }

  if (items.some((item) => item.sharedBy.length === 0)) {
    y += 2;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(135, 101, 55);
    writeWrapped("Items without assigned people are included in the bill total, but not in any person's share.", 9, 4.5);
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(145, 153, 145);
    doc.text(`JustSplit  |  Page ${page} of ${pageCount}`, pageWidth / 2, pageHeight - 9, { align: "center" });
  }

  const date = new Date().toISOString().slice(0, 10);
  doc.save(`justsplit-bill-${date}.pdf`);
}
