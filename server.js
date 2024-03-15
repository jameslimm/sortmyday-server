require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");

const cors = require("cors");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3000;

const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");
connectDB();

app.use(cookieParser());
app.use(express.json());

// Enable cors - allow connections
// from any origin TODO - Change this later.

app.use(require("./middleware/credentials"));

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

const { authToken } = require("./middleware/auth");

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
