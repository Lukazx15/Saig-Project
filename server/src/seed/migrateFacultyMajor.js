/* eslint-disable no-console */
// Usage: npm run migrate:faculty
// Remaps users.faculty/major and moods.authorFaculty/authorMajor onto the
// canonical Thai catalog (English aliases → Thai).
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Mood = require('../models/Mood');
const { normalizeFacultyMajor } = require('../config/kmitlCatalog');

async function migrateUsers() {
  const users = await User.find({}).select('studentId faculty major');
  let updated = 0;
  const unmapped = [];

  for (const user of users) {
    const result = normalizeFacultyMajor(user.faculty, user.major, { soft: true });
    if (!result.ok) {
      unmapped.push({
        kind: 'user',
        id: user._id.toString(),
        studentId: user.studentId,
        faculty: user.faculty,
        major: user.major,
        reason: result.reason,
      });
      continue;
    }
    if (result.faculty === user.faculty && result.major === user.major) continue;

    user.faculty = result.faculty;
    user.major = result.major;
    await user.save();
    updated += 1;
    console.log(
      `[migrate] user ${user.studentId}: → ${result.faculty} / ${result.major}`
    );
  }

  return { total: users.length, updated, unmapped };
}

async function migrateMoods() {
  const moods = await Mood.find({}).select('authorFaculty authorMajor');
  let updated = 0;
  const unmapped = [];

  for (const mood of moods) {
    const result = normalizeFacultyMajor(mood.authorFaculty, mood.authorMajor, {
      soft: true,
    });
    if (!result.ok) {
      unmapped.push({
        kind: 'mood',
        id: mood._id.toString(),
        faculty: mood.authorFaculty,
        major: mood.authorMajor,
        reason: result.reason,
      });
      continue;
    }
    if (
      result.faculty === mood.authorFaculty &&
      result.major === mood.authorMajor
    ) {
      continue;
    }

    mood.authorFaculty = result.faculty;
    mood.authorMajor = result.major;
    await mood.save();
    updated += 1;
  }

  return { total: moods.length, updated, unmapped };
}

async function main() {
  await connectDB();

  console.log('[migrate:faculty] Starting faculty/major normalization…');
  const users = await migrateUsers();
  const moods = await migrateMoods();

  console.log('[migrate:faculty] Done.');
  console.log(`  users: ${users.updated}/${users.total} updated`);
  console.log(`  moods: ${moods.updated}/${moods.total} updated`);

  const unmapped = [...users.unmapped, ...moods.unmapped];
  if (unmapped.length > 0) {
    console.warn(`[migrate:faculty] ${unmapped.length} row(s) could not be mapped:`);
    unmapped.forEach((row) => {
      console.warn(
        `  - ${row.kind} ${row.id}${row.studentId ? ` (${row.studentId})` : ''}: ` +
          `${row.faculty} / ${row.major} — ${row.reason}`
      );
    });
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[migrate:faculty] Failed:', err);
  process.exitCode = 1;
});
