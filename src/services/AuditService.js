const AuditLog = require('../models/AuditLog');

class AuditService {
  // saves a record of who did what — we don't throw if this fails
  // because we don't want audit issues to break the main request
  static async log(action, entity, entityId, performedBy, details = {}) {
    try {
      await AuditLog.create({
        action,
        entity,
        entityId,
        performedBy,
        details,
      });
    } catch (error) {
      console.error('Audit log failed:', error);
    }
  }
}

module.exports = AuditService;
