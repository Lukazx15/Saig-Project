// Keep in sync with client/src/lib/moods.ts MOOD_META[].color
const MOOD_COLORS = {
  happy: '#FFD600',
  calm: '#A8DADC',
  tired: '#CDB4DB',
  stressed: '#980000',
  sad: '#90CAF9',
  excited: '#FF9F1C',
  angry: '#E63946',
  sleepy: '#00A1FE',
  hungry: '#F5F198',
  cold: '#5CC6FF',
  hot: '#FFB75E',
  sick: '#562672',
};

const MOOD_TYPES = Object.keys(MOOD_COLORS);

const ROLES = ['student', 'admin'];

module.exports = {
  MOOD_COLORS,
  MOOD_TYPES,
  ROLES,
};
