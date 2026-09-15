import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String,
    required: true,
    unique: true // Ensures no two users have the same email
  },
  role: { 
    type: String, 
    default: "Customer" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Export the User model
const User = mongoose.model('User', userSchema);
export default User;
