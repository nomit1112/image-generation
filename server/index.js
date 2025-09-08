import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './mongodb/connect.js';

import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';

dotenv.config();

console.log("SERVER STARTING - Replicate Token:", process.env.REPLICATE_API_TOKEN ? "Loaded" : "MISSING OR UNDEFINED");

const app = express();

// ✅ Allow both localhost (dev) and your Render frontend (prod)
const allowedOrigins = [
  "http://localhost:5173",               // for local React dev
  "https://nomit-ai-app.onrender.com"   // 🔑 replace with your actual frontend Render URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);

// Health check
app.get('/', async (req, res) => {
  res.status(200).json({ message: 'Hello from DALL·E backend!' });
});

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    console.log("🟢 Connected to MongoDB");

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};

startServer();

