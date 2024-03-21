const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  prefs: {
    type: Object,
    default: {},
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
