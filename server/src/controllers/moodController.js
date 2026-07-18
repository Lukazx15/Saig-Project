const Mood = require('../models/Mood');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/moods
 * Creates a mood post. The author is stored internally for ownership
 * checks, but the response (and every future read) only ever exposes the
 * anonymous alias + faculty/major/year snapshot — never name/studentId.
 */
const createMood = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');

  const { moodType, message } = req.body;

  const mood = await Mood.create({
    author: user._id,
    moodType,
    message,
    authorAlias: user.alias,
    authorFaculty: user.faculty,
    authorMajor: user.major,
    authorYear: user.year,
  });

  res.status(201).json({ success: true, data: { mood: mood.toPublicJSON(req.user) } });
});

/**
 * GET /api/moods
 * Public feed with filters + pagination.
 */
const listMoods = asyncHandler(async (req, res) => {
  const { moodType, faculty, major, dateFrom, dateTo } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const filter = {};
  if (moodType) filter.moodType = moodType;
  if (faculty) filter.authorFaculty = faculty;
  if (major) filter.authorMajor = major;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    Mood.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Mood.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      moods: items.map((m) => m.toPublicJSON(req.user)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    },
  });
});

/**
 * GET /api/moods/:id
 */
const getMood = asyncHandler(async (req, res) => {
  const mood = await Mood.findById(req.params.id);
  if (!mood) throw ApiError.notFound('Mood not found');
  res.json({ success: true, data: { mood: mood.toPublicJSON(req.user) } });
});

/**
 * PATCH /api/moods/:id — owner only
 */
const updateMood = asyncHandler(async (req, res) => {
  const mood = await Mood.findById(req.params.id);
  if (!mood) throw ApiError.notFound('Mood not found');

  if (mood.author.toString() !== req.user.id) {
    throw ApiError.forbidden('Only the author can edit this mood');
  }

  const { moodType, message } = req.body;
  if (moodType !== undefined) mood.moodType = moodType;
  if (message !== undefined) mood.message = message;

  await mood.save();
  res.json({ success: true, data: { mood: mood.toPublicJSON(req.user) } });
});

/**
 * DELETE /api/moods/:id — owner or admin
 */
const deleteMood = asyncHandler(async (req, res) => {
  const mood = await Mood.findById(req.params.id);
  if (!mood) throw ApiError.notFound('Mood not found');

  const isOwner = mood.author.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Only the author or an admin can delete this mood');
  }

  await mood.deleteOne();
  res.json({ success: true, data: null, message: 'Mood deleted' });
});

module.exports = { createMood, listMoods, getMood, updateMood, deleteMood };
