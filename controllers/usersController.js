const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc Get information about logged in user
// @route GET /user
// @access PRIVATE

const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userId }).select("-password").lean().exec();

    if (!user) res.status(400).json({ message: "User not found", user: null });

    res.json({ user: user });
  } catch (err) {
    next(err);
  }
};

// @desc Create a new user
// @route POST /user
// @access PUBLIC

const createNewUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Missing username and/or password" });

    if (await User.findOne({ username }).lean().exec())
      return res.status(400).json({ message: "Duplicate username", errorFields: ["username"] });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userObject = { username, password: hashedPassword, authToken: "" };

    const user = await User.create(userObject);
    if (!user) return res.status(500).json({ message: "User account unable to be saved" });

    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: "10d",
    });

    const cookieExpiry = 10 * 24 * 60 * 60 * 1000; // 10 days
    res.cookie("authToken", authToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: cookieExpiry,
    });

    res
      .status(201)
      .json({ message: "User created", user: { userId: user._id, username: user.username } });
  } catch (err) {
    next(err);
  }
};

// @desc Login User
// @route POST /user/login
// @access Public

const loginUser = async (req, res, next) => {
  console.log("LOGIN");
  console.log("body", req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username and/or password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // get the user account
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(400).json({ message: "Invalid user credentials" });
    }

    // check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid user credentials" });
    }

    /// CREATE TOKEN AND COOKIE ///
    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: "10d",
    });

    const cookieExpiry = 10 * 24 * 60 * 60 * 1000; // 10 days
    res.cookie("authToken", authToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: cookieExpiry,
    });

    res.json({ message: "User Logged in", user: { userId: user._id, username: user.username } });
  } catch (err) {
    next(err);
  }
};

// @desc Logout user
// @route /user/logout
// @access Private

const logoutUser = async (req, res, next) => {
  console.log("LOGGING OUT");
  try {
    // overwrite the cookie
    res.clearCookie("authToken", { httpOnly: true });
    res.status(200).json({ message: "User logged out" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createNewUser, loginUser, logoutUser, getUser };
