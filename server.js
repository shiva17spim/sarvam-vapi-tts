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

    console.log("REQUEST RECEIVED");

    const text =
      req.body.text ||
      req.body.message ||
      "Namaste from SPIM Realty";

    console.log("TEXT:", text);

    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech/convert",
      {
        inputs: [text],
        target_language_code: "te-IN",
        speaker: "male",
        pitch: 0,
        pace: 1.0,
        loudness: 1.0,
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

    console.log("SARVAM SUCCESS");

    res.json(response.data);

  } catch (error) {

    console.log("FULL ERROR BELOW");

    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
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