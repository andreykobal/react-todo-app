import express from 'express';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import db from '../models/index.js';
import { User, Todo } from '../models/associations.js';

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
    const todos = await Todo.findAll();
    res.json(todos);
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
    
    res.status(201).json(newTodo);
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
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    // Authentication required for task completion
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // If marking as complete, we're assigning to this user
    if (status === 'complete') {
      // Update the todo - the user "claims" this todo
      await todo.update({
        status,
        userId // Assign to this user
      });
    } else {
      // If marking as incomplete and this user owns it, remove their ownership
      if (todo.userId === userId) {
        await todo.update({
          status,
          userId: null // Release ownership
        });
      } else {
        // If user doesn't own this todo, they can't change it
        return res.status(403).json({ message: 'You can only update your own tasks' });
      }
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo status', error: error.message });
  }
});

// Update a todo - admin only
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { title, status } = req.body;
    const todo = await Todo.findByPk(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    await todo.update({
      title: title || todo.title,
      status: status || todo.status
    });
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo', error: error.message });
  }
});

// Delete a todo - admin only
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    await todo.destroy();
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo', error: error.message });
  }
});

export default router; 