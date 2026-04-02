const AuditLog = require('../models/AuditLog');

class AuditService {
  /**
   * Log an action in the system
   * @param {string} action - CREATE | UPDATE | DELETE
   * @param {string} entity - Name of the entity (e.g. Transaction)
   * @param {string} entityId - The MongoDB ObjectId of the entity
   * @param {string} performedBy - The MongoDB ObjectId of the user who performed the action
   * @param {object} details - Optional details (like before/after state diffs)
   */
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
      console.error('Failed to write audit log:', error);
      // We purposefully don't throw the error so that an audit log failure doesn't
      // crash the main business transaction, but it is logged to standard error.
    }
  }
}

module.exports = AuditService;
