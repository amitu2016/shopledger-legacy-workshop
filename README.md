# ShopLedger

ShopLedger is a legacy workshop app for wholesale and retail billing. The dashboard brings together a point-of-sale desk, inventory and wholesale stock reservations, order history, customer khata (credit accounts), and GST reconciliation.

## Run locally

Install Node.js and npm, then run these commands from the repository root:

```sh
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use the dashboard. To use another port, run `PORT=3001 npm start`.

The repository includes a sample database at `data/db.json`. Orders, cancellations, and credit settlements update that file.

## Repository layout

| Path | Purpose |
| --- | --- |
| `server.js` | Starts Express, serves the browser UI, mounts the API, and renders printable invoices at `/orders/:id/invoice`. |
| `public/` | Dashboard and point-of-sale UI built with HTML, CSS, and plain JavaScript. |
| `routes/` | Product, order, customer, and reporting endpoints under `/api`. |
| `lib/` | Pricing, GST, coupons, inventory, orders, khata, reports, and invoice logic. |
| `lib/store.js` | Reads and writes the JSON database. |
| `config.js` | Port, shop details, GST slabs, coupon rules, and inventory settings. |

## Tests

Run the existing invoice and GST reconciliation tests directly with Node.js:

```sh
node --test test/invoice-current-behaviour.test.js
```

The `npm test` script is a placeholder. Write characterization tests before changing behavior and use in-memory fixtures so tests never read or write `data/db.json`.
