const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class AuthService {
  static signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  static async registerUser(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // always set VIEWER on signup so no one can register themselves as admin
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'VIEWER',
    });

    const token = this.signToken(newUser._id);
    return { user: newUser, token };
  }

  static async loginUser(email, password) {
    if (!email || !password) {
      throw new AppError('Please provide email and password!', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('This user account is inactive.', 403);
    }

    const token = this.signToken(user._id);
    user.password = undefined;

    return { user, token };
  }
}

module.exports = AuthService;
