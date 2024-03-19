const Task = require("../models/Task");

// @define Get single task
// @route GET /tasks/:taskId
// @access Private

const getTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!taskId) return res.status(400).json({ message: "missing id" });

    const task = await Task.findOne({ _id: taskId, user_id: req.userId }).lean().exec();

    if (!task) return res.status(400).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// @define Get all tasks
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
    const { title, tag } = req.body;

    console.log("NEW TASK", { title, tag });

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
      tag,
    };

    const task = await Task.create(taskObj);
    res.status(201).json({ message: "New Task Created" });
  } catch (err) {
    next(err);
  }
};

// @desc Update task
// @path PUT /tasks/:taskId
// @access Private

const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, tag, completed } = req.body;

    console.log("UPDATE", { taskId, title, tag, completed });

    if (!taskId || !title || typeof completed !== "boolean") {
      return res.status(400).json({ message: "All fields required" });
    }

    // check for duplicate title
    const duplicate = await Task.find({ title, _id: { $ne: taskId }, user_id: req.userId })
      .lean()
      .exec();

    if (duplicate?.length) {
      return res.status(406).json({ message: "Duplicate task found." });
    }

    // find the task to be updated
    const task = await Task.findById(taskId).exec();
    if (!task) {
      return res.status(400).json({ message: "Task not found" });
    }

    task.title = title;
    task.completed = completed;
    task.tag = tag;

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

module.exports = { createNewTask, getAllTasks, updateTask, deleteTask, getTask };
