const express = require('express'); 
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage
let tasks = [];
let nextId = 1;

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, data: task });
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  const task = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json({ success: true, data: task });
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  const { title, description, completed } = req.body;
  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title cannot be empty' });
  }
  tasks[index] = {
    ...tasks[index],
    title: title !== undefined ? title.trim() : tasks[index].title,
    description: description !== undefined ? description.trim() : tasks[index].description,
    completed: completed !== undefined ? completed : tasks[index].completed,
    updatedAt: new Date().toISOString()
  };
  res.json({ success: true, data: tasks[index] });
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.json({ success: true, message: 'Task deleted' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Reset (for tests)
app.post('/api/reset', (req, res) => {
  tasks = [];
  nextId = 1;
  res.json({ success: true, message: 'Reset done' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
