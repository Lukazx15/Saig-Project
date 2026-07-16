const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');

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
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
