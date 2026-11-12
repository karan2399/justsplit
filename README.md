# JustSplit

JustSplit is a front-end app for splitting a bill between people. Add the people
sharing the bill, enter the items, choose who shared each item, and see the
resulting total for each person.

## How to use

1. Add each person to your split. Their names are saved in this browser, so you
   can reuse your group later. Remove a name with the × button on its chip.
2. Add each ordered item and its price.
3. Set an item's quantity or tax rate, then select everyone sharing it.
4. Review the bill total and each person's share in the summary. Choose
   **Download bill PDF** to save a detailed copy of the current split.

Names are stored in the browser's local storage. Item and bill details are kept
in app memory and are cleared when the page is refreshed. The header counts
active JustSplit tabs in this browser on this device; it does not count all
visitors to the site. Site-wide presence would require a shared backend.

## Development

```sh
npm install
npm run dev
```

Run `npm run build` to type-check and create a production build, or `npm run lint`
to run ESLint.
