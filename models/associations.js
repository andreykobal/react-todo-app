import User from './user.js';
import Todo from './todo.js';
import db from './index.js';

// Define associations
User.hasMany(Todo, { foreignKey: 'userId' });
Todo.belongsTo(User, { foreignKey: 'userId' });

// Add models to db object
db.User = User;
db.Todo = Todo;

export { User, Todo }; 