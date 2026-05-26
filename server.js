const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

app.post("/test-tts", async (req, res) => {
  try {
    console.log("Incoming Request Body:");
    console.log(req.body);

    const text =
      req.body.text ||
      req.body.message ||
      "Namaste from SPIM Realty";

    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        text: text,
        target_language_code: "te-IN",
        speaker: "male",
        pitch: 0,
        pace: 1.0,
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v1",
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SARVAM RESPONSE SUCCESS");

    res.json(response.data);
  } catch (error) {
    console.log("FULL ERROR:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.status(500).json({
      error: "TTS generation failed",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});