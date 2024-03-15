const Task = require("../models/Task");

// @define Get all tasks (TODO: for logged in user)
// @route GET /tasks
// @access Private
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user_id: req.userId }).lean().exec();
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

    const duplicate = await Task.find({ title, user_id: req.userId }).lean().exec();
    if (duplicate?.length) {
      return res.status(406).json({ message: "Duplicate task found." });
    }

    const taskObj = {
      user_id: req.userId,
      title,
    };

    const task = await Task.create(taskObj);
    res.status(201).json({ message: "New Task Created" });
  } catch (err) {
    next(err);
  }
};

// @desc Update task
// @path PUT /tasks
// @access Private

const updateTask = async (req, res, next) => {
  try {
    const { _id, title, completed } = req.body;

    if (!_id || !title || typeof completed !== "boolean") {
      return res.status(400).json({ message: "All fields required" });
    }

    // check for duplicate title
    const duplicate = await Task.find({ title, _id: { $ne: _id }, user_id: req.userId })
      .lean()
      .exec();

    console.log(duplicate);
    if (duplicate?.length) {
      return res.status(406).json({ message: "Duplicate task found." });
    }

    // find the task to be updated
    const task = await Task.findById(_id).exec();
    console.log(task);
    if (!task) {
      return res.status(400).json({ message: "Task not found" });
    }

    task.title = title;
    task.completed = completed;

    await task.save();
    res.status(200).json({ message: "Task updated" });
  } catch (err) {
    next(err);
  }
};

// @desc Delete a task
// @route DELETE /tasks
// @access Private

const deleteTask = async (req, res, next) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "Task not found" });
    }

    await Task.deleteOne({ _id, user_id: req.userId });

    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createNewTask, getAllTasks, updateTask, deleteTask };
