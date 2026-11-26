// charts.js — small canvas charts drawn with the 2D API only, no library.
// Every chart reads its numbers from data.js, so the pictures always match
// the tables on the same page.

function setupCanvas(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

// Horizontal bars: one per category, planned as a pale track, actual as a
// solid bar, with the dollar figure at the end. Over-budget bars turn rust.
export function drawCategoryBars(canvas, categories) {
  const rowH = 30;
  const height = categories.length * rowH + 8;
  const { ctx, width } = setupCanvas(canvas, height);
  const labelW = 118;
  const valueW = 64;
  const barW = width - labelW - valueW - 8;
  const max = Math.max(...categories.map((c) => c.planned), 1);
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  categories.forEach((c, i) => {
    const y = 8 + i * rowH;
    const over = c.actual > c.planned;
    ctx.fillStyle = '#22302a';
    ctx.textAlign = 'right';
    ctx.fillText(c.name, labelW - 10, y + 11);
    ctx.fillStyle = '#e9e2d3';
    roundRect(ctx, labelW, y, barW, 16, 4);
    ctx.fill();
    ctx.fillStyle = over ? '#b8452f' : c.color;
    roundRect(ctx, labelW, y, Math.max(4, (barW * c.actual) / max), 16, 4);
    ctx.fill();
    ctx.fillStyle = over ? '#b8452f' : '#22302a';
    ctx.textAlign = 'left';
    ctx.fillText('$' + Math.round(c.actual).toLocaleString('en-US'), labelW + barW + 8, y + 11);
  });
}

// Monthly trend: vertical bars for Jun–Nov with the value on top; the
// current month is drawn in the deep green, earlier months in pale sage.
export function drawTrendBars(canvas, trend, highlightIndex) {
  const height = 210;
  const { ctx, width } = setupCanvas(canvas, height);
  const padL = 8;
  const padB = 26;
  const padT = 26;
  const plotH = height - padT - padB;
  const max = Math.max(...trend.map((t) => t.spent), 1);
  const slot = (width - padL * 2) / trend.length;
  const barW = Math.min(64, slot * 0.55);
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  trend.forEach((t, i) => {
    const x = padL + slot * i + (slot - barW) / 2;
    const h = (plotH * t.spent) / max;
    const y = padT + (plotH - h);
    ctx.fillStyle = i === highlightIndex ? '#1f5c46' : '#b9c9b3';
    roundRect(ctx, x, y, barW, h, 4);
    ctx.fill();
    ctx.fillStyle = '#22302a';
    ctx.fillText('$' + t.spent.toLocaleString('en-US'), x + barW / 2, y - 7);
    ctx.fillStyle = '#5c6b60';
    ctx.fillText(t.month, x + barW / 2, height - 8);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
