/* eslint-disable no-console */
// Usage: npm run seed:admin
// Creates (or updates) an admin account from ADMIN_* env vars in server/.env
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');
const { generateAlias } = require('../services/aliasService');

const BCRYPT_ROUNDS = 12;

async function seedAdmin() {
  const { studentId, email, password, faculty, major, year } = env.admin;

  if (!studentId || !email || !password) {
    console.error(
      '[seedAdmin] Missing ADMIN_STUDENT_ID / ADMIN_EMAIL / ADMIN_PASSWORD in server/.env — aborting.'
    );
    process.exitCode = 1;
    return;
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const normalizedEmail = email.toLowerCase();

  const admin = await User.findOneAndUpdate(
    { studentId },
    {
      $set: {
        studentId,
        email: normalizedEmail,
        passwordHash,
        faculty,
        major,
        year,
        role: 'admin',
        kmitlVerified: true,
        verificationMethod: 'format',
      },
      $setOnInsert: { alias: generateAlias() },
    },
    { upsert: true, new: true }
  );

  console.log('[seedAdmin] Admin user ready:');
  console.log(`  studentId: ${admin.studentId}`);
  console.log(`  email:     ${admin.email}`);
  console.log(`  role:      ${admin.role}`);
  console.log('  password:  (as set in server/.env ADMIN_PASSWORD)');

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('[seedAdmin] Failed:', err);
  process.exitCode = 1;
});
