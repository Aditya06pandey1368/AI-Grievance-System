// AUTHORIZE: Verifies the user has a specific role (e.g., 'admin', 'officer')
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure user is logged in first (protect middleware should run before this)
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};