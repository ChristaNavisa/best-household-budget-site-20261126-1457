// calculator.js — the two calculators on the Calculator page. Pure
// functions over the numbers the visitor types; no network, no storage.

export function fiftyThirtyTwenty(income) {
  const safe = Math.max(0, income || 0);
  return {
    needs: Math.round(safe * 0.5),
    wants: Math.round(safe * 0.3),
    savings: Math.round(safe * 0.2),
  };
}

// How big an emergency fund should be: monthly essentials times the number
// of months the household wants covered.
export function emergencyFund(monthlyEssentials, months) {
  const essentials = Math.max(0, monthlyEssentials || 0);
  const m = Math.min(12, Math.max(1, months || 3));
  return { months: m, target: Math.round(essentials * m) };
}

// A debt payoff sketch: fixed monthly payment against a balance at an APR.
export function payoffMonths(balance, apr, payment) {
  const b = Math.max(0, balance || 0);
  const p = Math.max(0, payment || 0);
  if (b === 0) return { months: 0, interest: 0, ok: true };
  if (p <= 0) return { months: 0, interest: 0, ok: false };
  const r = (apr || 0) / 100 / 12;
  if (r === 0) return { months: Math.ceil(b / p), interest: 0, ok: true };
  if (p <= b * r) return { months: 0, interest: 0, ok: false };
  const months = Math.ceil(-Math.log(1 - (b * r) / p) / Math.log(1 + r));
  return { months, interest: Math.round(months * p - b), ok: true };
}
