const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock data
let posts = [
  {
    id: 1,
    user: { name: 'Juan Pérez', avatar: 'https://i.pravatar.cc/40?img=1' },
    content: 'Acabo de alquilar esta hermosa casa en el centro. ¡Recomiendo totalmente!',
    image: 'https://source.unsplash.com/500x300/?apartment',
    price: 800,
    location: 'Madrid',
    likes: 12,
    comments: 5,
    timestamp: 'hace 2h'
  },
  {
    id: 2,
    user: { name: 'María García', avatar: 'https://i.pravatar.cc/40?img=2' },
    content: 'Nueva oferta: Apartamento de 2 habitaciones cerca del metro.',
    image: 'https://source.unsplash.com/500x300/?house',
    price: 650,
    location: 'Barcelona',
    likes: 8,
    comments: 3,
    timestamp: 'hace 4h'
  },
  // Add more mock posts
];

let stories = [
  {
    id: 1,
    user: { name: 'Casa Madrid', avatar: 'https://source.unsplash.com/56x56/?apartment' },
    image: 'https://source.unsplash.com/500x300/?apartment',
    timestamp: 'hace 1h'
  },
  {
    id: 2,
    user: { name: 'Tour Virtual', avatar: 'https://source.unsplash.com/56x56/?house' },
    image: 'https://source.unsplash.com/500x300/?house',
    timestamp: 'hace 3h'
  },
  // Add more mock stories
];

// Routes
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const newPost = { id: posts.length + 1, ...req.body, likes: 0, comments: 0, timestamp: 'ahora' };
  posts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

app.get('/api/stories', (req, res) => {
  res.json(stories);
});

app.post('/api/stories', (req, res) => {
  const newStory = { id: stories.length + 1, ...req.body, timestamp: 'ahora' };
  stories.unshift(newStory);
  res.json({ success: true, story: newStory });
});

app.listen(PORT, () => {
  console.log(`RentHub backend running on http://localhost:${PORT}`);
});