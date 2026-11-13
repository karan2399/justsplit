# JustSplit

JustSplit is a front-end app for splitting a bill between people. Add the people
sharing the bill, enter the items, choose who shared each item, and see the
resulting total for each person.

## How to use

1. Add each person to your split. Their names are saved in this browser, so you
   can reuse your group later. Remove a name with the × button on its chip.
2. Add each ordered item and its price.
   Or choose **Scan a receipt** to read an image or PDF on your device. Review
   and edit the detected item names and prices before adding them to the bill.
3. Set an item's quantity or tax rate, then select everyone sharing it.
4. Review the bill total and each person's share in the summary. Choose
   **Download bill PDF** to save a detailed copy of the current split.

Names are stored in the browser's local storage. Item and bill details are kept
in app memory and are cleared when the page is refreshed. Receipt files are
processed in the browser and are not uploaded. An internet connection is needed
to load the OCR engine and English language model. Verify scanned items before
importing, since receipt layouts and image quality can affect OCR.

## Development

```sh
npm install
npm run dev
```

Run `npm run build` to type-check and create a production build, or `npm run lint`
to run ESLint.
