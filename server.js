const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json({ limit: "10mb" }));

// =====================================
// HEALTH CHECK
// =====================================
app.get("/", (req, res) => {
  res.send("Sarvam TTS Server Running");
});

// =====================================
// TTS ENDPOINT
// =====================================
app.post("/test-tts", async (req, res) => {
  try {

    console.log("=================================");
    console.log("INCOMING REQUEST");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=================================");

    let text = "Namaste from SPIM Realty";

    if (typeof req.body.text === "string") {
      text = req.body.text;
    }
    else if (typeof req.body.message === "string") {
      text = req.body.message;
    }
    else if (typeof req.body.transcript === "string") {
      text = req.body.transcript;
    }
    else if (typeof req.body.response === "string") {
      text = req.body.response;
    }

    console.log("FINAL TEXT:", text);

    // =====================================
    // LANGUAGE DETECTION
    // =====================================

    const teluguRegex = /[\u0C00-\u0C7F]/;

    let languageCode = "en-IN";

    if (teluguRegex.test(text)) {
      languageCode = "te-IN";
    }
    else if (
      text.toLowerCase().includes("namaste") ||
      text.toLowerCase().includes("aap") ||
      text.toLowerCase().includes("hai")
    ) {
      languageCode = "hi-IN";
    }
    else {
      languageCode = "en-IN";
    }

    console.log("LANGUAGE:", languageCode);

    // =====================================
    // SARVAM API CALL
    // =====================================

    const sarvamResponse = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        inputs: [text],

        target_language_code: languageCode,

        speaker: "vidya",

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

    const base64Audio = sarvamResponse.data.audios[0];

    if (!base64Audio) {
      throw new Error("No audio returned");
    }

    // IMPORTANT
    // SEND JSON INSTEAD OF RAW BUFFER

    return res.json({
      audio: base64Audio
    });

  } catch (error) {

    console.log("=================================");
    console.log("FULL ERROR");
    console.log("=================================");

    if (error.response) {
      console.log(error.response.data);

      return res.status(500).json({
        error: error.response.data,
      });
    }

    console.log(error.message);

    return res.status(500).json({
      error: error.message,
    });
  }
});
// =====================================
// PORT
// =====================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});