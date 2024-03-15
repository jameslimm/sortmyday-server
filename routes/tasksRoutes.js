const express = require("express");
const router = express.Router();

const {
  createNewTask,
  getAllTasks,
  updateTask,
  deleteTask,
} = require("../controllers/tasksController");

router.route("/").get(getAllTasks).post(createNewTask).put(updateTask).delete(deleteTask);

module.exports = router;
