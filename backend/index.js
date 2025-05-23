const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const errorManager = require("./middleware/errorManager");
const fixedUsers = require("./middleware/fixedUsers");
const auth = require("./routes/auth");
const admin = require("./routes/admin");

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

connectDB()
  .then(() => {
    fixedUsers();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", auth);
app.use("/admin", admin);
app.use(errorManager);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`);
});
