const mongoose = require('mongoose');
const { MOOD_TYPES, MOOD_COLORS } = require('../config/constants');

const { Schema } = mongoose;

// Deterministic slight rotation (-5deg..5deg) derived from the note's id, so
// the corkboard layout stays stable across re-fetches instead of jittering.
function rotationFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.round(((hash % 11) - 5) * 0.9 * 10) / 10;
}

const moodSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // Never populated/exposed in API responses — see toPublicJSON below.
    },
    moodType: {
      type: String,
      required: true,
      enum: MOOD_TYPES,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 280,
    },
    // Denormalized, anonymous snapshot of the author at post time. This
    // keeps history stable even if the user's profile changes later, and
    // guarantees the real identity (name/studentId) is never stored here.
    authorAlias: { type: String, required: true },
    authorFaculty: { type: String, required: true, index: true },
    authorMajor: { type: String, required: true, index: true },
    authorYear: { type: Number, required: true },
  },
  { timestamps: true }
);

moodSchema.index({ createdAt: -1 });
moodSchema.index({ moodType: 1, authorFaculty: 1, authorMajor: 1 });

// `viewer` is the optional { id, role } of the currently authenticated
// requester (may be absent on public/anonymous reads). Ownership is only
// ever derived server-side from the hidden `author` field — the raw
// author id/studentId is never included in the response.
moodSchema.methods.toPublicJSON = function toPublicJSON(viewer) {
  const isOwner = Boolean(viewer && viewer.id === this.author.toString());
  const isAdmin = Boolean(viewer && viewer.role === 'admin');

  return {
    id: this._id,
    moodType: this.moodType,
    message: this.message,
    color: MOOD_COLORS[this.moodType],
    alias: this.authorAlias,
    faculty: this.authorFaculty,
    major: this.authorMajor,
    year: this.authorYear,
    rotation: rotationFromId(this._id.toString()),
    isOwner,
    canEdit: isOwner,
    canDelete: isOwner || isAdmin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Mood', moodSchema);
