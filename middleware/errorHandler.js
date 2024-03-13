const { logEvent } = require("./logger");

const errorHandler = (err, req, res, next) => {
  console.log(err.stack);

  logEvent(err.message, "error.log");
  res.status(500).json({ message: "Server Error" });
};

module.exports = errorHandler;
