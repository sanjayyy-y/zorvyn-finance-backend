const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true,
    },
    entity: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    details: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ entity: 1, action: 1 });
auditLogSchema.index({ performedBy: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
