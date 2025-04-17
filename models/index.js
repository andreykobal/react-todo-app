import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/todo_app';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

const db = {
  sequelize,
  Sequelize,
};

export default db; 