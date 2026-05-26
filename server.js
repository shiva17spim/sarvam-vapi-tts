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

    // =====================================
    // SAFE TEXT EXTRACTION
    // =====================================

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
    let speaker = "vidya";

    // Telugu
    if (teluguRegex.test(text)) {
      languageCode = "te-IN";
      speaker = "vidya";
    }

    // Hindi
    else if (
      String(text).toLowerCase().includes("namaste") ||
      String(text).toLowerCase().includes("aap") ||
      String(text).toLowerCase().includes("hai") ||
      String(text).toLowerCase().includes("kya")
    ) {
      languageCode = "hi-IN";
      speaker = "vidya";
    }

    // English
    else {
      languageCode = "en-IN";
      speaker = "vidya";
    }

    console.log("LANGUAGE:", languageCode);
    console.log("SPEAKER:", speaker);

    // =====================================
    // SARVAM API CALL
    // =====================================

    const sarvamResponse = await axios.post(
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

    // =====================================
    // GET BASE64 AUDIO
    // =====================================

    const base64Audio = sarvamResponse.data.audios[0];

    if (!base64Audio) {
      throw new Error("No audio returned from Sarvam");
    }

    // =====================================
    // CONVERT TO AUDIO BUFFER
    // =====================================

    const audioBuffer = Buffer.from(base64Audio, "base64");

    console.log("AUDIO BUFFER SIZE:", audioBuffer.length);

    // =====================================
    // SEND AUDIO TO VAPI
    // =====================================

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
      "Cache-Control": "no-cache",
    });

    return res.send(audioBuffer);

  } catch (error) {

    console.log("=================================");
    console.log("FULL ERROR");
    console.log("=================================");

    if (error.response) {

      console.log(error.response.data);

      return res.status(500).json({
        success: false,
        error: error.response.data,
      });
    }

    console.log(error.message);

    return res.status(500).json({
      success: false,
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