const express = require("express");
const Todo = require("../models/todo");
const User = require("../models/user");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateTodo, validateTodoUpdate } = require("../utils/validation");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Todo management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [todo, doing, done]
 *         type:
 *           type: string
 *           enum: [personal, assigned]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         deadline:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *         assignedTo:
 *           type: string
 *         isViewed:
 *           type: boolean
 *         isRequired:
 *           type: boolean
 *         adminNotes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - title
 *         - assignedTo
 */

// Get current user's todos
/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get current user's todos
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, type, priority } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    const todos = await Todo.getUserTodos(req.user._id, filters);
    
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
/**
 * @swagger
 * /api/todos/stats:
 *   get:
 *     summary: Get user's todo statistics
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todo statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 todo:
 *                   type: integer
 *                 doing:
 *                   type: integer
 *                 done:
 *                   type: integer
 *                 overdue:
 *                   type: integer
 *                 assigned:
 *                   type: integer
 *                 personal:
 *                   type: integer
 *                 urgent:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new personal todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/todos/{id}/status:
 *   patch:
 *     summary: Update todo status
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, doing, done]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Todo status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a personal todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Todo updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Personal todo not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const validation = validateTodoUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    const todo = await Todo.findOne({ 
      _id: req.params.id, 
      assignedTo: req.user._id,
      type: 'personal'
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
/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a personal todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Personal todo not found
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/todos/admin:
 *   get:
 *     summary: Get all todos (admin only)
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/todos/admin/assign:
 *   post:
 *     summary: Assign todo to student (admin only)
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student ID or database ID
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               isRequired:
 *                 type: boolean
 *               adminNotes:
 *                 type: string
 *             required:
 *               - studentId
 *               - title
 *     responses:
 *       201:
 *         description: Todo assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.post("/admin/assign", async (req, res) => {
  try {
    const validation = validateTodo(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    const { studentId } = req.body;
    
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
/**
 * @swagger
 * /api/todos/admin/stats:
 *   get:
 *     summary: Get admin todo statistics
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 assigned:
 *                   type: integer
 *                 personal:
 *                   type: integer
 *                 completed:
 *                   type: integer
 *                 overdue:
 *                   type: integer
 *                 urgent:
 *                   type: integer
 *                 unviewedAssigned:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/todos/admin/{id}:
 *   put:
 *     summary: Update assigned todo (admin only)
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               isRequired:
 *                 type: boolean
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Todo updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 todo:
 *                   $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Assigned todo not found
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /api/todos/admin/{id}:
 *   delete:
 *     summary: Delete any todo (admin only)
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
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