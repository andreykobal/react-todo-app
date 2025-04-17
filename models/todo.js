import { DataTypes } from 'sequelize';
import db from './index.js';

const Todo = db.sequelize.define('Todo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('complete', 'incomplete'),
    defaultValue: 'incomplete',
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Todo; 