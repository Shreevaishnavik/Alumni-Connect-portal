module.exports = (req, res, next) => {
  const userId = req.user ? req.user.id : 'unauthenticated';
  const timestamp = new Date().toISOString();
  console.log(`[${req.method}] ${req.originalUrl} - ${userId} - ${timestamp}`);
  next();
};
