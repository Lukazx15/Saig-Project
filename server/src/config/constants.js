// Mood types supported by the platform, each mapped to a post-it note color.
const MOOD_COLORS = {
  happy: '#FFE066',
  calm: '#A8DADC',
  tired: '#CDB4DB',
  stressed: '#F4A261',
  sad: '#90CAF9',
  excited: '#FF9F1C',
  angry: '#E63946',
};

const MOOD_EMOJIS = {
  happy: '😊',
  calm: '🌿',
  tired: '😴',
  stressed: '😰',
  sad: '😔',
  excited: '✨',
  angry: '😤',
};

const MOOD_TYPES = Object.keys(MOOD_COLORS);

const ROLES = ['student', 'admin'];

module.exports = {
  MOOD_COLORS,
  MOOD_EMOJIS,
  MOOD_TYPES,
  ROLES,
};
