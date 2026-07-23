const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const PLACEHOLDER_SECRETS = new Set([
  'change-me-access-secret',
  'change-me-refresh-secret',
  'changeme',
  'secret',
]);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mood-of-the-major',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  kmitl: {
    apiKey: process.env.KMITL_API_KEY || '',
    apiBaseUrl: process.env.KMITL_API_BASE_URL || 'https://api.kmitl.ac.th/v1',
  },
  oidc: {
    issuer: process.env.KMITL_OIDC_ISSUER || 'https://sso.kmitl.ac.th/realms/kmitl',
    clientId: process.env.KMITL_OIDC_CLIENT_ID || '',
    clientSecret: process.env.KMITL_OIDC_CLIENT_SECRET || '',
    redirectUri:
      process.env.KMITL_OIDC_REDIRECT_URI || 'http://localhost:4000/api/auth/kmitl/callback',
  },
  admin: {
    studentId: process.env.ADMIN_STUDENT_ID,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    faculty: process.env.ADMIN_FACULTY || 'Administration',
    major: process.env.ADMIN_MAJOR || 'Administration',
    year: parseInt(process.env.ADMIN_YEAR, 10) || 4,
  },
};

function isWeakSecret(value) {
  if (!value || typeof value !== 'string') return true;
  if (value.length < 16) return true;
  return PLACEHOLDER_SECRETS.has(value);
}

function assertRequiredEnv() {
  const missing = required.filter((key) => !process.env[key]);
  const weakJwt =
    isWeakSecret(process.env.JWT_ACCESS_SECRET) || isWeakSecret(process.env.JWT_REFRESH_SECRET);

  if (env.nodeEnv === 'production') {
    if (missing.length > 0) {
      throw new Error(
        `[env] Missing required environment variables in production: ${missing.join(', ')}`
      );
    }
    if (weakJwt) {
      throw new Error(
        '[env] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be strong (16+ chars, not placeholders) in production'
      );
    }
    return;
  }

  if ((missing.length > 0 || weakJwt) && env.nodeEnv !== 'test') {
    // eslint-disable-next-line no-console
    console.warn(
      `[env] Missing or weak environment variables: ${[...missing, weakJwt ? 'JWT_*' : ''].filter(Boolean).join(', ')}. ` +
        'Using insecure development defaults — set these in .env for production.'
    );
  }
}

assertRequiredEnv();

module.exports = env;
