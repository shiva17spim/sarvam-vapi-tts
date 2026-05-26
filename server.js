const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sarvam TTS Server Running");
});

app.post("/test-tts", async (req, res) => {
  try {
    console.log("Incoming Request:");

    const text =
      req.body.text ||
      req.body.message ||
      "Namaste from SPIM Realty";

    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        inputs: [text],
        target_language_code: "te-IN",
        speaker: "anushka",
        pitch: 0,
        pace: 1,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v1"
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SUCCESS");

    res.json(response.data);

  } catch (error) {

    console.log("FULL ERROR:");

    if (error.response) {
      console.log(error.response.data);

      return res.status(500).json({
        error: error.response.data,
      });
    }

    console.log(error.message);

    res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});