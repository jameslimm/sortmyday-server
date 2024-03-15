const express = require("express");
const router = express.Router();
const { authToken } = require("../middleware/auth");

const { createNewUser, loginUser, logoutUser, getUser } = require("../controllers/usersController");

router.post("/", createNewUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/", authToken, getUser);

module.exports = router;
