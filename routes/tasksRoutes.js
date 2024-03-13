const express = require("express");
const router = express.Router();

const { createNewTask, getAllTasks } = require("../controllers/tasksController");

router.route("/").get(getAllTasks).post(createNewTask);

module.exports = router;
