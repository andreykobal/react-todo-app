import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './models/index.js';
import { User, Todo } from './models/associations.js';
import todoRoutes from './routes/todos.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// Initialize database connection
const initDb = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Force sync to create tables if they don't exist
    await db.sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        const [adminUser, created] = await User.findOrCreate({
          where: { email: adminEmail },
          defaults: { 
            isAdmin: true 
          }
        });
        
        if (created) {
          console.log(`Admin user created: ${adminEmail}`);
        } else if (!adminUser.isAdmin) {
          // Ensure the user has admin privileges
          await adminUser.update({ isAdmin: true });
          console.log(`Admin privileges granted to: ${adminEmail}`);
        }
      } catch (userError) {
        console.error('Error creating admin user:', userError);
      }
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit the process on database connection failure
  }
};

// Start server
app.listen(PORT, async () => {
  await initDb();
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
}); 