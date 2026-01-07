import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';
import AuditLog from '../models/AuditLog.model.js';

// @desc    Register a new user (Citizen only)
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Force role to citizen for public registration
    const user = await User.create({
      name,
      email,
      password,
      role: 'citizen',
      trustScore: 100,
      isActive: true
    });

    if (user) {
      // Log the event
      await AuditLog.create({
        action: 'USER_REGISTER',
        targetId: user._id,
        targetModel: 'User',
        details: 'New citizen registration',
        ipAddress: req.ip
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      
      // 1. CHECK BAN STATUS
      if (!user.isActive) {
        await AuditLog.create({
          action: 'LOGIN_BLOCKED',
          actor: user._id,
          details: 'User tried to login but is banned due to low trust score',
          ipAddress: req.ip
        });
        return res.status(403).json({ message: 'Account suspended due to low Trust Score. Contact Admin.' });
      }

      // 2. Update Last Login
      user.lastLogin = Date.now();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore, // Frontend can show this now
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};