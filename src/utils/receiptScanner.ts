import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export type ReceiptLine = {
  id: string;
  name: string;
  price: number;
};

type ProgressCallback = (message: string) => void;

function parsePrice(value: string): number {
  const normalized = value.replace(/\s/g, "");
  const decimalSeparator = normalized.lastIndexOf(".") > normalized.lastIndexOf(",") ? "." : ",";
  const digits = normalized.replace(/[.,]/g, "");
  const decimalDigits = normalized.slice(normalized.lastIndexOf(decimalSeparator) + 1);
  const amount = `${digits.slice(0, -decimalDigits.length)}.${decimalDigits}`;
  return Number(amount);
}

export function parseReceiptText(text: string): ReceiptLine[] {
  const summaryLine = /^(?:sub\s*total|tax|gst|hst|pst|total|grand total|amount due|balance due|tip|discount|coupon|savings|payment|cash|change|visa|mastercard|debit|credit|thank you)\b/i;
  const priceAtEnd = /(?:[$€£]\s*)?((?:\d{1,3}(?:[ ,]\d{3})+|\d{1,5})\s*[.,]\s*\d{2})\s*[A-Z*]{0,3}\s*$/i;
  const lines: ReceiptLine[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const cleanLine = rawLine.replace(/\s+/g, " ").trim();
    const match = cleanLine.match(priceAtEnd);
    if (!match) continue;

    const name = cleanLine
      .slice(0, match.index)
      .replace(/^\s*\d+(?:[.,]\d+)?\s*[x×]\s*/i, "")
      .replace(/^\s*(?:#\s*)?\d{1,3}[.)]\s+/, "")
      .replace(/\s+\d+(?:[.,]\d+)?\s*(?:(?:kg|lb|ea)\s*)?(?:@|[x×]|for)\s*[$]?\s*[\d.,]+\s*(?:\/\s*(?:kg|lb|ea))?\s*$/i, "")
      .replace(/[\s.:|*-]+$/, "")
      .trim();
    if (!name || summaryLine.test(name) || /\b(?:discount|coupon|savings|points earned)\b/i.test(name)) continue;

    const price = parsePrice(match[1]);
    if (!name || !Number.isFinite(price) || price <= 0) continue;

    lines.push({ id: crypto.randomUUID(), name, price });
  }

  return lines;
}

async function recognizeReceipt(
  input: File | HTMLCanvasElement,
  onProgress: ProgressCallback,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const bitmap = await createImageBitmap(input);
  const maxDimension = 5000;
  const scale = Math.min(2, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = window.document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Could not prepare the receipt image for scanning.");
  }
  context.filter = "grayscale(1) contrast(1.2)";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const worker = await createWorker("eng", 1, {
    logger: (message) => {
      if (message.status === "recognizing text") {
        onProgress(`Reading receipt… ${Math.round(message.progress * 100)}%`);
      } else if (message.status) {
        onProgress("Loading receipt reader…");
      }
    },
  });

  try {
    const result = await worker.recognize(canvas);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}

function getPdfPageText(items: unknown[]): string {
  const textItems = items.flatMap((item) => {
    if (!item || typeof item !== "object" || !("str" in item) || typeof item.str !== "string") {
      return [];
    }

    const transform = "transform" in item && Array.isArray(item.transform) ? item.transform : [];
    return [{ text: item.str, x: Number(transform[4]) || 0, y: Number(transform[5]) || 0 }];
  });

  textItems.sort((left, right) => right.y - left.y || left.x - right.x);
  const rows: { y: number; text: string[] }[] = [];
  for (const item of textItems) {
    const row = rows.find((candidate) => Math.abs(candidate.y - item.y) < 3);
    if (row) row.text.push(item.text);
    else rows.push({ y: item.y, text: [item.text] });
  }

  return rows.map((row) => row.text.join(" ")).join("\n");
}

async function readPdf(file: File, onProgress: ProgressCallback): Promise<string> {
  const { GlobalWorkerOptions, getDocument } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const document = await getDocument({ data: await file.arrayBuffer() }).promise;
  const pageTexts: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      onProgress(`Reading PDF page ${pageNumber} of ${document.numPages}…`);
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = getPdfPageText(textContent.items);
      if (parseReceiptText(pageText).length > 0) {
        pageTexts.push(pageText);
        continue;
      }

      const viewport = page.getViewport({ scale: 2 });
      const canvas = window.document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare the PDF page for scanning.");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      pageTexts.push(await recognizeReceipt(canvas, onProgress));
    }
  } finally {
    await document.destroy();
  }

  return pageTexts.join("\n");
}

export async function scanReceipt(
  file: File,
  onProgress: ProgressCallback,
): Promise<ReceiptLine[]> {
  const text = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    ? await readPdf(file, onProgress)
    : await recognizeReceipt(file, onProgress);
  return parseReceiptText(text);
}
