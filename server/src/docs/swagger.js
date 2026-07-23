const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const env = require('../config/env');
const { MOOD_TYPES } = require('../config/constants');

const moodTypeEnum = [...MOOD_TYPES];

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Mood of the Major API',
      version: '1.0.0',
      description: [
        'Anonymous mood-sharing corkboard API for KMITL students.',
        '',
        '## How to try endpoints here',
        '1. Open the client at `' + env.clientUrl + '` and sign in with **KMITL SSO**.',
        '2. From browser DevTools → Application → Cookies (`localhost:4000`), copy `refreshToken`.',
        '3. Call **POST /api/auth/refresh** (Authorize is not enough — send cookie `refreshToken` + header `Origin: ' +
          env.clientUrl +
          '`).',
        '4. Copy `data.accessToken` from the response.',
        '5. Click **Authorize**, paste the access token (Bearer), then try protected routes.',
        '',
        'Access tokens expire in ~15 minutes — refresh again when you get 401.',
        'Routes under `/api/auth` that set/clear cookies also require a same-origin `Origin` header in non-browser clients.',
      ].join('\n'),
    },
    servers: [{ url: `http://localhost:${env.port}`, description: 'Local server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token from register or POST /api/auth/refresh',
        },
      },
      parameters: {
        OriginHeader: {
          in: 'header',
          name: 'Origin',
          required: true,
          schema: { type: 'string', example: env.clientUrl },
          description: 'Required by requireSameOrigin (e.g. register, refresh, logout)',
        },
        MoodId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
          description: 'MongoDB ObjectId of the mood note',
        },
        MoodTypeQuery: {
          in: 'query',
          name: 'moodType',
          schema: { type: 'string', enum: moodTypeEnum },
        },
        FacultyQuery: {
          in: 'query',
          name: 'faculty',
          schema: { type: 'string', example: 'Engineering' },
        },
        MajorQuery: {
          in: 'query',
          name: 'major',
          schema: { type: 'string', example: 'Computer Engineering' },
        },
        DateFromQuery: {
          in: 'query',
          name: 'dateFrom',
          schema: { type: 'string', format: 'date', example: '2026-01-01' },
          description: 'ISO8601 date (inclusive start, Bangkok calendar day)',
        },
        DateToQuery: {
          in: 'query',
          name: 'dateTo',
          schema: { type: 'string', format: 'date', example: '2026-12-31' },
          description: 'ISO8601 date (inclusive end, Bangkok calendar day)',
        },
        PageQuery: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        LimitQuery: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            details: {},
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            studentId: { type: 'string', example: '65010001' },
            email: { type: 'string', example: '65010001@kmitl.ac.th' },
            faculty: { type: 'string', example: 'Engineering' },
            major: { type: 'string', example: 'Computer Engineering' },
            year: { type: 'integer', example: 2 },
            role: { type: 'string', enum: ['student', 'admin'] },
            alias: { type: 'string', example: 'Quiet Fox' },
            kmitlVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AccessTokenResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['studentId', 'email', 'faculty', 'major', 'year'],
          properties: {
            studentId: {
              type: 'string',
              pattern: '^\\d{8}$',
              example: '65010001',
              description: 'Exactly 8 digits',
            },
            email: {
              type: 'string',
              example: '65010001@kmitl.ac.th',
              description: 'Must be <studentId>@kmitl.ac.th',
            },
            faculty: { type: 'string', example: 'Engineering' },
            major: { type: 'string', example: 'Computer Engineering' },
            year: { type: 'integer', minimum: 1, maximum: 8, example: 2 },
          },
        },
        MoodType: {
          type: 'string',
          enum: moodTypeEnum,
        },
        MoodNote: {
          type: 'object',
          description: 'Public mood shape — never includes studentId, name, or email',
          properties: {
            id: { type: 'string' },
            moodType: { $ref: '#/components/schemas/MoodType' },
            message: { type: 'string', maxLength: 280 },
            color: { type: 'string', example: '#A8DADC' },
            alias: { type: 'string' },
            faculty: { type: 'string' },
            major: { type: 'string' },
            year: { type: 'integer' },
            rotation: { type: 'number', description: 'UI tilt derived from id' },
            isOwner: { type: 'boolean' },
            canEdit: { type: 'boolean' },
            canDelete: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateMoodRequest: {
          type: 'object',
          required: ['moodType', 'message'],
          properties: {
            moodType: { $ref: '#/components/schemas/MoodType' },
            message: { type: 'string', minLength: 1, maxLength: 280, example: 'Finished the lab.' },
          },
        },
        UpdateMoodRequest: {
          type: 'object',
          properties: {
            moodType: { $ref: '#/components/schemas/MoodType' },
            message: { type: 'string', minLength: 1, maxLength: 280 },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
        MoodListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                moods: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MoodNote' },
                },
                pagination: { $ref: '#/components/schemas/Pagination' },
              },
            },
          },
        },
        MoodResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                mood: { $ref: '#/components/schemas/MoodNote' },
              },
            },
          },
        },
        StatsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                distribution: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      count: { type: 'integer' },
                      color: { type: 'string' },
                    },
                  },
                },
                dominantMood: {
                  nullable: true,
                  type: 'object',
                  properties: {
                    moodType: { $ref: '#/components/schemas/MoodType' },
                    color: { type: 'string' },
                    count: { type: 'integer' },
                  },
                },
                byFaculty: { type: 'object', additionalProperties: { type: 'object' } },
                byMajor: { type: 'object', additionalProperties: { type: 'object' } },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Service health check' },
      {
        name: 'Auth',
        description:
          'KMITL SSO + JWT sessions. No password login. Cookie routes need Origin header.',
      },
      { name: 'Moods', description: 'Anonymous mood note CRUD (Bearer required)' },
      { name: 'Stats', description: 'Aggregated mood statistics (Bearer required)' },
      { name: 'Admin', description: 'Admin-only moderation (Bearer + role admin)' },
    ],
  },
  // swagger-jsdoc resolves `apis` via glob matching, which treats `\` as an
  // escape character — on Windows, path.join's backslashes break the glob
  // and silently produce an empty `paths` object. Normalize to `/`.
  apis: [path.join(__dirname, '../routes/*.js').split(path.sep).join('/')],
};

module.exports = swaggerJsdoc(options);
