const express = require("express");
const Todo = require("../models/todo");
const User = require("../models/user");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateTodo, validateTodoUpdate } = require("../utils/validation");

const router = express.Router();

// Get current user's todos
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, type, priority } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    const todos = await Todo.getUserTodos(req.user._id, filters);
    
    // Mark assigned todos as viewed
    const unviewedAssigned = todos.filter(todo => todo.type === 'assigned' && !todo.isViewed);
    if (unviewedAssigned.length > 0) {
      await Promise.all(unviewedAssigned.map(todo => todo.markAsViewed()));
    }

    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's todo statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [
      totalTodos,
      todoCount,
      doingCount,
      doneCount,
      overdueTodos,
      assignedTodos,
      personalTodos,
      urgentTodos
    ] = await Promise.all([
      Todo.countDocuments({ assignedTo: userId }),
      Todo.countDocuments({ assignedTo: userId, status: 'todo' }),
      Todo.countDocuments({ assignedTo: userId, status: 'doing' }),
      Todo.countDocuments({ assignedTo: userId, status: 'done' }),
      Todo.countDocuments({ 
        assignedTo: userId, 
        deadline: { $lt: new Date() }, 
        status: { $ne: 'done' } 
      }),
      Todo.countDocuments({ assignedTo: userId, type: 'assigned' }),
      Todo.countDocuments({ assignedTo: userId, type: 'personal' }),
      Todo.countDocuments({ assignedTo: userId, priority: 'urgent', status: { $ne: 'done' } })
    ]);

    res.json({
      total: totalTodos,
      todo: todoCount,
      doing: doingCount,
      done: doneCount,
      overdue: overdueTodos,
      assigned: assignedTodos,
      personal: personalTodos,
      urgent: urgentTodos
    });
  } catch (error) {
    console.error("Error fetching todo stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new personal todo
router.post("/", authenticateToken, async (req, res) => {
  try {
    const validation = validateTodo(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    const todoData = {
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      priority: req.body.priority || 'medium',
      createdBy: req.user._id,
      assignedTo: req.user._id,
      type: 'personal'
    };

    const todo = new Todo(todoData);
    await todo.save();
    
    const populatedTodo = await Todo.findById(todo._id)
      .populate('createdBy', 'firstName lastName username role');

    res.status(201).json({
      message: "Todo created successfully",
      todo: populatedTodo
    });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update todo status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['todo', 'doing', 'done'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      assignedTo: req.user._id 
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await todo.updateStatus(status);
    
    const updatedTodo = await Todo.findById(todo._id)
      .populate('createdBy', 'firstName lastName username role');

    res.json({
      message: "Todo status updated successfully",
      todo: updatedTodo
    });
  } catch (error) {
    console.error("Error updating todo status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update todo (only personal todos can be fully updated by user)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const validation = validateTodoUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      assignedTo: req.user._id,
      type: 'personal' // Only personal todos can be fully updated
    });

    if (!todo) {
      return res.status(404).json({ message: "Personal todo not found" });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      priority: req.body.priority
    };

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName username role');

    res.json({
      message: "Todo updated successfully",
      todo: updatedTodo
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete todo (only personal todos)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      assignedTo: req.user._id,
      type: 'personal'
    });

    if (!todo) {
      return res.status(404).json({ message: "Personal todo not found" });
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// === ADMIN ROUTES ===
router.use("/admin", authenticateToken, authorizeRoles("admin"));

// Get all todos (admin view)
router.get("/admin", async (req, res) => {
  try {
    const { assignedTo, status, type, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (assignedTo) filters.assignedTo = assignedTo;
    if (status) filters.status = status;
    if (type) filters.type = type;

    const todos = await Todo.getAdminTodos(filters)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Todo.countDocuments(filters);

    res.json({
      todos,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching admin todos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin assign todo to student
router.post("/admin/assign", async (req, res) => {
  try {
    const validation = validateTodo(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    const { studentId } = req.body;
    
    // Verify student exists
    const student = await User.findOne({ 
      $or: [{ _id: studentId }, { studentId: studentId }],
      role: 'student',
      isActive: true
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const todoData = {
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      priority: req.body.priority || 'medium',
      createdBy: req.user._id,
      assignedTo: student._id,
      type: 'assigned',
      isRequired: req.body.isRequired || false,
      adminNotes: req.body.adminNotes
    };

    const todo = new Todo(todoData);
    await todo.save();
    
    const populatedTodo = await Todo.findById(todo._id)
      .populate('createdBy', 'firstName lastName username role')
      .populate('assignedTo', 'firstName lastName username studentId');

    res.status(201).json({
      message: "Todo assigned successfully",
      todo: populatedTodo
    });
  } catch (error) {
    console.error("Error assigning todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin get todo statistics
router.get("/admin/stats", async (req, res) => {
  try {
    const [
      totalTodos,
      assignedTodos,
      personalTodos,
      completedTodos,
      overdueTodos,
      urgentTodos,
      unviewedAssigned
    ] = await Promise.all([
      Todo.countDocuments({}),
      Todo.countDocuments({ type: 'assigned' }),
      Todo.countDocuments({ type: 'personal' }),
      Todo.countDocuments({ status: 'done' }),
      Todo.countDocuments({ 
        deadline: { $lt: new Date() }, 
        status: { $ne: 'done' } 
      }),
      Todo.countDocuments({ priority: 'urgent', status: { $ne: 'done' } }),
      Todo.countDocuments({ type: 'assigned', isViewed: false })
    ]);

    res.json({
      total: totalTodos,
      assigned: assignedTodos,
      personal: personalTodos,
      completed: completedTodos,
      overdue: overdueTodos,
      urgent: urgentTodos,
      unviewedAssigned
    });
  } catch (error) {
    console.error("Error fetching admin todo stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin update assigned todo
router.put("/admin/:id", async (req, res) => {
  try {
    const todo = await Todo.findOne({ 
      _id: req.params.id,
      type: 'assigned'
    });

    if (!todo) {
      return res.status(404).json({ message: "Assigned todo not found" });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      priority: req.body.priority,
      isRequired: req.body.isRequired,
      adminNotes: req.body.adminNotes
    };

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName username role')
     .populate('assignedTo', 'firstName lastName username studentId');

    res.json({
      message: "Assigned todo updated successfully",
      todo: updatedTodo
    });
  } catch (error) {
    console.error("Error updating assigned todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin delete todo
router.delete("/admin/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;