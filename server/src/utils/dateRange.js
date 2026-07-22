/**
 * Calendar-day helpers for filter query params.
 *
 * HTML <input type="date"> sends YYYY-MM-DD. `new Date('YYYY-MM-DD')` is
 * UTC midnight, so `$lte` on dateTo excludes almost the entire selected day.
 * Interpret date-only values in Asia/Bangkok (KMITL) so the UI day matches
 * the campus timezone.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const BANGKOK_OFFSET = '+07:00';

function isDateOnly(value) {
  return typeof value === 'string' && DATE_ONLY.test(value);
}

/**
 * Inclusive start of the filter range.
 * @param {string} value YYYY-MM-DD or full ISO8601 datetime
 * @returns {Date}
 */
function parseDateFrom(value) {
  if (isDateOnly(value)) {
    return new Date(`${value}T00:00:00.000${BANGKOK_OFFSET}`);
  }
  return new Date(value);
}

/**
 * Inclusive end of the filter range (end of calendar day for date-only).
 * @param {string} value YYYY-MM-DD or full ISO8601 datetime
 * @returns {Date}
 */
function parseDateTo(value) {
  if (isDateOnly(value)) {
    return new Date(`${value}T23:59:59.999${BANGKOK_OFFSET}`);
  }
  return new Date(value);
}

module.exports = { parseDateFrom, parseDateTo, isDateOnly };
