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
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // Default to VIEWER, explicitly ignore roles in request body to prevent privilege escalation
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'VIEWER', // Force VIEWER initially
    });

    const token = this.signToken(newUser._id);
    return { user: newUser, token };
  }

  static async loginUser(email, password) {
    // 1) Check if email and password exist (Already checked by Zod, but safe to do here)
    if (!email || !password) {
      throw new AppError('Please provide email and password!', 400);
    }

    // 2) Check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    // 3) Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new AppError('This user account is inactive.', 403);
    }

    // 4) If everything ok, send token to client
    const token = this.signToken(user._id);

    // Remove password from output
    user.password = undefined;

    return { user, token };
  }
}

module.exports = AuthService;
