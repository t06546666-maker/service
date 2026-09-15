import mongoose from 'mongoose';

// Your connection string
const uri = "mongodb+srv://rmohammedsafar_db_user:EElxtAyRCbp8ZifN@cluster0.rbbih5h.mongodb.net/TestDB?retryWrites=true&w=majority&appName=Cluster0";

// Define a Schema (This tells MongoDB what a "User" should look like)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  role: { type: String, default: "Customer" },
  createdAt: { type: Date, default: Date.now }
});

// Create a Model from the Schema
const User = mongoose.model('User', userSchema);

// Main function to connect and test
async function run() {
  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // --- Let's do a basic Create operation ---
    
    // Create a new user in memory (randomizing the name slightly so you can run this multiple times)
    const randomNum = Math.floor(Math.random() * 1000);
    const newUser = new User({
      name: `Alice_${randomNum}`,
      email: `alice${randomNum}@example.com`
    });

    // Save it to the database
    await newUser.save();
    console.log("✅ New user saved to database:", newUser.name);

    // --- Let's do a basic Read operation ---
    
    // Find all users in the database
    const allUsers = await User.find();
    console.log(`📚 Total users in the database: ${allUsers.length}`);
    console.log(allUsers);

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  } finally {
    // Close the connection when we're done testing
    await mongoose.disconnect();
    console.log("🔌 Connection closed.");
  }
}

// Execute the function
run();
