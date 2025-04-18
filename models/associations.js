import User from './user.js';
import Todo from './todo.js';
import TodoCompletion from './todoCompletion.js';
import db from './index.js';

// Define associations
User.hasMany(Todo, { foreignKey: 'userId' });
Todo.belongsTo(User, { foreignKey: 'userId' });

// Many-to-many relationship between users and todos for completions
User.belongsToMany(Todo, { 
  through: TodoCompletion,
  foreignKey: 'userId',
  as: 'completedTodos'
});

Todo.belongsToMany(User, { 
  through: TodoCompletion, 
  foreignKey: 'todoId',
  as: 'completedBy'
});

// Add models to db object
db.User = User;
db.Todo = Todo;
db.TodoCompletion = TodoCompletion;

export { User, Todo, TodoCompletion }; 