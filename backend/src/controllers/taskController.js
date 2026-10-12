import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private / Admin
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and cannot be empty',
      });
    }

    // Validate assignedTo if provided
    let validAssignee = null;
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignee user ID format',
        });
      }
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'Assignee user not found',
        });
      }
      validAssignee = assignedTo;
    }

    // Prepare task data
    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null,
      assignedTo: validAssignee,
      createdBy: req.user._id,
    };

    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks permitted for current user
 * @route   GET /api/tasks
 * @access  Private (Admin sees all, User sees assigned)
 */
export const getTasks = async (req, res, next) => {
  try {
    let query = {};

    // Role-based visibility enforcement
    if (req.user.role !== 'ADMIN') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private (Admin: all, User: only assigned)
 */
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Role check: User can only view task if assigned to them
    if (
      req.user.role !== 'ADMIN' &&
      (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are only permitted to view your assigned tasks.',
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task (full update)
 * @route   PUT /api/tasks/:id
 * @access  Private / Admin only
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be empty',
      });
    }

    let task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Build update payload
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;
    if (assignedTo !== undefined) {
      if (assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid assignee user ID format',
          });
        }
        const userExists = await User.findById(assignedTo);
        if (!userExists) {
          return res.status(400).json({
            success: false,
            message: 'Assignee user not found',
          });
        }
        updateData.assignedTo = assignedTo;
      } else {
        updateData.assignedTo = null;
      }
    }

    task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status only
 * @route   PATCH /api/tasks/:id/status
 * @access  Private (Admin or assigned User)
 */
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Authorization: Admin can update any task; User can only update if assigned to them
    if (
      req.user.role !== 'ADMIN' &&
      (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update the status of tasks assigned to you.',
      });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private / Admin only
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
