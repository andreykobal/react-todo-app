import { DataTypes } from 'sequelize';
import db from './index.js';

const User = db.sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  magicToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  magicTokenCreatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default User; 