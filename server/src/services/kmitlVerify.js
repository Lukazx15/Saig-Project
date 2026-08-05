const STUDENT_ID_REGEX = /^\d{8}$/;

/**
 * Faculty codes embedded in KMITL student IDs (digits 3–4).
 * Source: KOSEN-KMITL undergraduate student handbook (ความหมายของเลขประจำตัวนักศึกษา).
 * Values are canonical Thai faculty names from kmitlCatalog / client moods.ts.
 *
 * Codes without a bachelor catalog entry (e.g. 06 graduate school) are omitted
 * so registration can still let the student pick a known faculty.
 */
const FACULTY_CODE_MAP = {
  '01': 'คณะวิศวกรรมศาสตร์',
  '02': 'คณะสถาปัตยกรรม ศิลปะและการออกแบบ',
  '03': 'คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี',
  '04': 'คณะเทคโนโลยีการเกษตร',
  '05': 'คณะวิทยาศาสตร์',
  '07': 'คณะเทคโนโลยีสารสนเทศ',
  '08': 'คณะอุตสาหกรรมอาหาร',
  '10': 'คณะบริหารธุรกิจ',
  // Handbook: วิทยาลัยเทคโนโลยีและนวัตกรรมวัสดุ → catalog name
  '11': 'คณะเทคโนโลยีนวัตกรรมบูรณาการ',
  '12': 'วิทยาลัยนวัตกรรมการผลิตขั้นสูง',
  '13': 'วิทยาลัยอุตสาหกรรมการบินนานาชาติ',
  '14': 'คณะศิลปศาสตร์',
  '15': 'คณะแพทยศาสตร์',
  '16': 'วิทยาลัยวิศวกรรมสังคีต',
  '20': 'วิทยาเขตชุมพรเขตรอุดมศักดิ์',
  '21': 'สถาบันโคเซ็นแห่งสถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง',
};

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

/**
 * Infer faculty from digits 3–4 of an 8-digit KMITL student ID.
 * Example: 68010346 → code "01" → คณะวิศวกรรมศาสตร์.
 * Returns null when the id is invalid or the faculty code is unknown.
 */
function inferFacultyFromStudentId(studentId) {
  if (!STUDENT_ID_REGEX.test(String(studentId || ''))) return null;
  const code = String(studentId).slice(2, 4);
  return FACULTY_CODE_MAP[code] || null;
}

module.exports = {
  FACULTY_CODE_MAP,
  inferYearOfStudyFromStudentId,
  inferFacultyFromStudentId,
};
