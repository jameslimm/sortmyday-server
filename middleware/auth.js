const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authToken = async (req, res, next) => {
  try {
    const { authToken } = req.cookies;

    if (!authToken) {
      return res.sendStatus(403);
    }

    // user found?  Check that the token is valid.
    jwt.verify(authToken, process.env.JWT_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      req.userId = decoded.userId;
      next();
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { authToken };
