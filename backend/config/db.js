const mongoose = require("mongoose");

// Recommended: strict query parsing and optional debug
mongoose.set("strictQuery", true);
if (process.env.MONGOOSE_DEBUG === "true") {
  mongoose.set("debug", true);
}

// One-time connection event logging
let eventsWired = false;
function wireConnectionEvents() {
  if (eventsWired) return;
  eventsWired = true;
  const conn = mongoose.connection;
  conn.on("connected", () => console.log("MongoDB connected"));
  conn.on("error", (err) => console.error("MongoDB connection error:", err));
  conn.on("disconnected", () => console.warn("MongoDB disconnected"));
  conn.on("reconnected", () => console.log("MongoDB reconnected"));
  conn.on("close", () => console.log("MongoDB connection closed"));
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in environment variables");
  }

  wireConnectionEvents();

  const maxRetries = parseInt(process.env.DB_CONNECT_RETRIES || "5", 10);
  const baseBackoff = parseInt(process.env.DB_CONNECT_BACKOFF_MS || "2000", 10);

  const options = {
    // Pool and timeouts
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || "10", 10),
    serverSelectionTimeoutMS: parseInt(
      process.env.DB_SERVER_SELECTION_TIMEOUT_MS || "10000",
      10
    ),
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS || "45000", 10),
    // Common flags
    retryWrites: true,
    w: "majority",
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, options);
      console.log("Connected to the database!");
      return; // resolved
    } catch (err) {
      console.error(
        `Error connecting to the database (attempt ${attempt}/${maxRetries}):`,
        err.message || err
      );
      if (attempt === maxRetries) {
        throw err; // bubble up to caller
      }
      const backoff = baseBackoff * Math.pow(2, attempt - 1);
      await new Promise((res) => setTimeout(res, Math.min(backoff, 15000)));
    }
  }
};

module.exports = connectDB;
