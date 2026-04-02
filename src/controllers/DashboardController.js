const DashboardService = require('../services/DashboardService');
const catchAsync = require('../utils/catchAsync');

exports.getSummary = catchAsync(async (req, res, next) => {
  const summary = await DashboardService.getSummary();
  res.status(200).json({
    status: 'success',
    data: summary,
  });
});

exports.getTrends = catchAsync(async (req, res, next) => {
  const trends = await DashboardService.getTrends();
  res.status(200).json({
    status: 'success',
    data: { trends },
  });
});
