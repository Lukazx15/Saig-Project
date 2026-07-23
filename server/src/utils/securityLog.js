/**
 * Structured security event logging. Never log passwords, tokens, or full URIs.
 */
function securityLog(event, details = {}) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    ...details,
  };
  // eslint-disable-next-line no-console
  console.log(`[security] ${JSON.stringify(entry)}`);
}

module.exports = securityLog;
