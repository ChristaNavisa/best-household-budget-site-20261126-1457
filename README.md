# HearthLedger — Household Budget Planner

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/ChristaNavisa/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/ChristaNavisa/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

A household budget site for one family's real month. The Alvarez family
— Maya, Jordan, Sofia (9) and Leo (6), Portland, Oregon — plans its
$6,400 November take-home pay down to zero before the month starts, then
tracks every dollar against that plan.

## What the site does

- **Dashboard** — take-home pay, spent so far ($5,213), saved ($900, a 14%
  savings rate), money left to assign, a spending-by-category chart, bills
  still due, and the latest transactions.
- **Budget planner** — twelve categories with planned vs spent vs left and
  a used-up bar each. Edit any planned amount and the totals recalculate
  at once; the plan is kept in the browser.
- **Transactions** — twenty real November purchases, filterable by
  category, searchable, and addable through a form that updates the budget
  totals too.
- **Bills & subscriptions** — eight recurring bills ($2,383.49 a month),
  due dates, autopay flags, and paid tick-boxes that update what is still due.
- **Savings goals** — emergency fund ($7,350 of $12,000), summer road trip,
  next car, college fund, each with top-up buttons.
- **Reports** — six months of spending as a chart, a month picker, a
  category share table, three findings, and a working CSV download.
- **Calculator** — the 50/30/20 split, an emergency-fund target, and a
  debt payoff estimate, all computed live from the numbers typed in.

## How it is built

Static files under `app/` with no build step and no network request:
`index.html`, `style.css`, `data.js` (every figure, in one place),
`charts.js` (canvas charts, no library), `app.js` (hash router and all
seven pages), `calculator.js` (the three calculators). System type only,
so the first load is small. Everything a visitor changes is stored in
their own browser with localStorage.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library.

## License

MIT — see [LICENSE](LICENSE).
