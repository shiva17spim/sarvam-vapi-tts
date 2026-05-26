const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

/*
========================================
ROOT ROUTE
========================================
*/

app.get("/", (req, res) => {
  res.send("Sarvam TTS Server Running");
});

/*
========================================
TTS ROUTE
========================================
*/

app.post("/test-tts", async (req, res) => {
  try {

    console.log("========== INCOMING REQUEST ==========");
    console.log(req.body);

    const text =
      req.body.text ||
      req.body.message ||
      "Namaste from SPIM Realty";

    /*
    ========================================
    SARVAM API CALL
    ========================================
    */

    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        inputs: [text],

        target_language_code: "te-IN",

        speaker: "anushka",

        pitch: 0,

        pace: 1.0,

        loudness: 1.5,

        speech_sample_rate: 22050,

        enable_preprocessing: true,

        model: "bulbul:v3",
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("========== SARVAM SUCCESS ==========");
    console.log(response.data);

    return res.status(200).json(response.data);

  } catch (error) {

    console.log("========== FULL ERROR ==========");

    if (error.response) {

      console.log("SARVAM API ERROR:");
      console.log(error.response.data);

      return res.status(error.response.status || 500).json({
        success: false,
        source: "sarvam-api",
        error: error.response.data,
      });
    }

    console.log("SERVER ERROR:");
    console.log(error.message);

    return res.status(500).json({
      success: false,
      source: "server",
      error: error.message,
    });
  }
});

/*
========================================
SERVER START
========================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 