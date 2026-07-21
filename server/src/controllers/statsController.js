const Mood = require('../models/Mood');
const asyncHandler = require('../utils/asyncHandler');
const { MOOD_COLORS, MOOD_TYPES } = require('../config/constants');

/**
 * GET /api/stats — protected
 * Returns overall mood distribution, per-faculty and per-major breakdowns,
 * and the current "dominant campus mood" for the visualization/UI tint.
 */
const getStats = asyncHandler(async (_req, res) => {
  const [overall, byFaculty, byMajor, total] = await Promise.all([
    Mood.aggregate([{ $group: { _id: '$moodType', count: { $sum: 1 } } }]),
    Mood.aggregate([
      { $group: { _id: { faculty: '$authorFaculty', moodType: '$moodType' }, count: { $sum: 1 } } },
    ]),
    Mood.aggregate([
      { $group: { _id: { major: '$authorMajor', moodType: '$moodType' }, count: { $sum: 1 } } },
    ]),
    Mood.countDocuments(),
  ]);

  const distribution = MOOD_TYPES.reduce((acc, type) => {
    acc[type] = { count: 0, color: MOOD_COLORS[type] };
    return acc;
  }, {});
  overall.forEach((row) => {
    if (distribution[row._id]) {
      distribution[row._id].count = row.count;
    }
  });

  // Stable dominant: highest count; on a tie, prefer earlier mood in MOOD_TYPES
  // (e.g. happy before stressed) so the UI doesn't flip between refreshes.
  let dominantMood = null;
  for (const type of MOOD_TYPES) {
    const entry = distribution[type];
    if (!dominantMood || entry.count > dominantMood.count) {
      dominantMood = { moodType: type, color: entry.color, count: entry.count };
    }
  }
  if (dominantMood && dominantMood.count === 0) {
    dominantMood = null;
  }

  const groupByKey = (rows, keyName) => {
    const grouped = {};
    rows.forEach((row) => {
      const key = row._id[keyName];
      if (!grouped[key]) grouped[key] = {};
      grouped[key][row._id.moodType] = row.count;
    });
    return grouped;
  };

  res.json({
    success: true,
    data: {
      total,
      distribution,
      dominantMood: dominantMood,
      byFaculty: groupByKey(byFaculty, 'faculty'),
      byMajor: groupByKey(byMajor, 'major'),
    },
  });
});

module.exports = { getStats };
