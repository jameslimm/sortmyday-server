const express = require("express");
const router = express.Router();

const {
  createNewTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTask,
} = require("../controllers/tasksController");

router.route("/").get(getAllTasks).post(createNewTask).delete(deleteTask);
router.route("/:taskId").get(getTask).put(updateTask);

module.exports = router;
