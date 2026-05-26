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
    console.log("Incoming Request");

    // =========================
    // GET TEXT FROM VAPI
    // =========================
    const text =
      req.body.text ||
      req.body.message ||
      req.body.transcript ||
      "Namaste from SPIM Realty";

    console.log("TEXT:", text);

    // =========================
    // SIMPLE LANGUAGE DETECTION
    // =========================
    const teluguRegex = /[\u0C00-\u0C7F]/;

    let languageCode = "en-IN";
    let speaker = "vidya";

    // Telugu detection
    if (teluguRegex.test(text)) {
      languageCode = "te-IN";
      speaker = "vidya";
    }

    // Hindi detection
    else if (
      text.includes("namaste") ||
      text.includes("aap") ||
      text.includes("hai") ||
      text.includes("kya")
    ) {
      languageCode = "hi-IN";
      speaker = "vidya";
    }

    // English default
    else {
      languageCode = "en-IN";
      speaker = "vidya";
    }

    console.log("LANGUAGE:", languageCode);
    console.log("SPEAKER:", speaker);

    // =========================
    // SARVAM API CALL
    // =========================
    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        inputs: [text],

        target_language_code: languageCode,

        speaker: speaker,

        speech_sample_rate: 22050,

        enable_preprocessing: true,

        model: "bulbul:v3"
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SARVAM SUCCESS");

    // =========================
    // CONVERT BASE64 TO AUDIO
    // =========================
    const base64Audio = response.data.audios[0];

    const audioBuffer = Buffer.from(base64Audio, "base64");

    // =========================
    // SEND AUDIO TO VAPI
    // =========================
    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": audioBuffer.length,
    });

    res.send(audioBuffer);

  } catch (error) {

    console.log("FULL ERROR");

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

// =========================
// PORT
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});