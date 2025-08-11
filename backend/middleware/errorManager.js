const errorManager = (err, req, res, next) => {
  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Map common error types to appropriate status codes without changing message shape
  if (err.name === "ValidationError") {
    statusCode = 400;
  } else if (err.name === "MongoError" && err.code === 11000) {
    statusCode = 409; // duplicate key
  } else if (err.name === "CastError") {
    statusCode = 400; // invalid ObjectId, etc.
  }

  res.status(statusCode).json({
    message: err.message || "An error occurred",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorManager;
