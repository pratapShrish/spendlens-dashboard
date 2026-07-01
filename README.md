# Spendlens Expense Dashboard

Spendlens turns a supplied set of multi-currency expenses into a finance-ready USD summary. It provides category and merchant rankings, a sortable and filterable ledger, an in-memory expense form, and a live EUR rate scenario tool.

**Live app:** [https://spendlens-dashboard-ivory.vercel.app](https://spendlens-dashboard-ivory.vercel.app)

## Run locally

This project has no dependencies or build step.

1. Download or clone the repository.
2. Open a terminal in the project folder.
3. Run:

   ```bash
   python3 -m http.server 4173
   ```

4. Open [http://localhost:4173](http://localhost:4173).

Opening `index.html` directly also works in most modern browsers.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Page structure, dashboard content, expense form, and visible methodology note. |
| `styles.css` | Responsive layout, visual design, component states, and mobile behavior. |
| `app.js` | Supplied data, exchange rates, conversion logic, summaries, filtering, sorting, validation, and EUR what-if behavior. |
| `docs/ceo-brief.md` | Plain-English briefing for Spendlens leadership. |
| `docs/edge-cases.md` | Failure-mode analysis and expected behavior. |

## Calculation rules and assumptions

- The supplied rate snapshot is the only source of truth. No live API is called.
- The snapshot has a USD base, so each value is interpreted as currency units per USD. Conversion is `USD = original amount / rate`.
- Calculations retain full JavaScript number precision. Values are rounded to two decimals only when displayed.
- The EUR scenario control changes only the EUR rate; reset restores `0.9201`.
- Added expenses live only in browser memory and disappear on refresh, as allowed by the brief.
- The form accepts only positive amounts and currencies with valid supplied rates.
- Dates are parsed and displayed in UTC to prevent a transaction shifting by one day in some time zones.

## Known limitations

- There is no database, authentication, audit history, editing, or deletion.
- Added rows are not persisted between sessions or shared with other users.
- The rates are static and have no freshness warning beyond the displayed snapshot date.
- The browser uses floating-point arithmetic rather than a decimal-money library.
- Invalid imported rows are not shown in a quarantine/reconciliation view because this prototype has no import workflow.
- The interface is tested for modern browsers; legacy browser support is not included.

## What I would fix with another four hours

1. Persist expenses in a small database and add edit/delete actions with an audit trail.
2. Add automated unit tests for conversion, aggregation, sorting, filtering, validation, and rate changes.
3. Introduce a decimal-money library and a reconciliation state for rows with missing rates.
4. Add CSV import/export so finance can use the dashboard in its monthly workflow.

## Deployment

The repository is designed as a static site. In Vercel, import the GitHub repository, keep the framework preset as **Other**, leave the build command empty, and deploy from the repository root.

Prepared by **Shrish Pratap**.
