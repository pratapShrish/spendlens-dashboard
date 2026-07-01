# CEO briefing: Spendlens expense dashboard

## What I built and why it matters

I built a working expense dashboard that converts 20 transactions across 10 currencies into one consistent US-dollar view. It shows total spend, category rankings, the three highest-spend merchants and every underlying transaction. A user can filter and sort the ledger, add a new expense, and test how a different euro rate would change the figures.

This replaces repeated manual conversions with one visible set of rules. Finance gets a quicker monthly summary, while leaders can trace a total back to individual expenses instead of relying on an unexplained spreadsheet number.

## Three trade-offs

1. **Reliable delivery over a larger technical stack.** I built a dependency-free web app so it can be deployed quickly and opened without a fragile build process. The trade-off is that it does not yet have a database or user accounts.
2. **One approved rate snapshot over live rates.** All figures use the rates supplied for 1 May 2026. This keeps the board view reproducible, but the dashboard does not reflect later market movements unless the rates are updated.
3. **Clear safeguards over accepting every input.** The form rejects empty fields, unsupported currencies and zero or negative amounts. This protects totals but does not yet support refunds, credits or disputed transactions as separate business events.

## Next sprint priorities

1. **Add persistent storage and an audit trail.** Expenses would survive refreshes and every change would have an owner and timestamp. Expected impact: the tool could move from demonstration to shared internal use.
2. **Build CSV import, export and reconciliation.** Finance could load existing records, export a board-ready file and isolate rows with missing exchange rates. Expected impact: less manual work and fewer silent errors each month.
3. **Add automated tests and money-safe arithmetic.** Conversion and summary rules would be checked on every code change, using decimal calculations designed for financial values. Expected impact: higher confidence in reported totals as the product grows.

The current version is a functional prototype. It meets the requested dashboard workflow, but it should not be treated as an accounting system until persistence, access control and auditability are added.
