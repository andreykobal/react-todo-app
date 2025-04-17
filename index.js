import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Anything that doesn't match the above, send back index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// For any other route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
}); 