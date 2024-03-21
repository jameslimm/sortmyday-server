const express = require("express");
const router = express.Router();
const { authToken } = require("../middleware/auth");

const {
  createNewUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
} = require("../controllers/usersController");

router.post("/", createNewUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/", authToken, getUser);
router.put("/", authToken, updateUser);

module.exports = router;
