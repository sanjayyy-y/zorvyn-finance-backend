const { z } = require('zod');

const updateRole = z.object({
  body: z.object({
    role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE']),
  }),
});

module.exports = {
  updateRole,
  updateStatus,
};
