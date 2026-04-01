export const verifyInternalRequest = (req, res, next) => {
  const token = req.headers?.authorization;

  if (!token || token !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};