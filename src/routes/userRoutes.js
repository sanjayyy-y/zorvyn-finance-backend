const express = require('express');
const userController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const userValidation = require('../validations/user.validation');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);
// Restrict all routes to ADMIN
router.use(authMiddleware.restrictTo('ADMIN'));

router.get('/', userController.getAllUsers);
router.patch('/:id/role', validate(userValidation.updateRole), userController.updateRole);
router.patch('/:id/status', validate(userValidation.updateStatus), userController.updateStatus);

module.exports = router;
