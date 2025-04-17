import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5433/todo_app', {
      dialect: 'postgres',
      logging: true,
    });

    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection(); 