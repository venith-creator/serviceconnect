export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.roles || !req.roles.some((r) => roles.includes(r))) {
      return res
        .status(403)
        .json({ message: `User roles [${req.roles}] not authorized` });
    }
    next();
  };
};
