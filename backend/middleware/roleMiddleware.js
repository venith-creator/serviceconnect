export const authorizeRoles = (...roles) => {
  const allowedRoles = roles.flat();
  return (req, res, next) => {
    if (!req.roles || !req.roles.some((r) => allowedRoles.includes(r))) {
      return res
        .status(403)
        .json({ message: `User roles [${req.roles}] not authorized` });
    }
    next();
  };
};
