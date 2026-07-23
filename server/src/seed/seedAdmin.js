/* eslint-disable no-console */
// Usage: npm run seed:admin
// Creates (or updates) an admin account from ADMIN_* env vars.
// Auth is KMITL SSO only — no password is stored.
const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');
const { generateAlias } = require('../services/aliasService');

async function seedAdmin() {
  const { studentId, email, faculty, major, year } = env.admin;

  if (!studentId || !email) {
    console.error(
      '[seedAdmin] Missing ADMIN_STUDENT_ID / ADMIN_EMAIL in .env — aborting.'
    );
    process.exitCode = 1;
    return;
  }

  await connectDB();

  const normalizedEmail = email.toLowerCase();

  const admin = await User.findOneAndUpdate(
    { studentId },
    {
      $set: {
        studentId,
        email: normalizedEmail,
        faculty,
        major,
        year,
        role: 'admin',
        kmitlVerified: true,
        verificationMethod: 'sso',
      },
      $unset: { passwordHash: 1 },
      $setOnInsert: { alias: generateAlias() },
    },
    { upsert: true, new: true }
  );

  // Drop legacy password hashes from any remaining users.
  const stripped = await User.updateMany(
    { passwordHash: { $exists: true } },
    { $unset: { passwordHash: 1 } }
  );

  console.log('[seedAdmin] Admin user ready:');
  console.log(`  studentId: ${admin.studentId}`);
  console.log(`  email:     ${admin.email}`);
  console.log(`  role:      ${admin.role}`);
  console.log('  auth:      KMITL SSO only (no password)');
  if (stripped.modifiedCount > 0) {
    console.log(`  stripped passwordHash from ${stripped.modifiedCount} user(s)`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('[seedAdmin] Failed:', err);
  process.exitCode = 1;
});
