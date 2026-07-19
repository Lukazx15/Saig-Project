/**
 * Canonical Thai faculty/major catalog (mirrors client/src/lib/moods.ts).
 * English / broad-program aliases map into these keys so SSO and register
 * users share one string for filters + stats.
 *
 * Source: https://office.kmitl.ac.th/oaq/curriculum
 */

const MAJORS_BY_FACULTY = {
  คณะวิศวกรรมศาสตร์: [
    'วิศวกรรมอาหาร',
    'วิศวกรรมสารสนเทศ',
    'วิศวกรรมระบบไอโอทีและสารสนเทศ',
    'วิศวกรรมไอโอทีและสารสนเทศ',
    'วิศวกรรมเกษตร',
    'วิศวกรรมเกษตรอัจฉริยะ',
    'วิศวกรรมเครื่องกล',
    'วิศวกรรมเคมี',
    'วิศวกรรมการวัดคุม',
    'วิศวกรรมเมคคาทรอนิกส์และออโตเมชัน',
    'วิศวกรรมเมคคาทรอนิกส์และระบบวัดคุม',
    'วิศวกรรมปิโตรเคมี',
    'วิศวกรรมโยธา',
    'วิศวกรรมอุตสาหการ',
    'วิศวกรรมคอมพิวเตอร์',
    'วิศวกรรมไฟฟ้า',
    'วิศวกรรมอิเล็กทรอนิกส์',
    'วิศวกรรมโทรคมนาคม',
    'วิศวกรรมโทรคมนาคมและโครงข่าย',
    'วิศวกรรมไฟฟ้าสื่อสารและเครือข่าย',
    'วิศวกรรมแมคคาทรอนิกส์',
    'วิศวกรรมระบบควบคุม',
    'วิศวกรรมอัตโนมัติ',
    'วิศวกรรมออโตเมชัน',
    'วิศวกรรมขนส่งทางราง',
    'วิศวกรรมการผลิตเชิงบูรณาการ',
    'วิศวกรรมการวัดคุม (ต่อเนื่อง)',
    'วิศวกรรมออกแบบการผลิตและวัสดุ',
    'วิศวกรรมอวกาศและภูมิสารสนเทศ',
    'วิศวกรรมคอมพิวเตอร์และความปลอดภัยไซเบอร์',
    'วิศวกรรมคอมพิวเตอร์ (ต่อเนื่อง)',
    'วิศวกรรมไฟฟ้าสื่อสารและอิเล็กทรอนิกส์ (ต่อเนื่อง)',
    'วิศวกรรมโยธา (ต่อเนื่อง)',
    'วิศวกรรมระบบอุตสาหกรรมการเกษตร (ต่อเนื่อง)',
    'วิศวกรรมไฟฟ้า (ต่อเนื่อง)',
    'วิศวกรรมอุตสาหการและระบบการจัดการเชิงดิจิทัล (นานาชาติ)',
    'วิศวกรรมอุตสาหการและการจัดการโลจิสติกส์ (นานาชาติ)',
    'วิศวกรรมหุ่นยนต์และปัญญาประดิษฐ์ (นานาชาติ)',
    'วิศวกรรมโยธา (นานาชาติ)',
    'วิศวกรรมไฟฟ้า (นานาชาติ)',
    'วิศวกรรมพลังงาน (นานาชาติ)',
    'วิศวกรรมนวัตกรรมคอมพิวเตอร์ (นานาชาติ)',
    'วิศวกรรมซอฟต์แวร์ (นานาชาติ)',
    'วิศวกรรมชีวการแพทย์ (นานาชาติ) (พหุวิทยาการ)',
    'วิศวกรรมเครื่องกล (นานาชาติ)',
    'วิศวกรรมเคมี (นานาชาติ)',
    'วิศวกรรมคอมพิวเตอร์ (นานาชาติ)',
    'วิศวกรรมการเงิน (นานาชาติ) (พหุวิทยาการ)',
    'การจัดการวิศวกรรมและการเป็นผู้ประกอบการ (นานาชาติ)',
    'วิศวกรรมปัญญาประดิษฐ์และการเป็นผู้ประกอบการ (นานาชาติ)',
    'วิศวกรรมแมคคาทรอนิกส์ (นานาชาติ)',
  ],
  'คณะสถาปัตยกรรม ศิลปะและการออกแบบ': [
    'ภูมิสถาปัตยกรรมศาสตรบัณฑิต (5 ปี)',
    'สถาปัตยกรรมหลัก (5 ปี)',
    'สถาปัตยกรรมภายใน (5 ปี)',
    'ศิลปอุตสาหกรรม',
    'ศิลปกรรม มีเดียอาตส์ และอิลลัสเตชันอาร์ต',
    'ภาพยนตร์และดิจิทัล มีเดีย',
    'ภาพพิมพ์และอิลลัสเตชั่น',
    'ประติมากรรมและประติมากรรมเพื่อสังคม',
    'นิเทศศิลป์',
    'จิตรกรรมและมีเดียอาตส์',
    'การออกแบบสนเทศสามมิติ',
    'การถ่ายภาพ',
    'ปัญญาออกแบบเพื่อเศรษฐกิจสร้างสรรค์ (หลักสูตรนานาชาติ)',
    'สถาปัตยกรรม (หลักสูตรนานาชาติ)',
    'ศิลปะสร้างสรรค์และภัณฑารักษาศึกษา (หลักสูตรนานาชาติ)',
    'การออกแบบประสบการณ์สำหรับสื่อบูรณาการ',
  ],
  คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี: [
    'สถาปัตกรรม',
    'การออกแบบสภาพแวดล้อมภายใน',
    'ครุศาสตร์การออกแบบ',
    'นวัตกรรมและเทคโนโลยีการออกแบบ (4 ปี)',
    'ครุศาสตร์วิศวกรรม',
    'ครุศาสตร์เกษตร',
    'เทคโนโลยีอิเล็กทรอนิกส์ (ต่อเนื่อง)',
    'เทคโนโลยีชีวภาพทางการเกษตร (ต่อเนื่อง)',
    'บูรณาการนวัตกรรมเพื่อสินค้าและบริการ (ต่อเนื่อง)',
    'วิทยาการจัดการเรียนรู้ (4 ปี)',
    'เทคโนโลยีคอมพิวเตอร์ (4 ปี)',
  ],
  คณะเทคโนโลยีการเกษตร: [
    'วิทยาศาสตร์การประมง',
    'นวัตกรรมการผลิตสัตว์น้ำและการจัดการทรัพยากรประมง',
    'การอกแบบและการจัดการภูมิทัศน์เพื่อสิ่งแวดล้อม',
    'พัฒนาการเกษตร',
    'การจัดการสมาร์ตฟาร์ม',
    'สัตวศาสตร์',
    'เทคโนโลยีการผลิตสัตว์และวิทยาศาสตร์เนื้อสัตว์',
    'นิเทศศาสตร์เกษตร',
    'เกษตรศาสตร์',
    'เทคโนโลยีการผลิตพืช',
    'นวัตกรรมพืชสวน',
    'การพยาบาลสัตว์และการจัดการ ธุรกิจสัตว์เลี้ยง',
  ],
  คณะวิทยาศาสตร์: [
    'ฟิสิกส์ประยุกต์',
    'ฟิสิกส์อุตสาหกรรม',
    'คณิตศาสตร์ประยุกต์',
    'วิทยาการคอมพิวเตอร์',
    'สถิติประยุกต์',
    'สถิติประยุกต์และการวิเคราะห์ข้อมูล',
    'เคมีอุตสาหกรรม',
    'เคมีสิ่งแวดล้อม',
    'เทคโนโลยีสิ่งแวดล้อมและการจัดการอย่างยั่งยืน',
    'เทคโนโลยีชีวภาพอุตสาหกรรม',
    'เทคโนโลยีชีวภาพ',
    'จุลชีววิทยาอุตสาหกรรม',
    'เคมีวิศวกรรมและอุตสาหกรรม (นานาชาติ)',
    'เทคโนโลยีดิจิทัลและนวัตกรรมเชิงบูรณาการ (หลักสูตรนานาชาติ)',
  ],
  คณะอุตสาหกรรมอาหาร: [
    'วิทยาศาสตร์และเทคโนโลยีการอาหาร',
    'เทคโนโลยีการหมักในอุตสาหกรรมอาหาร',
    'วิศวกรรมแปรรูปอาหาร',
    'วิทยาศาสตร์การประกอบอาหารและการจัดการการบริการอาหาร (นานาชาติ)',
  ],
  คณะเทคโนโลยีสารสนเทศ: [
    'เทคโนโลยีสารสนเทศ',
    'วิทยาการข้อมูลและการวิเคราะห์เชิงธุรกิจ',
    'เทคโนโลยีสารสนเทศทางธุรกิจ (นานาชาติ)',
    'เทคโนโลยีปัญญาประดิษฐ์',
  ],
  คณะเทคโนโลยีนวัตกรรมบูรณาการ: [
    'วิศวกรรมวัสดุนาโน',
    'เทคโนโลยีวัสดุชาญฉลาด (นานาชาติ)',
  ],
  วิทยาลัยนวัตกรรมการผลิตขั้นสูง: [
    'วิศวกรรมระบบการผลิต',
    'วิศวกรรมระบบการผลิต (ต่อเนื่อง)',
  ],
  คณะบริหารธุรกิจ: [
    'บริหารธุรกิจบัณฑิต',
    'เศรษฐศาสตร์ธุรกิจและการจัดการ',
    'บริหารธุรกิจบัณฑิต (นานาชาติ)',
    'การเป็นผู้ประกอบการระดับโลก (นานาชาติ)',
    'การเปลี่ยนแปลงทางดิจิทัลและการจัดการเทคโนโลยี',
  ],
  วิทยาลัยอุตสาหกรรมการบินนานาชาติ: [
    'วิศวกรรมการบินและนักบินพาณิชย์ (นานาชาติ)',
    'การจัดการโลจิสติกส์ (นานาชาติ)',
    'วิศวกรรมการบินและอวกาศ (นานาชาติ)',
  ],
  คณะศิลปศาสตร์: [
    'ภาษาอังกฤษ',
    'ภาษาญี่ปุ่นธุรกิจ',
    'ภาษาจีนเพื่ออุตสาหกรรม',
    'นวัตกรรมการท่องเที่ยวและการบริการ',
    'การจัดการบริการการบิน',
  ],
  คณะแพทยศาสตร์: ['แพทยศาสตรบัณฑิต (หลักสูตรนานาชาติ)'],
  วิทยาลัยวิศวกรรมสังคีต: ['วิศวกรรมดนตรีและสื่อประสม', 'เทคโนโลยีและศิลปะสร้างสรรค์'],
  คณะทันตแพทยศาสตร์: ['ทันตแพทยศาสตรบัณฑิต (หลักสูตรนานาชาติ)'],
  วิทยาเขตชุมพรเขตรอุดมศักดิ์: [
    'วิศวกรรมเครื่องกล',
    'วิศวกรรมอิเล็กทรอนิกส์',
    'วิศวกรรมสารสนเทศ',
    'วิศวกรรมคอมพิวเตอร์',
    'วิศวกรรมพลังงาน',
    'สัตวศาสตร์',
    'วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ',
    'เทคโนโลยีชีวภาพเกษตรและอาหาร',
    'นวัตกรรมอาหารและการจัดการ',
    'เทคโนโลยีการจัดการผลิตพืช',
    'บริหารธุรกิจ',
    'บริหารธุรกิจและการเป็นผู้ประกอบการ',
    'วิศวกรรมไฟฟ้า',
    'เทคโนโลยีการผลิตพืชด้วยศาสตร์พระราชา (หลักสูตรต่อเนื่อง)',
    'วิศวกรรมโยธา',
    'วิศวกรรมหุ่นยนต์และอิเล็กทรอนิกส์อัจฉริยะ',
    'วิศวกรรมอุตสาหการและการผลิต',
  ],
  สถาบันโคเซ็นแห่งสถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง: [
    'วิศวกรรมนวัตกรรมขั้นสูง (ต่อเนื่อง)',
    'อนุปริญญา วิศวกรรมไฟฟ้าและอิเล็กทรอนิกส์',
    'อนุปริญญา วิศวกรรมคอมพิวเตอร์',
    'อนุปริญญา วิศวกรรมแมคคาทรอนิกส์',
  ],
  คณะพยาบาลศาสตร์: ['พยาบาลศาสตรบัณฑิต'],
};

/** Seed/admin accounts that are not in the student catalog. */
const EXTRA_ALLOWED = {
  Administration: ['Administration', 'Platform'],
};

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// English / short labels → canonical Thai faculty
const FACULTY_ALIASES = {
  engineering: 'คณะวิศวกรรมศาสตร์',
  'faculty of engineering': 'คณะวิศวกรรมศาสตร์',
  science: 'คณะวิทยาศาสตร์',
  'faculty of science': 'คณะวิทยาศาสตร์',
  architecture: 'คณะสถาปัตยกรรม ศิลปะและการออกแบบ',
  'architecture art and design': 'คณะสถาปัตยกรรม ศิลปะและการออกแบบ',
  'faculty of architecture': 'คณะสถาปัตยกรรม ศิลปะและการออกแบบ',
  'information technology': 'คณะเทคโนโลยีสารสนเทศ',
  it: 'คณะเทคโนโลยีสารสนเทศ',
  'business administration': 'คณะบริหารธุรกิจ',
  business: 'คณะบริหารธุรกิจ',
  'agricultural technology': 'คณะเทคโนโลยีการเกษตร',
  agriculture: 'คณะเทคโนโลยีการเกษตร',
  'food industry': 'คณะอุตสาหกรรมอาหาร',
  'industrial education': 'คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี',
  'liberal arts': 'คณะศิลปศาสตร์',
  medicine: 'คณะแพทยศาสตร์',
  dentistry: 'คณะทันตแพทยศาสตร์',
  nursing: 'คณะพยาบาลศาสตร์',
  chumphon: 'วิทยาเขตชุมพรเขตรอุดมศักดิ์',
};

// Broad EN program names → Thai major (validated against the resolved faculty)
const MAJOR_ALIASES = {
  'computer engineering': 'วิศวกรรมคอมพิวเตอร์',
  'computer engineering and cyber security': 'วิศวกรรมคอมพิวเตอร์และความปลอดภัยไซเบอร์',
  'computer engineering and cybersecurity': 'วิศวกรรมคอมพิวเตอร์และความปลอดภัยไซเบอร์',
  'software engineering': 'วิศวกรรมซอฟต์แวร์ (นานาชาติ)',
  'electrical engineering': 'วิศวกรรมไฟฟ้า',
  'mechanical engineering': 'วิศวกรรมเครื่องกล',
  'civil engineering': 'วิศวกรรมโยธา',
  'chemical engineering': 'วิศวกรรมเคมี',
  'industrial engineering': 'วิศวกรรมอุตสาหการ',
  'electronics engineering': 'วิศวกรรมอิเล็กทรอนิกส์',
  'telecommunications engineering': 'วิศวกรรมโทรคมนาคม',
  'information engineering': 'วิศวกรรมสารสนเทศ',
  'computer science': 'วิทยาการคอมพิวเตอร์',
  'information technology': 'เทคโนโลยีสารสนเทศ',
  'food science and technology': 'วิทยาศาสตร์และเทคโนโลยีการอาหาร',
  physics: 'ฟิสิกส์ประยุกต์',
  'applied physics': 'ฟิสิกส์ประยุกต์',
  'industrial physics': 'ฟิสิกส์อุตสาหกรรม',
  chemistry: 'เคมีอุตสาหกรรม',
  'industrial chemistry': 'เคมีอุตสาหกรรม',
  mathematics: 'คณิตศาสตร์ประยุกต์',
  'applied mathematics': 'คณิตศาสตร์ประยุกต์',
  ee: 'วิศวกรรมไฟฟ้า',
  'e.e.': 'วิศวกรรมไฟฟ้า',
  'film and digital media': 'ภาพยนตร์และดิจิทัล มีเดีย',
  architecture: 'สถาปัตยกรรมหลัก (5 ปี)',
  nursing: 'พยาบาลศาสตรบัณฑิต',
};

const FACULTY_BY_KEY = new Map();
Object.keys(MAJORS_BY_FACULTY).forEach((faculty) => {
  FACULTY_BY_KEY.set(normalizeKey(faculty), faculty);
});
Object.keys(EXTRA_ALLOWED).forEach((faculty) => {
  FACULTY_BY_KEY.set(normalizeKey(faculty), faculty);
});

function resolveFaculty(faculty) {
  const key = normalizeKey(faculty);
  if (!key) return null;
  if (FACULTY_BY_KEY.has(key)) return FACULTY_BY_KEY.get(key);
  if (FACULTY_ALIASES[key]) return FACULTY_ALIASES[key];
  return null;
}

function majorsForFaculty(faculty) {
  if (MAJORS_BY_FACULTY[faculty]) return MAJORS_BY_FACULTY[faculty];
  if (EXTRA_ALLOWED[faculty]) return EXTRA_ALLOWED[faculty];
  return [];
}

function resolveMajor(faculty, major) {
  const majors = majorsForFaculty(faculty);
  const key = normalizeKey(major);
  if (!key) return null;

  const exact = majors.find((m) => normalizeKey(m) === key);
  if (exact) return exact;

  const aliased = MAJOR_ALIASES[key];
  if (aliased) {
    const inFaculty = majors.find((m) => normalizeKey(m) === normalizeKey(aliased));
    if (inFaculty) return inFaculty;
  }

  return null;
}

/**
 * Map faculty/major to canonical Thai catalog values.
 * @param {string} faculty
 * @param {string} major
 * @param {{ soft?: boolean }} [options] soft=true returns { ok:false } instead of throwing shape
 * @returns {{ ok: true, faculty: string, major: string } | { ok: false, reason: string, faculty: string, major: string }}
 */
function normalizeFacultyMajor(faculty, major, options = {}) {
  const soft = Boolean(options.soft);
  const inputFaculty = String(faculty || '').trim();
  const inputMajor = String(major || '').trim();

  const resolvedFaculty = resolveFaculty(inputFaculty);
  if (!resolvedFaculty) {
    const result = {
      ok: false,
      reason: `Unknown faculty: ${inputFaculty}`,
      faculty: inputFaculty,
      major: inputMajor,
    };
    if (soft) return result;
    const err = new Error(result.reason);
    err.code = 'INVALID_FACULTY_MAJOR';
    err.details = result;
    throw err;
  }

  const resolvedMajor = resolveMajor(resolvedFaculty, inputMajor);
  if (!resolvedMajor) {
    const result = {
      ok: false,
      reason: `Unknown major "${inputMajor}" for faculty "${resolvedFaculty}"`,
      faculty: inputFaculty,
      major: inputMajor,
    };
    if (soft) return result;
    const err = new Error(result.reason);
    err.code = 'INVALID_FACULTY_MAJOR';
    err.details = result;
    throw err;
  }

  return { ok: true, faculty: resolvedFaculty, major: resolvedMajor };
}

module.exports = {
  MAJORS_BY_FACULTY,
  FACULTY_ALIASES,
  MAJOR_ALIASES,
  normalizeFacultyMajor,
  resolveFaculty,
  majorsForFaculty,
};
