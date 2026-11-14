import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, memoryUsers } from '../models/User.js';
import { getDbStatus } from '../config/db.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'quizmaster_super_secret_jwt_key_2026_xyz123',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbStatus = getDbStatus();

    // Check unique email
    if (dbStatus.connected) {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'user',
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // Memory Store branch
    const memoryUserExists = memoryUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (memoryUserExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `mem_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryUsers.push(newUser);
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // Memory Store branch
    const memoryUser = memoryUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (!memoryUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, memoryUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(memoryUser._id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: memoryUser._id,
        name: memoryUser.name,
        email: memoryUser.email,
        role: memoryUser.role,
        createdAt: memoryUser.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

// @desc    Update user profile or password
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name.trim();

      if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        const emailInUse = await User.findOne({
          email: email.toLowerCase().trim(),
          _id: { $ne: userId },
        });
        if (emailInUse) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use by another account',
          });
        }
        user.email = email.toLowerCase().trim();
      }

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to set a new password',
          });
        }
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password does not match',
          });
        }
        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters',
          });
        }
        user.password = newPassword; // Will be hashed by userSchema pre-save hook
      }

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // Memory Store branch
    const memoryUser = memoryUsers.find((u) => String(u._id) === String(userId));
    if (!memoryUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) memoryUser.name = name.trim();

    if (email && email.toLowerCase() !== memoryUser.email.toLowerCase()) {
      const emailInUse = memoryUsers.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase().trim() &&
          String(u._id) !== String(userId)
      );
      if (emailInUse) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account',
        });
      }
      memoryUser.email = email.toLowerCase().trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, memoryUser.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters',
        });
      }
      const salt = await bcrypt.genSalt(10);
      memoryUser.password = await bcrypt.hash(newPassword, salt);
    }

    memoryUser.updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: memoryUser._id,
        name: memoryUser.name,
        email: memoryUser.email,
        role: memoryUser.role,
        createdAt: memoryUser.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};
