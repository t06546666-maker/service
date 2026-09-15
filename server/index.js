import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from our React app
app.use(express.json()); // Allow API to parse JSON data in the body

// Your MongoDB Connection String
const uri = "mongodb+srv://rmohammedsafar_db_user:EElxtAyRCbp8ZifN@cluster0.rbbih5h.mongodb.net/StitchAppDB?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- API ROUTES ---

// 1. Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// 2. Create a new user (POST)
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validate data
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Save to database
    const newUser = new User({ name, email });
    await newUser.save();
    
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user (Email might already exist)' });
  }
});

// 3. Get all users (GET)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // Get users sorted by newest
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
