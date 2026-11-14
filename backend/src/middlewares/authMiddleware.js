import jwt from 'jsonwebtoken';
import { User, memoryUsers } from '../models/User.js';
import { getDbStatus } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'quizmaster_super_secret_jwt_key_2026_xyz123'
      );

      const dbStatus = getDbStatus();
      if (dbStatus.connected) {
        try {
          const user = await User.findById(decoded.id).select('-password');
          if (user) {
            req.user = user;
            return next();
          }
        } catch (dbErr) {
          console.warn('DB lookup failed in auth middleware:', dbErr.message);
        }
      }

      // Memory lookup
      const user = memoryUsers.find((u) => String(u._id) === String(decoded.id));
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User session not found or invalid token',
        });
      }

      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token verification failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user?.role || 'guest'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'quizmaster_super_secret_jwt_key_2026_xyz123'
      );

      const dbStatus = getDbStatus();
      if (dbStatus.connected) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      }

      const user = memoryUsers.find((u) => String(u._id) === String(decoded.id));
      if (user) {
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      }
    } catch {
      // Ignore token failure in optionalAuth
    }
  }
  next();
};
