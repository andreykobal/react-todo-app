import { DataTypes } from 'sequelize';
import db from './index.js';

const TodoCompletion = db.sequelize.define('TodoCompletion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  todoId: {
    type: DataTypes.UUID,
    references: {
      model: 'Todos',
      key: 'id'
    }
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

export default TodoCompletion; 