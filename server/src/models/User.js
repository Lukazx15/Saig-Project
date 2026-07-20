const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');
const { normalizeFacultyMajor } = require('../config/kmitlCatalog');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{8}$/,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    faculty: {
      type: String,
      required: true,
      trim: true,
    },
    major: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'student',
    },
    alias: {
      type: String,
      required: true,
    },
    kmitlVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ['api', 'format', 'sso', 'none'],
      default: 'none',
    },
    // Set after KMITL SSO for existing accounts so the client can require an
    // explicit faculty/major confirmation before the board (SSO claims alone
    // do not include a trustworthy major).
    pendingMajorSelection: {
      type: Boolean,
      default: false,
    },
    // Refresh token rotation: only the hash of the *current* valid refresh
    // token is stored. Any mismatch on refresh triggers a full revoke,
    // which protects against stolen/replayed refresh tokens.
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    refreshTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.needsProfileCompletion = function needsProfileCompletion() {
  if (this.role === 'admin') return false;
  if (this.pendingMajorSelection) return true;
  const remapped = normalizeFacultyMajor(this.faculty, this.major, { soft: true });
  return !remapped.ok;
};

userSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    id: this._id,
    studentId: this.studentId,
    email: this.email,
    faculty: this.faculty,
    major: this.major,
    year: this.year,
    role: this.role,
    alias: this.alias,
    kmitlVerified: this.kmitlVerified,
    needsProfileCompletion: this.needsProfileCompletion(),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
