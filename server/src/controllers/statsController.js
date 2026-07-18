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
    distribution[row._id].count = row.count;
  });

  const dominantMood = overall.reduce(
    (best, row) => (!best || row.count > best.count ? row : best),
    null
  );

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
      dominantMood: dominantMood
        ? { moodType: dominantMood._id, color: MOOD_COLORS[dominantMood._id], count: dominantMood.count }
        : null,
      byFaculty: groupByKey(byFaculty, 'faculty'),
      byMajor: groupByKey(byMajor, 'major'),
    },
  });
});

module.exports = { getStats };
