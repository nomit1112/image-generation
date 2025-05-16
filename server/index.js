import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './mongodb/connect.js';

import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';

dotenv.config(); // Load environment variables from .env file

// Optional: Log to confirm Replicate API token loaded
console.log("🔁 Replicate API Token:", process.env.REPLICATE_API_TOKEN ? 'Token loaded ✅' : '❌ Token missing!');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '50mb' })); // Parse JSON request bodies, limit to 50mb

// Use the defined routes
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);

// Basic root route
app.get('/', async (req, res) => {
  res.send('Hello from AI Image Generator Backend using Replicate!');
});

// Function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB(process.env.MONGODB_URL);
    console.log("🟢 Connected to MongoDB");

    // Start the Express server
    app.listen(8080, () =>
      console.log('🚀 Server started on http://localhost:8080')
    );
  } catch (error) {
    // Log any errors during server startup (DB connection, etc.)
    console.error('❌ Failed to start server:', error);
  }
};

startServer(); // Call the function to start the server
