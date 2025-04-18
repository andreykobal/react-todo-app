import { Sequelize } from 'sequelize';
import express from 'express';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import db from '../models/index.js';
import { User, Todo, TodoCompletion } from '../models/associations.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status', error: error.message });
  }
};

// Get all todos, available to everyone
router.get('/', async (req, res) => {
  try {
    // Get all todos regardless of login status
    const todos = await Todo.findAll({
      include: [{
        model: User,
        as: 'completedBy',
        attributes: ['id', 'email'],
        through: { attributes: [] }
      }]
    });
    
    // For each todo, count the number of users who completed it
    const todosWithCompletionCount = todos.map(todo => {
      const plainTodo = todo.get({ plain: true });
      // Count users who completed this todo
      plainTodo.completionCount = plainTodo.completedBy ? plainTodo.completedBy.length : 0;
      return plainTodo;
    });
    
    res.json(todosWithCompletionCount);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos', error: error.message });
  }
});

// Get a single todo by ID
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    const userId = req.headers['user-id'];
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    // Check permissions - users can only access their todos or public todos
    if (userId) {
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Admin can access any todo, users can only access their todos or public todos
      if (!user.isAdmin && todo.userId && todo.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (todo.userId) {
      // Non-logged in users can only access public todos
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todo', error: error.message });
  }
});

// Create a new todo - admin only
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, status } = req.body;
    const userId = req.headers['user-id'];
    const io = req.app.get('io');
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const newTodo = await Todo.create({
      id: uuid(),
      title,
      status: status || 'incomplete',
      time: format(new Date(), 'p, MM/dd/yyyy'),
      userId: null // Public todo
    });
    
    // Format the response with the same structure as updateTodoStatus
    const responseData = {
      ...newTodo.get({ plain: true }),
      completionCount: 0,
      completedBy: []
    };
    
    // Emit WebSocket event for real-time updates
    if (io) {
      io.emit('todo-created', responseData);
    }
    
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo', error: error.message });
  }
});

// Update a todo completion status - allowed for any user
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.headers['user-id'];
    const todo = await Todo.findByPk(req.params.id);
    const io = req.app.get('io');
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    // Authentication required for task completion
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If marking as complete
    if (status === 'complete') {
      // Check if the user has already completed this todo
      const existingCompletion = await TodoCompletion.findOne({
        where: { userId, todoId: todo.id }
      });
      
      if (!existingCompletion) {
        // Create a new completion record
        await TodoCompletion.create({
          id: uuid(),
          userId,
          todoId: todo.id
        });
      }
    } else {
      // If marking as incomplete, remove the completion record
      await TodoCompletion.destroy({
        where: { userId, todoId: todo.id }
      });
    }
    
    // Get updated completion count
    const completionCount = await TodoCompletion.count({
      where: { todoId: todo.id }
    });
    
    // Get all users who completed this todo
    const completedBy = await User.findAll({
      attributes: ['id', 'email'],
      include: [{
        model: Todo,
        as: 'completedTodos',
        where: { id: todo.id },
        through: { attributes: [] }
      }]
    });
    
    // Get a fresh copy of the todo to ensure we have the latest data
    const refreshedTodo = await Todo.findByPk(todo.id);
    
    // Check if this specific user has completed the todo
    const userCompleted = await TodoCompletion.findOne({
      where: { userId, todoId: todo.id }
    });
    
    const responseData = {
      ...refreshedTodo.get({ plain: true }),
      status: userCompleted ? 'complete' : 'incomplete',
      completionCount,
      completedBy
    };
    
    // Emit WebSocket event for real-time updates
    if (io) {
      io.emit('todo-updated', responseData);
    }
    
    // Return the updated todo with completion status for this user
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo status', error: error.message });
  }
});

// Update a todo - admin only
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { title, status } = req.body;
    const todo = await Todo.findByPk(req.params.id);
    const io = req.app.get('io');
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    await todo.update({
      title: title || todo.title,
      status: status || todo.status
    });
    
    // Get the updated todo with completion data
    const updatedTodo = await Todo.findByPk(todo.id, {
      include: [{
        model: User,
        as: 'completedBy',
        attributes: ['id', 'email'],
        through: { attributes: [] }
      }]
    });
    
    const plainTodo = updatedTodo.get({ plain: true });
    const responseData = {
      ...plainTodo,
      completionCount: plainTodo.completedBy ? plainTodo.completedBy.length : 0
    };
    
    // Emit WebSocket event for real-time updates
    if (io) {
      io.emit('todo-updated', responseData);
    }
    
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo', error: error.message });
  }
});

// Delete a todo - admin only
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    const io = req.app.get('io');
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    const todoId = todo.id;
    
    await todo.destroy();
    
    // Emit WebSocket event for real-time updates
    if (io) {
      io.emit('todo-deleted', todoId);
    }
    
    res.json({ message: 'Todo deleted successfully', id: todoId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo', error: error.message });
  }
});

export default router; 