export const requireRole = (role) => (req, res, next) => {
  const user = req.user;
  if (!user || user.role !== role) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};


