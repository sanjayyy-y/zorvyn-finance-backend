const UserService = require('../services/UserService');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await UserService.getAllUsers();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateRole = catchAsync(async (req, res, next) => {
  const user = await UserService.updateUserRole(req.params.id, req.body.role, req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  const user = await UserService.updateUserStatus(req.params.id, req.body.status, req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
