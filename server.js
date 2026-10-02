const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'notices.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readNotices() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

function saveNotices(notices) {
  fs.writeFileSync(DB_FILE, JSON.stringify(notices, null, 2));
}

// Login API
app.post('/api/login', (req, res) => {
  const { role, username, password } = req.body;
  if (role === 'admin' && username === 'admin' && password === 'admin123') {
    return res.json({ success: true, role: 'admin' });
  } 
  if (role === 'student' && username === 'student' && password === 'student123') {
    return res.json({ success: true, role: 'student' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Username or Password!' });
});

// Get notices API
app.get('/api/notices', (req, res) => {
  res.json(readNotices());
});

// Add notice API
app.post('/api/notices', (req, res) => {
  const { title, category, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Fill all fields' });

  const notices = readNotices();
  const newNotice = {
    id: Date.now().toString(),
    title,
    category: category || 'General',
    message,
    date: new Date().toLocaleString()
  };
  notices.unshift(newNotice);
  saveNotices(notices);
  res.status(201).json({ success: true, notice: newNotice });
});

// Delete notice API
app.delete('/api/notices/:id', (req, res) => {
  let notices = readNotices();
  notices = notices.filter(n => n.id !== req.params.id);
  saveNotices(notices);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});