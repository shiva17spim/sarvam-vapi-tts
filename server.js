require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sarvam Vapi TTS Server Running");
});

app.get("/test-tts", async (req, res) => {
  try {

    const response = await axios({
      method: "post",
      url: "https://api.sarvam.ai/text-to-speech",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
        "Content-Type": "application/json"
      },
      data: {
        inputs: ["Namaste! Welcome to SPIM Realty."],
        target_language_code: "en-IN",
        speaker: "anushka"
      },
      responseType: "arraybuffer"
    });

    res.set({
      "Content-Type": "audio/wav"
    });

    res.send(response.data);

  } catch (error) {

    console.log("FULL ERROR:");

    console.log(
      error.response?.data?.toString() || error.message
    );

    res.status(500).json({
      error: "TTS generation failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});