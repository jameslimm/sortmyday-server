const path = require("path");
const fsPromises = require("fs/promises");

const LOG_PATH = path.join(__dirname, "..", "logs");

const logEvent = async (logMessage, filename = "requests.log") => {
  const logFile = path.join(LOG_PATH, filename);
  const logLine = `${new Date().toISOString()}\t${logMessage}\n`;

  try {
    await fsPromises.appendFile(logFile, logLine);
  } catch (err) {
    console.log("Error saving log file.");
  }
};

module.exports = { logEvent };
