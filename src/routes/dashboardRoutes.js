const express = require('express');
const dashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Only Analyst and Admin should be able to view these aggregate analytics
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('ANALYST', 'ADMIN'));

router.get('/summary', dashboardController.getSummary);
router.get('/trends', dashboardController.getTrends);

module.exports = router;
