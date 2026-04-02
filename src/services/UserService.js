const User = require('../models/User');
const AuditService = require('./AuditService');
const AppError = require('../utils/AppError');

class UserService {
  static async getAllUsers(filter = {}) {
    return await User.find(filter).select('-__v');
  }

  static async updateUserRole(userId, newRole, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    // Audit the action
    await AuditService.log('UPDATE', 'User_Role', user._id, adminId, { oldRole, newRole });

    return user;
  }

  static async updateUserStatus(userId, newStatus, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const oldStatus = user.status;
    user.status = newStatus;
    await user.save();

    await AuditService.log('UPDATE', 'User_Status', user._id, adminId, { oldStatus, newStatus });

    return user;
  }
}

module.exports = UserService;
