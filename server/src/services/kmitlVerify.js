const env = require('../config/env');

const STUDENT_ID_REGEX = /^\d{8}$/;

/**
 * Verifies that a KMITL email matches the expected `<studentId>@kmitl.ac.th`
 * pattern for the given student ID.
 */
function emailMatchesStudentId(studentId, email) {
  return email.toLowerCase() === `${studentId}@kmitl.ac.th`;
}

/**
 * KMITL student IDs are conventionally 8 digits where the first two digits
 * encode the Buddhist-calendar entry year (e.g. "65" for a student who
 * enrolled in B.E. 2565 / 2022 CE). We cross-check that prefix against the
 * student's self-reported year of study (1-8), tolerating enrollment
 * happening before/after the academic year boundary.
 */
function entryYearDigitsPlausible(studentId, yearOfStudy) {
  const prefix = parseInt(studentId.slice(0, 2), 10);
  const now = new Date();
  const currentBEYear = now.getFullYear() + 543;
  const expected = (currentBEYear - (yearOfStudy - 1)) % 100;
  const expectedPrev = (expected - 1 + 100) % 100; // tolerate year-boundary edge case
  const expectedNext = (expected + 1) % 100;
  return [expected, expectedPrev, expectedNext].includes(prefix);
}

/**
 * Strict format-only fallback verification. Used whenever no
 * KMITL_API_KEY is configured (the default — real KMITL developer keys
 * require manual admin approval on developer.kmitl.ac.th).
 */
function verifyByFormat({ studentId, email, year }) {
  if (!STUDENT_ID_REGEX.test(studentId)) {
    return { verified: false, method: 'format', reason: 'Student ID must be exactly 8 digits.' };
  }
  if (!emailMatchesStudentId(studentId, email)) {
    return {
      verified: false,
      method: 'format',
      reason: `Email must be ${studentId}@kmitl.ac.th.`,
    };
  }
  if (!entryYearDigitsPlausible(studentId, year)) {
    return {
      verified: false,
      method: 'format',
      reason: 'Student ID entry-year prefix does not match the provided year of study.',
    };
  }
  return { verified: true, method: 'format', reason: 'Passed strict format validation.' };
}

/**
 * Calls the KMITL Developer Platform API to confirm the student exists and
 * their details match. Requires an approved KMITL_API_KEY. Falls back to
 * format validation on any network/API error so the app keeps working.
 */
async function verifyByApi({ studentId, email, year }) {
  try {
    const url = `${env.kmitl.apiBaseUrl}/students/profile?studentId=${encodeURIComponent(studentId)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.kmitl.apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`KMITL API responded with status ${response.status}`);
    }

    const profile = await response.json();
    const matches =
      profile &&
      String(profile.studentId) === studentId &&
      String(profile.email).toLowerCase() === email.toLowerCase();

    return {
      verified: Boolean(matches),
      method: 'api',
      reason: matches ? 'Verified against KMITL Developer API.' : 'KMITL API record did not match submitted details.',
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[kmitlVerify] API verification failed, falling back to format check:', err.message);
    const fallback = verifyByFormat({ studentId, email, year });
    return { ...fallback, method: 'format', reason: `${fallback.reason} (API fallback: ${err.message})` };
  }
}

/**
 * Verifies a prospective student. Uses the real KMITL API when
 * KMITL_API_KEY is configured, otherwise falls back to strict format
 * validation. Never throws — always resolves to a verification result.
 */
async function verifyStudent({ studentId, email, year }) {
  if (env.kmitl.apiKey) {
    return verifyByApi({ studentId, email, year });
  }
  return verifyByFormat({ studentId, email, year });
}

module.exports = { verifyStudent, verifyByFormat, emailMatchesStudentId };
