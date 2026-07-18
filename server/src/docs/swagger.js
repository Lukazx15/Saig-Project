const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const env = require('../config/env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Mood of the Major API',
      version: '1.0.0',
      description:
        'Anonymous mood-sharing corkboard API for KMITL students. JWT access tokens (Bearer) ' +
        'authenticate requests; refresh tokens rotate via an httpOnly cookie.',
    },
    servers: [{ url: `http://localhost:${env.port}`, description: 'Local server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registration, login, session management' },
      { name: 'Moods', description: 'Anonymous mood note CRUD' },
      { name: 'Stats', description: 'Aggregated mood statistics' },
      { name: 'Admin', description: 'Admin-only moderation endpoints' },
      { name: 'Health', description: 'Service health check' },
    ],
  },
  // swagger-jsdoc resolves `apis` via glob matching, which treats `\` as an
  // escape character — on Windows, path.join's backslashes break the glob
  // and silently produce an empty `paths` object. Normalize to `/`.
  apis: [path.join(__dirname, '../routes/*.js').split(path.sep).join('/')],
};

module.exports = swaggerJsdoc(options);
