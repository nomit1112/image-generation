import express from 'express';
import * as dotenv from 'dotenv';
import Replicate from 'replicate';

dotenv.config();

const router = express.Router();

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Routes
router.route('/').get((req, res) => {
  res.status(200).json({ message: 'Hello from Replicate!' });
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: prompt
        }
      }
    );

    // `output` will be a URL of the generated image
    const imageUrl = Array.isArray(output) ? output[0] : output;
res.status(200).json({ photo: imageUrl });

  } catch (error) {
    console.error('Replicate Error:', error);
    res.status(500).send(error?.message || 'Something went wrong');
  }
});

export default router;
