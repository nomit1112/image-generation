import express from 'express';
import * as dotenv from 'dotenv';
import Replicate from 'replicate';

dotenv.config();

const router = express.Router();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

router.route('/').get((req, res) => {
  res.send('Replicate route is working ✅');
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("📩 Prompt received:", prompt);

    if (!prompt) {
      console.error("❌ Error: Prompt is empty or missing.");
      return res.status(400).json({
        success: false,
        error: "Prompt is required to generate an image.",
      });
    }

    console.log("Attempting to run Replicate model...");
    const predictionResult = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: prompt,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          safety_tolerance: 2,
          prompt_upsampling: true,
        },
      }
    );

    console.log("✅ replicate.run() resolved.");
    console.log("🔍 Returned object type:", typeof predictionResult);
    console.log("🔍 Is returned object an Array:", Array.isArray(predictionResult));
    // console.dir(predictionResult, { depth: null, colors: true }); // Keep this commented unless needed
    console.log("🔍 Does returned object have .url property:", typeof predictionResult?.url);
    console.log("🔍 Is returned object.url a function:", typeof predictionResult?.url === 'function');


    let imageUrl = null;

    // --- Get the image URL from the returned FileOutput object ---
    if (predictionResult && typeof predictionResult === 'object' && typeof predictionResult.url === 'function') {
      try {
         // Call the .url() method and access the .href property to get the string URL
         imageUrl = predictionResult.url().href;
         console.log("✅ Extracted Image URL string using predictionResult.url().href:", imageUrl);

      } catch (urlError) {
         console.error("❌ Error calling predictionResult.url() or accessing .href:", urlError);
         return res.status(500).json({
           success: false,
           error: "Error obtaining image URL string from Replicate output using .url().href.",
         });
      }
    }
    // --- Fallback for other models ---
    else if (predictionResult && Array.isArray(predictionResult) && predictionResult.length > 0 && typeof predictionResult[0] === 'string') {
        imageUrl = predictionResult[0];
        console.log("✅ Extracted Image URL string from array output[0]:", imageUrl);
    }
    // Handle unexpected output format
    else {
        console.error("❌ Replicate returned an unexpected output format:", predictionResult);
        return res.status(500).json({
          success: false,
          error: "Replicate returned an unexpected output format for the image.",
        });
    }

    // --- Corrected Final check: Ensure imageUrl is a non-empty string ---
    if (typeof imageUrl !== 'string' || imageUrl.length === 0) {
         console.error("❌ Final check failed: imageUrl is not a valid string.", imageUrl);
         return res.status(500).json({
           success: false,
           error: "Failed to obtain a valid image URL string after processing Replicate output.",
         });
    }

    // Send the image URL (string) back to the frontend in the response
    res.status(200).json({ photo: imageUrl });

  } catch (error) {
    console.error("❌ An error occurred during the Replicate process:", error?.message || error);

    if (error.response) {
        console.error("❌ Replicate API Error Response Data:", error.response.data);
        console.error("❌ Replicate API Error Response Status:", error.response.status);
    }

    res.status(500).json({
      success: false,
      message: error?.message || 'Image generation failed on the backend.',
    });
  }
});

export default router;