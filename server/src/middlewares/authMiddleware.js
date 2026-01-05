import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// 1. PROTECT: Verifies the user is logged in
export const protect = async (req, res, next) => {
  let token;

  // Check if header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header ("Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the ID in the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the next function (the controller)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. AUTHORIZE: Verifies the user has a specific role (e.g., 'admin')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};