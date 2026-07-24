const STUDENT_ID_REGEX = /^\d{8}$/;

/**
 * Estimate year of study (1–8) from the student ID entry-year prefix.
 * OIDC userinfo does not include year; the first two digits of a KMITL
 * student ID are the conventional B.E. entry year (e.g. "65" → 2565).
 * Returns null when the id is not 8 digits.
 */
function inferYearOfStudyFromStudentId(studentId) {
  if (!STUDENT_ID_REGEX.test(String(studentId || ''))) return null;
  const prefix = parseInt(String(studentId).slice(0, 2), 10);
  const currentBEYear = new Date().getFullYear() + 543;
  let entryBE = Math.floor(currentBEYear / 100) * 100 + prefix;
  if (entryBE > currentBEYear) entryBE -= 100;
  const yearOfStudy = currentBEYear - entryBE + 1;
  if (yearOfStudy < 1 || yearOfStudy > 8) return null;
  return yearOfStudy;
}

module.exports = {
  inferYearOfStudyFromStudentId,
};
