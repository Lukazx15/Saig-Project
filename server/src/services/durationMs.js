// Minimal duration parser for strings like "15m", "7d", "30s", "1h".
// Avoids pulling in an extra dependency just for this.
function durationMs(input) {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/i.exec(String(input).trim());
  if (!match) {
    const n = Number(input);
    return Number.isFinite(n) ? n : 0;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * multipliers[unit];
}

module.exports = durationMs;
