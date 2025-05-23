const errorManager = (err, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "An error occurred",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorManager;
