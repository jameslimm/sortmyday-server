const Task = require("../models/Task");

// @define Get all tasks (TODO: for logged in user)
// @route GET /tasks
// @access Private
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().lean().exec();

    if (!tasks.length) {
      return res.status(400).json({ message: "No tasks found" });
    }

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// @define Create a new task
// @route POST /tasks
// @access Private

const createNewTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Missing data" });
    }

    const duplicate = await Task.find({ title }).lean().exec();
    if (duplicate?.length) {
      return res.status(406).json({ message: "Duplicate task found." });
    }

    const taskObj = {
      title,
    };

    const task = await Task.create(taskObj);
    res.status(201).json({ message: "New Task Created" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createNewTask, getAllTasks };
