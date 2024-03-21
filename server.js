require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");

const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3000;

const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");
connectDB();

app.use(cookieParser());
app.use(express.json());

app.use(require("./middleware/credentials"));

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));

const { authToken } = require("./middleware/auth");

// DELAY RESPONSE MIDDLEWARE - TESTING ONLY, DON'T DEPLOY
// app.use((req, res, next) => setTimeout(next, 2000));

app.use("/tasks", authToken, require("./routes/tasksRoutes"));
app.use("/user", require("./routes/userRoutes"));

/// Handle 404 Error ///
app.all("*", (req, res) => {
  res.status(404);

  if (req.accepts("html")) return res.sendFile(path.join(__dirname, "views", "404.html"));
  if (req.accepts("json")) return res.json({ message: "404 Resource Not Found" });

  res.type("txt");
  res.send("404 Resource Not Found");
});

/// Custom error handler ///

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

/// Once database connected is open, start the Express server
mongoose.connection.once("open", () => {
  console.log("Connected to Mongo");

  app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
  });
});
