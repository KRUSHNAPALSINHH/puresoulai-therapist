// test-eleven.js
require("dotenv").config();
const { ElevenLabsClient } = require("elevenlabs");

// ✅ Check if API key is loaded
if (!process.env.ELEVENLABS_API_KEY) {
  console.error("❌ ELEVENLABS_API_KEY is missing! Please check your .env file.");
  process.exit(1);
}

console.log("Loaded API Key:", process.env.ELEVENLABS_API_KEY.slice(0, 8) + "...");

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function test() {
  try {
    const audio = await client.generate({
      voice_id: "pNInz6obpgDQGcFmaJgB", // Rachel (example voice ID)
      text: "Hello dost, this is a test from ElevenLabs.",
      model_id: "eleven_multilingual_v2",
    });

    console.log("✅ ElevenLabs request successful!");
    console.log(audio); // this will show the audio stream/buffer
  } catch (err) {
    console.error("❌ ElevenLabs request failed:", err);
  }
}

test();
