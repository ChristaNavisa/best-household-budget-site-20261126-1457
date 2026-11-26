// app.js — HearthLedger: hash router, page renderers and every control.
// All figures come from data.js; visitor changes (added spending, paid
// bills, goal top-ups, edited plan) live in localStorage on this browser.

import {
  HOUSEHOLD, INCOME, CATEGORIES, TRANSACTIONS, BILLS, GOALS, TREND,
  money, money0, categoryById, plannedTotal, spentTotal, savedTotal,
} from './data.js';
import { drawCategoryBars, drawTrendBars } from './charts.js';
import { fiftyThirtyTwenty, emergencyFund, payoffMonths } from './calculator.js';

const view = document.getElementById('view');

// ---- small storage helpers (guarded: a private window may refuse) ----
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* keep going */ }
}

const store = {
  extraTx: load('hl-extra-tx', []),
  extraSpend: load('hl-extra-spend', {}),
  billsPaid: load('hl-bills-paid', {}),
  goalsExtra: load('hl-goals-extra', {}),
  planned: load('hl-planned', {}),
};

function plannedOf(c) {
  return store.planned[c.id] !== undefined ? store.planned[c.id] : c.planned;
}
function actualOf(c) {
  return c.actual + (store.extraSpend[c.id] || 0);
}
function categoriesLive() {
  return CATEGORIES.map((c) => ({ ...c, planned: plannedOf(c), actual: actualOf(c) }));
}
function plannedLive() {
  return categoriesLive().reduce((s, c) => s + c.planned, 0);
}
function spentLive() {
  return categoriesLive().filter((c) => c.id !== 'savings').reduce((s, c) => s + c.actual, 0);
}
function allTransactions() {
  return [...TRANSACTIONS, ...store.extraTx].sort((a, b) => (a.date < b.date ? 1 : -1));
}
function billPaid(b) {
  return store.billsPaid[b.id] !== undefined ? store.billsPaid[b.id] : b.paid;
}
function goalSaved(g) {
  return g.saved + (store.goalsExtra[g.id] || 0);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function statCard(label, value, sub) {
  return '<div class="card stat"><p class="stat-label">' + label + '</p><p class="stat-value">' + value + '</p><p class="stat-sub">' + sub + '</p></div>';
}

function pctBar(pct, color) {
  const p = Math.max(0, Math.min(100, pct));
  return '<div class="bar"><span style="width:' + p + '%;background:' + color + '"></span></div>';
}

function setActiveNav(route) {
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#/' + route);
  });
}

// ---------------- Dashboard ----------------
function pageDashboard() {
  const cats = categoriesLive();
  const spent = spentLive();
  const saved = savedTotal();
  const left = INCOME.takeHome - plannedLive();
  const rate = Math.round((saved / INCOME.takeHome) * 100);
  const upcoming = BILLS.filter((b) => !billPaid(b)).slice(0, 3);
  const recent = allTransactions().slice(0, 5);
  const fund = GOALS[0];
  const fundPct = Math.round((goalSaved(fund) / fund.target) * 100);

  view.innerHTML =
    '<section class="hero"><h1>November budget at a glance</h1>' +
    '<p>' + esc(HOUSEHOLD.name) + ' — ' + esc(HOUSEHOLD.members) + ', ' + esc(HOUSEHOLD.home) + '. ' +
    'Every dollar of the $6,400 take-home pay has a job before the month starts.</p></section>' +
    '<section class="stats">' +
    statCard('Take-home pay', money0(INCOME.takeHome), 'Maya $3,900 + Jordan $2,500') +
    statCard('Spent so far', money0(spent), 'of ' + money0(plannedLive() - saved) + ' planned spending') +
    statCard('Saved', money0(saved), rate + '% savings rate — target 14%') +
    statCard('Left to budget', money0(left), left >= 0 ? 'Every dollar assigned' : 'Over budget — see Budget') +
    '</section>' +
    '<section class="grid-2">' +
    '<div class="card"><h2>Where the money went</h2><p class="muted">Actual spending by category, November so far.</p>' +
    '<canvas id="catChart" aria-label="Bar chart of spending by category"></canvas></div>' +
    '<div class="card"><h2>Coming up</h2><p class="muted">Bills still due this month.</p>' +
    upcoming.map((b) => '<p class="bill-line"><strong>' + esc(b.name) + '</strong><span>' + money(b.amount) + ' · due Nov ' + b.due + '</span></p>').join('') +
    '<p><a class="btn" href="#/bills">See all bills</a></p>' +
    '<h2 class="mt">Emergency fund</h2>' + pctBar(fundPct, '#14532d') +
    '<p class="muted">' + money(goalSaved(fund)) + ' of ' + money0(fund.target) + ' — ' + fundPct + '% there. ' + money(fund.target - goalSaved(fund)) + ' to go.</p>' +
    '<p><a class="btn" href="#/goals">See all goals</a></p></div>' +
    '</section>' +
    '<section class="card"><h2>Recent spending</h2>' +
    '<table><thead><tr><th>Date</th><th>Where</th><th>Category</th><th class="num">Amount</th></tr></thead><tbody>' +
    recent.map((t) => '<tr><td>' + t.date.slice(5) + '</td><td>' + esc(t.merchant) + '</td><td>' + esc(categoryById(t.category).name) + '</td><td class="num">' + money(t.amount) + '</td></tr>').join('') +
    '</tbody></table><p><a class="btn" href="#/transactions">All transactions</a></p></section>' +
    '<section class="card tip"><h2>The 50/30/20 check</h2><p>Needs $3,200 · Wants $1,920 · Savings $1,280 on a $6,400 income. ' +
    'This household plans $4,730 on needs, $770 on wants and $900 on savings — saving a little less than the rule, ' +
    'because childcare is high this year. <a href="#/calculator">Try the calculator</a>.</p></section>';

  drawCategoryBars(document.getElementById('catChart'), cats.filter((c) => c.id !== 'savings'));
}

// ---------------- Budget planner ----------------
function pageBudget() {
  const cats = categoriesLive();
  const planned = plannedLive();
  const spent = spentLive();
  const remaining = INCOME.takeHome - planned;
  view.innerHTML =
    '<section class="hero"><h1>Budget planner</h1>' +
    '<p>Give every dollar a job. Edit any planned amount — the totals below recalculate at once and are kept in this browser. ' +
    'The plan must add up to the $6,400 take-home pay.</p></section>' +
    '<section class="stats">' +
    statCard('Planned', money0(planned), 'of ' + money0(INCOME.takeHome) + ' income') +
    statCard('Spent so far', money0(spent), 'across all categories') +
    statCard('Left to assign', money0(remaining), remaining === 0 ? 'Balanced to zero — perfect' : remaining > 0 ? 'Unassigned dollars' : 'Over by ' + money0(-remaining)) +
    '</section>' +
    '<section class="card"><h2>Categories</h2>' +
    '<table><thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th class="num">Left</th><th>Used</th></tr></thead><tbody>' +
    cats.map((c) => {
      const left = c.planned - c.actual;
      const pct = c.planned > 0 ? Math.round((c.actual / c.planned) * 100) : 0;
      return '<tr><td><span class="dot" style="background:' + c.color + '"></span><strong>' + esc(c.name) + '</strong><br><span class="muted">' + esc(c.note) + '</span></td>' +
        '<td class="num"><input class="planned-input" type="number" min="0" step="10" value="' + c.planned + '" data-cat="' + c.id + '" aria-label="Planned amount for ' + esc(c.name) + '"></td>' +
        '<td class="num">' + money(c.actual) + '</td>' +
        '<td class="num' + (left < 0 ? ' over' : '') + '">' + money(left) + '</td>' +
        '<td>' + pctBar(pct, left < 0 ? '#b8452f' : c.color) + '<span class="muted">' + pct + '%</span></td></tr>';
    }).join('') +
    '</tbody></table>' +
    '<p><button class="btn" id="resetPlan">Reset plan to November’s plan</button> ' +
    '<span class="muted">Changes save automatically in this browser.</span></p></section>';

  view.querySelectorAll('.planned-input').forEach((input) => {
    input.addEventListener('change', () => {
      const v = Math.max(0, Math.round(Number(input.value) || 0));
      store.planned[input.dataset.cat] = v;
      save('hl-planned', store.planned);
      pageBudget();
    });
  });
  document.getElementById('resetPlan').addEventListener('click', () => {
    store.planned = {};
    save('hl-planned', store.planned);
    pageBudget();
  });
}

// ---------------- Transactions ----------------
function pageTransactions() {
  const cats = CATEGORIES;
  view.innerHTML =
    '<section class="hero"><h1>Transactions</h1>' +
    '<p>Every dollar that left the account in November. Add a purchase below and it joins the list, the totals and the budget pages at once.</p></section>' +
    '<section class="card"><h2>Add a transaction</h2>' +
    '<form id="addTx" class="form-row">' +
    '<label>Date <input type="date" name="date" value="2026-11-26" required></label>' +
    '<label>Where <input type="text" name="merchant" placeholder="Shop or biller" required maxlength="60"></label>' +
    '<label>Category <select name="category">' + cats.map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('') + '</select></label>' +
    '<label>Amount $ <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>' +
    '<button class="btn" type="submit">Add transaction</button></form>' +
    '<p class="muted" id="txAdded"></p></section>' +
    '<section class="card"><h2>All transactions <span class="muted" id="txCount"></span></h2>' +
    '<div class="form-row"><label>Category <select id="txFilter"><option value="">All categories</option>' +
    cats.map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('') + '</select></label>' +
    '<label>Search <input type="search" id="txSearch" placeholder="Shop, biller…"></label></div>' +
    '<table><thead><tr><th>Date</th><th>Where</th><th>Category</th><th class="num">Amount</th></tr></thead>' +
    '<tbody id="txBody"></tbody></table>' +
    '<p class="muted">Showing <span id="txShown"></span> · Total <span id="txTotal"></span></p></section>';

  const body = document.getElementById('txBody');
  const renderList = () => {
    const f = document.getElementById('txFilter').value;
    const q = document.getElementById('txSearch').value.trim().toLowerCase();
    const rows = allTransactions().filter((t) => (!f || t.category === f) && (!q || t.merchant.toLowerCase().includes(q)));
    body.innerHTML = rows.map((t) => '<tr><td>' + t.date + '</td><td>' + esc(t.merchant) + '</td><td>' + esc(categoryById(t.category).name) + '</td><td class="num">' + money(t.amount) + '</td></tr>').join('') ||
      '<tr><td colspan="4">No transactions match. Try clearing the filter.</td></tr>';
    document.getElementById('txShown').textContent = rows.length + ' of ' + allTransactions().length;
    document.getElementById('txTotal').textContent = money(rows.reduce((s, t) => s + t.amount, 0));
    document.getElementById('txCount').textContent = '· ' + allTransactions().length + ' in November';
  };
  document.getElementById('txFilter').addEventListener('change', renderList);
  document.getElementById('txSearch').addEventListener('input', renderList);
  document.getElementById('addTx').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const tx = {
      date: fd.get('date'),
      merchant: fd.get('merchant').trim(),
      category: fd.get('category'),
      amount: Math.round(Number(fd.get('amount')) * 100) / 100,
    };
    if (!tx.merchant || !(tx.amount > 0)) return;
    store.extraTx.push(tx);
    store.extraSpend[tx.category] = (store.extraSpend[tx.category] || 0) + tx.amount;
    save('hl-extra-tx', store.extraTx);
    save('hl-extra-spend', store.extraSpend);
    document.getElementById('txAdded').textContent = 'Added ' + money(tx.amount) + ' at ' + tx.merchant + ' — the budget totals now include it.';
    e.target.reset();
    e.target.date.value = '2026-11-26';
    renderList();
  });
  renderList();
}

// ---------------- Bills ----------------
function pageBills() {
  const total = BILLS.reduce((s, b) => s + b.amount, 0);
  const paidCount = BILLS.filter(billPaid).length;
  const due = BILLS.filter((b) => !billPaid(b)).reduce((s, b) => s + b.amount, 0);
  view.innerHTML =
    '<section class="hero"><h1>Bills &amp; subscriptions</h1>' +
    '<p>Everything that comes out on a schedule. Tick a bill paid and the totals update; autopay bills are marked so you can see what the bank handles itself.</p></section>' +
    '<section class="stats">' +
    statCard('Monthly bills', money(total), BILLS.length + ' recurring bills') +
    statCard('Paid', paidCount + ' of ' + BILLS.length, money(total - due) + ' already out the door') +
    statCard('Still due', money(due), 'before November ends') +
    '</section>' +
    '<section class="card"><h2>November bills</h2>' +
    '<table><thead><tr><th>Bill</th><th class="num">Amount</th><th>Due</th><th>Autopay</th><th>Paid</th></tr></thead><tbody>' +
    BILLS.map((b) => '<tr><td><strong>' + esc(b.name) + '</strong></td><td class="num">' + money(b.amount) + '</td><td>Nov ' + b.due + '</td><td>' + (b.autopay ? 'Yes' : 'No') + '</td>' +
      '<td><input type="checkbox" data-bill="' + b.id + '"' + (billPaid(b) ? ' checked' : '') + ' aria-label="Mark ' + esc(b.name) + ' paid"></td></tr>').join('') +
    '</tbody></table>' +
    '<p><button class="btn" id="payAll">Mark all paid</button> <button class="btn ghost" id="resetBills">Reset to the 26th</button></p></section>';

  view.querySelectorAll('[data-bill]').forEach((box) => {
    box.addEventListener('change', () => {
      store.billsPaid[box.dataset.bill] = box.checked;
      save('hl-bills-paid', store.billsPaid);
      pageBills();
    });
  });
  document.getElementById('payAll').addEventListener('click', () => {
    BILLS.forEach((b) => { store.billsPaid[b.id] = true; });
    save('hl-bills-paid', store.billsPaid);
    pageBills();
  });
  document.getElementById('resetBills').addEventListener('click', () => {
    store.billsPaid = {};
    save('hl-bills-paid', store.billsPaid);
    pageBills();
  });
}

// ---------------- Goals ----------------
function pageGoals() {
  const totalSaved = GOALS.reduce((s, g) => s + goalSaved(g), 0);
  const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);
  view.innerHTML =
    '<section class="hero"><h1>Savings goals</h1>' +
    '<p>Four things the family is saving for, in order. ' + money(totalSaved) + ' saved toward ' + money0(totalTarget) + ' of goals — tap +$50 to record a top-up.</p></section>' +
    '<section class="grid-2">' +
    GOALS.map((g) => {
      const saved = goalSaved(g);
      const pct = Math.round((saved / g.target) * 100);
      return '<div class="card"><h2>' + esc(g.name) + '</h2><p class="muted">' + esc(g.note) + '</p>' +
        pctBar(pct, '#14532d') +
        '<p><strong>' + money(saved) + '</strong> of ' + money0(g.target) + ' · ' + pct + '% · ' + money(g.target - saved) + ' to go</p>' +
        '<p><button class="btn" data-goal="' + g.id + '" data-amt="50">+ $50</button> <button class="btn ghost" data-goal="' + g.id + '" data-amt="100">+ $100</button></p></div>';
    }).join('') +
    '</section>' +
    '<section class="card tip"><h2>Pay yourself first</h2><p>The $900 savings transfer leaves the checking account on payday, before any spending happens. ' +
    'That is why the emergency fund is already at ' + money(goalSaved(GOALS[0])) + ' — it never waits for “what’s left over.”</p></section>';

  view.querySelectorAll('[data-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const amt = Number(btn.dataset.amt);
      store.goalsExtra[btn.dataset.goal] = (store.goalsExtra[btn.dataset.goal] || 0) + amt;
      save('hl-goals-extra', store.goalsExtra);
      pageGoals();
    });
  });
}

// ---------------- Reports ----------------
function pageReports() {
  const avg = Math.round(TREND.reduce((s, t) => s + t.spent, 0) / TREND.length);
  const cats = categoriesLive().filter((c) => c.id !== 'savings');
  const spent = spentLive();
  const top = [...cats].sort((a, b) => b.actual - a.actual).slice(0, 3);
  view.innerHTML =
    '<section class="hero"><h1>Reports</h1>' +
    '<p id="reportLead">Six months of spending, side by side.</p></section>' +
    '<section class="card"><h2>Spending by month</h2>' +
    '<p class="muted">Tap a month to see its figure against the average.</p>' +
    '<canvas id="trendChart" aria-label="Bar chart of monthly spending, June to November"></canvas>' +
    '<div class="month-picks" id="monthPicks">' +
    TREND.map((t, i) => '<button class="btn' + (i === TREND.length - 1 ? ' active' : ' ghost') + '" data-month="' + i + '">' + t.month + '</button>').join('') +
    '</div><p id="monthNote" class="big"></p></section>' +
    '<section class="grid-2"><div class="card"><h2>Where November went</h2>' +
    '<table><thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th></tr></thead><tbody>' +
    cats.map((c) => '<tr><td>' + esc(c.name) + '</td><td class="num">' + money(c.actual) + '</td><td class="num">' + Math.round((c.actual / spent) * 100) + '%</td></tr>').join('') +
    '</tbody></table></div>' +
    '<div class="card"><h2>Three things we noticed</h2><ol class="notes">' +
    '<li><strong>' + esc(top[0].name) + ' is the biggest cost</strong> at ' + money(top[0].actual) + ' — ' + Math.round((top[0].actual / spent) * 100) + '% of November spending, and it never moves. That is why it is planned first.</li>' +
    '<li><strong>Groceries beat the plan by $35</strong> — five shops, no takeout sneaking in, and the pantry list is doing its job.</li>' +
    '<li><strong>The buffer saved the month:</strong> the $96.50 hardware run came out of the $750 buffer, not the credit card.</li>' +
    '</ol><p><button class="btn" id="exportCsv">Download transactions (CSV)</button> <button class="btn ghost" id="printReport">Print this report</button></p></div></section>';

  drawTrendBars(document.getElementById('trendChart'), TREND, TREND.length - 1);
  const lead = document.getElementById('reportLead');
  const nov = TREND[TREND.length - 1];
  const under = avg - nov.spent;
  lead.textContent = 'Six months of spending, side by side. November is the lowest month yet — ' +
    money0(under) + ' under the six-month average of ' + money0(avg) + '.';
  const note = document.getElementById('monthNote');
  const showMonth = (i) => {
    const t = TREND[i];
    const diff = t.spent - avg;
    note.textContent = t.month + ' 2026: ' + money0(t.spent) + ' spent — ' + (diff <= 0 ? money0(-diff) + ' under' : money0(diff) + ' over') + ' the six-month average of ' + money0(avg) + '.';
    document.querySelectorAll('#monthPicks .btn').forEach((b, j) => b.classList.toggle('active', j === i));
  };
  showMonth(TREND.length - 1);
  document.querySelectorAll('#monthPicks .btn').forEach((b) => {
    b.addEventListener('click', () => showMonth(Number(b.dataset.month)));
  });
  document.getElementById('exportCsv').addEventListener('click', () => {
    const lines = ['date,merchant,category,amount'];
    allTransactions().forEach((t) => lines.push([t.date, '"' + t.merchant.replace(/"/g, '""') + '"', t.category, t.amount.toFixed(2)].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hearthledger-transactions-nov-2026.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('printReport').addEventListener('click', () => window.print());
}

// ---------------- Calculator ----------------
function pageCalculator() {
  view.innerHTML =
    '<section class="hero"><h1>Budget calculator</h1>' +
    '<p>Three quick tools, all computed in this page from the numbers you type. Nothing leaves the browser.</p></section>' +
    '<section class="grid-2">' +
    '<div class="card"><h2>50 / 30 / 20 rule</h2><p class="muted">Split take-home pay into needs, wants and savings.</p>' +
    '<label>Monthly take-home pay $ <input type="number" id="calcIncome" min="0" step="50" value="6400"></label>' +
    '<div id="splitOut"></div></div>' +
    '<div class="card"><h2>Emergency fund</h2><p class="muted">Monthly essentials × months of cover.</p>' +
    '<label>Monthly essentials $ <input type="number" id="calcEss" min="0" step="50" value="4850"></label>' +
    '<label>Months of cover <input type="number" id="calcMonths" min="1" max="12" step="1" value="6"></label>' +
    '<p class="big" id="fundOut"></p></div>' +
    '<div class="card"><h2>Debt payoff</h2><p class="muted">How long a fixed payment takes to clear a balance.</p>' +
    '<label>Balance $ <input type="number" id="calcBal" min="0" step="100" value="2400"></label>' +
    '<label>APR % <input type="number" id="calcApr" min="0" step="0.1" value="19.9"></label>' +
    '<label>Monthly payment $ <input type="number" id="calcPay" min="0" step="10" value="150"></label>' +
    '<p class="big" id="payOut"></p></div>' +
    '<div class="card tip"><h2>How the Alvarez family uses it</h2><p>On $6,400 the rule suggests $3,200 for needs, $1,920 for wants and $1,280 for savings. ' +
    'Their real plan is $4,730 / $770 / $900 — needs run high while the kids are small, so wants stay lean and savings stay automatic.</p></div>' +
    '</section>';

  const split = () => {
    const r = fiftyThirtyTwenty(Number(document.getElementById('calcIncome').value));
    document.getElementById('splitOut').innerHTML =
      '<p class="big">Needs ' + money0(r.needs) + ' · Wants ' + money0(r.wants) + ' · Savings ' + money0(r.savings) + '</p>' +
      pctBar(50, '#1f5c46') + '<p class="muted">50% needs</p>' +
      pctBar(30, '#c96f3f') + '<p class="muted">30% wants</p>' +
      pctBar(20, '#14532d') + '<p class="muted">20% savings</p>';
  };
  const fund = () => {
    const r = emergencyFund(Number(document.getElementById('calcEss').value), Number(document.getElementById('calcMonths').value));
    document.getElementById('fundOut').textContent = 'Target: ' + money0(r.target) + ' — ' + r.months + ' months × essentials.';
  };
  const payoff = () => {
    const r = payoffMonths(Number(document.getElementById('calcBal').value), Number(document.getElementById('calcApr').value), Number(document.getElementById('calcPay').value));
    document.getElementById('payOut').textContent = r.ok
      ? 'Debt-free in ' + r.months + ' months, paying ' + money0(r.interest) + ' in interest.'
      : 'That payment never clears the balance — raise it above the monthly interest.';
  };
  ['calcIncome'].forEach((id) => document.getElementById(id).addEventListener('input', split));
  ['calcEss', 'calcMonths'].forEach((id) => document.getElementById(id).addEventListener('input', fund));
  ['calcBal', 'calcApr', 'calcPay'].forEach((id) => document.getElementById(id).addEventListener('input', payoff));
  split(); fund(); payoff();
}

// ---------------- Router ----------------
const ROUTES = {
  '': pageDashboard,
  budget: pageBudget,
  transactions: pageTransactions,
  bills: pageBills,
  goals: pageGoals,
  reports: pageReports,
  calculator: pageCalculator,
};

function route() {
  const hash = (location.hash || '#/').replace(/^#\/?/, '');
  const page = ROUTES[hash] || pageDashboard;
  setActiveNav(hash in ROUTES ? hash : '');
  page();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
window.addEventListener('resize', () => {
  const hash = (location.hash || '#/').replace(/^#\/?/, '');
  if (hash === '' || hash === 'reports') route();
});
route();
