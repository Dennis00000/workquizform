const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { message: 'Access denied', status: 403 }
      });
    }
    next();
  };
};

module.exports = checkRole; 