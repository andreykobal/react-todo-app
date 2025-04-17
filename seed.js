import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import db from './models/index.js';
import Todo from './models/todo.js';

const seedDatabase = async () => {
  try {
    // Sync the database
    await db.sequelize.sync({ force: true });
    
    // Sample todos
    const todos = [
      {
        id: uuid(),
        title: 'Complete Project Documentation',
        status: 'incomplete',
        time: format(new Date(), 'p, MM/dd/yyyy'),
      },
      {
        id: uuid(),
        title: 'Prepare for the presentation',
        status: 'incomplete',
        time: format(new Date(), 'p, MM/dd/yyyy'),
      },
      {
        id: uuid(),
        title: 'Fix application bugs',
        status: 'complete',
        time: format(new Date(), 'p, MM/dd/yyyy'),
      },
    ];
    
    // Insert todos
    await Todo.bulkCreate(todos);
    
    console.log('Database seeded successfully');
    
    // Close the connection
    await db.sequelize.close();
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 