import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Item } from "../types";
import { formatCurrency } from "../utils/bill";
import { scanReceipt, type ReceiptLine } from "../utils/receiptScanner";

type ReceiptImportProps = {
  onImport: (items: Item[]) => void;
};

type ReviewLine = Omit<ReceiptLine, "price"> & { price: string };

function parsePrice(value: string): number {
  return Number(value.trim().replace(",", "."));
}

export function ReceiptImport({ onImport }: ReceiptImportProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [lines, setLines] = useState<ReviewLine[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Choose an image or PDF receipt.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("This file is too large. Choose a receipt under 15 MB.");
      return;
    }

    setLines([]);
    setError("");
    setIsScanning(true);
    setProgress("Starting receipt scan…");
    try {
      const scannedLines = await scanReceipt(file, setProgress);
      if (scannedLines.length === 0) {
        setError("No line items were detected. Try a clearer image or add items manually.");
      } else {
        setLines(scannedLines.map((line) => ({ ...line, price: String(line.price) })));
      }
    } catch (scanError) {
      console.error("Could not scan receipt.", scanError);
      setError("Receipt scan failed. Check your internet connection, then try a clear JPG, PNG, or PDF.");
    } finally {
      setIsScanning(false);
      setProgress("");
    }
  };

  const updateLine = (id: string, update: Partial<ReviewLine>) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...update } : line)));
  };

  const importItems = () => {
    const validLines = lines.filter((line) => (
      line.name.trim() && Number.isFinite(parsePrice(line.price)) && parsePrice(line.price) > 0
    ));
    if (validLines.length === 0) {
      setError("Add at least one item with a name and a price.");
      return;
    }

    onImport(validLines.map((line) => ({
      id: crypto.randomUUID(),
      name: line.name.trim(),
      price: parsePrice(line.price),
      quantity: 1,
      taxPercent: 0,
      sharedBy: [],
    })));
    setLines([]);
    setError("");
  };

  return (
    <div className="receipt-import">
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFile}
        aria-label="Choose a receipt image or PDF"
      />
      <div className="receipt-import-action">
        <button
          className="button button-receipt"
          type="button"
          disabled={isScanning}
          onClick={() => fileInput.current?.click()}
        >
          {isScanning ? "Scanning receipt…" : "Scan a receipt"}
        </button>
        <span>English image or PDF · stays on this device</span>
      </div>

      {isScanning && <p className="receipt-progress" role="status">{progress}</p>}
      {error && <p className="receipt-error" role="alert">{error}</p>}

      {lines.length > 0 && (
        <div className="receipt-review">
          <div className="receipt-review-heading">
            <div>
              <h3>Review scanned items</h3>
              <p>Check names and prices before adding them to your bill.</p>
            </div>
            <button className="receipt-cancel" type="button" onClick={() => setLines([])}>
              Cancel
            </button>
          </div>
          <div className="receipt-line-list">
            {lines.map((line, index) => (
              <div className="receipt-line" key={line.id}>
                <label>
                  <span className="sr-only">Item {index + 1} name</span>
                  <input
                    value={line.name}
                    onChange={(event) => updateLine(line.id, { name: event.target.value })}
                    aria-label={`Item ${index + 1} name`}
                  />
                </label>
                <label className="receipt-price-input">
                  <span aria-hidden="true">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={line.price}
                    onChange={(event) => updateLine(line.id, { price: event.target.value })}
                    aria-label={`Item ${index + 1} price`}
                  />
                </label>
                <button
                  className="icon-button remove-item"
                  type="button"
                  onClick={() => setLines((current) => current.filter((candidate) => candidate.id !== line.id))}
                  aria-label={`Remove scanned item ${line.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="receipt-review-footer">
            <span>{lines.length} items · {formatCurrency(lines.reduce((sum, line) => sum + (parsePrice(line.price) || 0), 0))}</span>
            <button className="button button-dark" type="button" onClick={importItems}>
              Add items to bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
