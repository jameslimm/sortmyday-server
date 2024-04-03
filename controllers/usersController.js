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

    res.json({ user });
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

    // Basic validation - TODO - Add Zod for more robust validation.
    const errors = {};
    if (!username) errors.username = "Username required.";
    if (!password) errors.password = "Password required.";

    if (username.length > 14 || username.length < 4)
      errors.username = "Username must be between 4 and 14 characters.";
    if (password.length > 14 || password.length < 4)
      errors.password = "Password must be between 4 and 14 characters.";

    if (!new RegExp("^[a-zA-Z]+$").test(username)) errors.username = "Invalid username characters.";

    if (await User.findOne({ username }).lean().exec()) errors.username = "Duplicate user account.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Unable to create user account.", errors });
    }

    // All OK!
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
  try {
    const { username, password } = req.body;

    const errors = {};
    if (!username) errors.username = "Username required.";
    if (!password) errors.password = "Password required.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Unable to log in", errors });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // get the user account
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid user credentials", errors: { username: "Username unknown." } });
    }

    // check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        message: "Invalid user credentials",
        errors: { password: "Password incorrect." },
      });
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

// @desc Update user accoutn
// @route PUT /user
// @access Private

const updateUser = async (req, res, next) => {
  try {
    const { password, prefs } = req.body;
    const user = await User.findOne({ _id: req.userId }).select("-password").exec();

    // if a new password has been passed, hash it and save
    if (password) {
      // todo - validate passed password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (prefs) {
      user.prefs = prefs;
    }

    await user.save();

    res.json({ message: "user updated" });
  } catch (err) {
    next(err);
  }
};
// @desc Logout user
// @route /user/logout
// @access Private

const logoutUser = async (req, res, next) => {
  try {
    // overwrite the cookie
    res.clearCookie("authToken", { httpOnly: true });
    res.status(200).json({ message: "User logged out" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createNewUser, loginUser, logoutUser, getUser, updateUser };
