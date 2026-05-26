const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

app.post("/test-tts", async (req, res) => {
  try {

    console.log("Incoming Request Body:");
    console.log(req.body);

    // Text coming from Vapi
    const text =
      req.body.text ||
      req.body.message ||
      "Namaste from SPIM Realty";

    console.log("TEXT RECEIVED:");
    console.log(text);

    // Request to Sarvam TTS
    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        text: text,
        target_language_code: "en-IN",
        speaker: "meera",
        pitch: 0,
        pace: 1,
        loudness: 1,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v2"
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("SARVAM RESPONSE SUCCESS");

    // Return Sarvam response to Vapi
    res.json(response.data);

  } catch (error) {

    console.log("FULL ERROR:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.status(500).json({
      error: "TTS generation failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});