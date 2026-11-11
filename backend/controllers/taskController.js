
const Task = require('../models/Task')

// Create task
const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// Get logged-in user's tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get one task belonging to logged-in user
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({ success: true, data: task })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    )

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
}
