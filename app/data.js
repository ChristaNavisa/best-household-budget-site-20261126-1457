// HearthLedger data: the Alvarez household's November 2026 budget.
// Every figure is a fixed, realistic number the site renders and totals.
// Amounts are US dollars. Editing a figure here changes every view at once,
// because every page reads from this one module.

export const HOUSEHOLD = {
  name: 'The Alvarez Family',
  members: 'Maya & Jordan Alvarez, with Sofia (9) and Leo (6)',
  home: 'Portland, Oregon',
  month: 'November 2026',
  monthShort: 'Nov 2026',
};

export const INCOME = {
  takeHome: 6400,
  sources: [
    { label: 'Maya — school nurse, take-home pay', amount: 3900 },
    { label: 'Jordan — bus driver, take-home pay', amount: 2500 },
  ],
};

// Planned vs actually spent so far in November. Planned sums to the $6,400
// take-home pay, so the budget balances to zero.
export const CATEGORIES = [
  { id: 'housing', name: 'Housing', planned: 1850, actual: 1850, color: '#1f5c46', note: 'Mortgage, taxes and insurance' },
  { id: 'groceries', name: 'Groceries', planned: 720, actual: 685, color: '#4d8a4f', note: 'Weekly shop at GreenMart' },
  { id: 'utilities', name: 'Utilities', planned: 310, actual: 296, color: '#2f7f8f', note: 'Power, water, internet, phones' },
  { id: 'transport', name: 'Transport', planned: 420, actual: 388, color: '#7a6a3f', note: 'Fuel, bus passes, car upkeep' },
  { id: 'childcare', name: 'Childcare', planned: 650, actual: 650, color: '#8a5a7d', note: 'After-school care, both kids' },
  { id: 'dining', name: 'Dining out', planned: 240, actual: 212, color: '#c96f3f', note: 'Two family meals out a month' },
  { id: 'fun', name: 'Entertainment', planned: 160, actual: 143, color: '#b8452f', note: 'Streaming, movies, library fines' },
  { id: 'clothing', name: 'Clothing', planned: 120, actual: 86, color: '#5b6b8c', note: 'Kids grow fast; thrift first' },
  { id: 'health', name: 'Health', planned: 180, actual: 164, color: '#3f7d6b', note: 'Pharmacy, dentist, check-ups' },
  { id: 'savings', name: 'Savings', planned: 900, actual: 900, color: '#14532d', note: 'Moved to savings on payday' },
  { id: 'giving', name: 'Giving', planned: 100, actual: 100, color: '#97751f', note: 'School fundraiser and food bank' },
  { id: 'buffer', name: 'Household buffer', planned: 750, actual: 639, color: '#6b7280', note: 'Repairs, gifts, the unexpected' },
];

export const TRANSACTIONS = [
  { date: '2026-11-02', merchant: 'GreenMart Groceries', category: 'groceries', amount: 86.40 },
  { date: '2026-11-03', merchant: 'City Power & Light', category: 'utilities', amount: 132.00 },
  { date: '2026-11-04', merchant: 'Bright Beginnings Childcare', category: 'childcare', amount: 325.00 },
  { date: '2026-11-05', merchant: 'Fuel — Rose City Gas', category: 'transport', amount: 48.20 },
  { date: '2026-11-06', merchant: 'GreenMart Groceries', category: 'groceries', amount: 112.75 },
  { date: '2026-11-07', merchant: 'The Corner Bistro', category: 'dining', amount: 54.30 },
  { date: '2026-11-09', merchant: 'Northgate Pharmacy', category: 'health', amount: 42.18 },
  { date: '2026-11-10', merchant: 'Bright Beginnings Childcare', category: 'childcare', amount: 325.00 },
  { date: '2026-11-11', merchant: 'Metro Transit Passes', category: 'transport', amount: 100.00 },
  { date: '2026-11-12', merchant: 'GreenMart Groceries', category: 'groceries', amount: 94.60 },
  { date: '2026-11-13', merchant: 'StreamFlix', category: 'fun', amount: 15.49 },
  { date: '2026-11-14', merchant: 'KidCuts Clothing', category: 'clothing', amount: 86.00 },
  { date: '2026-11-15', merchant: 'Patel Family Dental', category: 'health', amount: 120.00 },
  { date: '2026-11-17', merchant: 'GreenMart Groceries', category: 'groceries', amount: 128.40 },
  { date: '2026-11-18', merchant: 'Fuel — Rose City Gas', category: 'transport', amount: 44.10 },
  { date: '2026-11-19', merchant: 'Pizza Night — Tony’s', category: 'dining', amount: 38.75 },
  { date: '2026-11-21', merchant: 'GreenMart Groceries', category: 'groceries', amount: 152.30 },
  { date: '2026-11-22', merchant: 'Home Hardware', category: 'buffer', amount: 96.50 },
  { date: '2026-11-24', merchant: 'GreenMart Groceries', category: 'groceries', amount: 110.45 },
  { date: '2026-11-25', merchant: 'Movie Night — Cinema 4', category: 'fun', amount: 32.00 },
];

export const BILLS = [
  { id: 'mortgage', name: 'Mortgage — First Home Bank', amount: 1850.00, due: 1, autopay: true, paid: true },
  { id: 'gym', name: 'Community Gym — family plan', amount: 39.00, due: 5, autopay: true, paid: true },
  { id: 'streaming', name: 'StreamFlix', amount: 15.49, due: 8, autopay: true, paid: true },
  { id: 'power', name: 'City Power & Light', amount: 132.00, due: 12, autopay: false, paid: true },
  { id: 'internet', name: 'Northlink Internet 300', amount: 65.00, due: 15, autopay: true, paid: false },
  { id: 'phones', name: 'Mobile — two lines', amount: 96.00, due: 18, autopay: true, paid: false },
  { id: 'water', name: 'City Water', amount: 58.00, due: 20, autopay: false, paid: false },
  { id: 'insurance', name: 'Car Insurance — Cascade Mutual', amount: 128.00, due: 25, autopay: true, paid: false },
];

export const GOALS = [
  { id: 'emergency', name: 'Emergency fund', target: 12000, saved: 7350, note: 'Six months of essentials, the safety net first.' },
  { id: 'trip', name: 'Summer road trip', target: 2400, saved: 1150, note: 'Two weeks down the Oregon coast in July.' },
  { id: 'car', name: 'Next car down payment', target: 5000, saved: 2200, note: 'Replace the 2011 sedan before it strands us.' },
  { id: 'college', name: 'Kids’ college fund', target: 10000, saved: 3800, note: '$50 a month each, plus birthday money.' },
];

// Monthly spending (excluding the savings transfer) for the last six months.
export const TREND = [
  { month: 'Jun', spent: 5480 },
  { month: 'Jul', spent: 5310 },
  { month: 'Aug', spent: 5640 },
  { month: 'Sep', spent: 5290 },
  { month: 'Oct', spent: 5420 },
  { month: 'Nov', spent: 5213 },
];

export function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function money0(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || { name: id, color: '#6b7280' };
}

export function plannedTotal() {
  return CATEGORIES.reduce((s, c) => s + c.planned, 0);
}

// Spending so far, not counting the savings transfer.
export function spentTotal() {
  return CATEGORIES.filter((c) => c.id !== 'savings').reduce((s, c) => s + c.actual, 0);
}

export function savedTotal() {
  const s = CATEGORIES.find((c) => c.id === 'savings');
  return s ? s.actual : 0;
}
