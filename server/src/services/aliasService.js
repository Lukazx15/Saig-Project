const crypto = require('crypto');

const ADJECTIVES = [
  'Sleepy', 'Cheerful', 'Curious', 'Mellow', 'Bold', 'Quiet', 'Zesty', 'Chill',
  'Sunny', 'Foggy', 'Breezy', 'Cozy', 'Spry', 'Witty', 'Gentle', 'Plucky',
  'Dreamy', 'Nimble', 'Jolly', 'Rusty',
];

const ANIMALS = [
  'Capybara', 'Otter', 'Panda', 'Falcon', 'Koala', 'Hedgehog', 'Dolphin',
  'Fox', 'Owl', 'Penguin', 'Raccoon', 'Sloth', 'Tiger', 'Rabbit', 'Gecko',
  'Heron', 'Lynx', 'Badger', 'Swan', 'Wombat',
];

// Deterministic-but-unpredictable alias generator. Uses a random salt (not
// the studentId) so aliases cannot be reverse-engineered from student data,
// while still producing a stable, human-friendly identity for a user's
// anonymous posts.
function generateAlias() {
  const bytes = crypto.randomBytes(4);
  const adjective = ADJECTIVES[bytes[0] % ADJECTIVES.length];
  const animal = ANIMALS[bytes[1] % ANIMALS.length];
  const number = (bytes.readUInt16BE(2) % 9999) + 1;
  return `${adjective} ${animal} #${number}`;
}

module.exports = { generateAlias };
