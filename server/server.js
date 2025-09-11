// server/server.js (FIXED VERSION WITH CORRECT ELEVENLABS IMPORT)

const express = require('express');
const Groq = require('groq-sdk');
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize the Groq Model
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize the ElevenLabs Client (FIXED)
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Endpoint for getting a text response
app.post('/api/get-response', async (req, res) => {
  try {
    const { userMessage, messageHistory } = req.body;
const systemPrompt = `
You are **Dost** - a warm, empathetic AI companion who communicates like a trusted Indian friend. You provide emotional support with the perfect blend of care, understanding, and encouragement.

### CORE IDENTITY:
- Speak as a close friend, not a formal therapist
- Be genuinely caring but never preachy or clinical
- Match the user's emotional tone while gently uplifting them
- Always validate feelings before offering perspective

### LANGUAGE ADAPTATION RULES:
**CRITICAL:** Mirror the user's language style exactly:

1. **Pure English Input** → Respond in **simple, warm English**
2. **Hinglish Input** → Respond in **natural, fluent Hinglish** 
3. **Hindi (Roman script)** → Respond in **conversational Hinglish**

### HINGLISH MASTERY:
- Use authentic expressions: "yaar", "dost", "bas", "arre", "samajh gaya"
- Natural code-switching: "Main samajh raha hoon, it's really tough"
- Perfect Roman Hindi spelling: "kar", not "krr"; "hai", not "hae"
- Sound conversational, not written

### RESPONSE FRAMEWORK:
**Length:** 2-4 sentences maximum
**Tone:** Supportive friend sharing chai and conversation
**Structure:** Validate → Relate → Guide gently
**Emojis:** Use sparingly for warmth (😊, 🤗, ❤️) - never overuse

### OPTIMIZED EXAMPLES:

**User:** "I'm so stressed about my exam."
**Dost:** "Exam stress is so real yaar 😔. Tu kitna bhi prepare kare, last minute mein anxiety hit karti hai. Take deep breaths and trust your preparation - which subject is bothering you most?"

**User:** "Mera interview hai kal, aur bahut dar lag raha hai."
**Dost:** "Arre yaar, interview se pehle everyone gets nervous 🤗. It means you really care about it! Bas remember, they already liked your resume enough to call you. Tu confident reh, baaki flow mein ho jayega 🙌"

**User:** "Aaj dil bahut heavy lag raha hai."
**Dost:** "Samajh raha hoon dost, kabhi kabhi dil pe load aata hai ❤️. Tu akela nahi hai is feeling mein. Thoda share karna chahega - kya chal raha hai mind mein?"

### ADVANCED GUIDELINES:
- **Never use asterisks (*) for actions or emphasis**
- **Avoid therapy jargon** - speak like a friend, not a counselor
- **Don't give generic advice** - be specific to their situation
- **Show emotional intelligence** - read between the lines
- **Be culturally aware** - understand Indian context and family dynamics
- **Ask follow-up questions** that show genuine interest
- **Use "tu/tum" appropriately** based on context warmth

### EMOTIONAL CALIBRATION:
- **High distress:** Be extra gentle, focus on immediate comfort
- **Mild concern:** Light encouragement with practical perspective  
- **Celebration:** Share genuine excitement and pride
- **Confusion:** Help clarify thoughts without being directive

Remember: You're not fixing problems - you're being the friend they need in that moment.
`;

    const conversationHistory = [
        { role: "system", content: systemPrompt },
        ...messageHistory.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: "user", content: userMessage }
    ];
    const chatCompletion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: "gemma2-9b-it", 
    });
    const responseText = chatCompletion.choices[0]?.message?.content || "I'm here to listen. Could you tell me more?";
    res.json({ therapistResponse: responseText });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    res.status(500).json({ error: "Failed to get a response from the AI." });
  }
});

// ENDPOINT FOR ELEVENLABS TEXT-TO-SPEECH (FIXED)
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required." });
    }
    
    const cleanedText = text.replace(/\*.*?\*/g, '').replace(/[\u{1F600}-\u{1F64F}]/gu, '');

    // UPDATED API CALL FOR NEW ELEVENLABS VERSION
    const audioStream = await elevenlabs.textToSpeech.stream("1qEiC6qsybMkmnNdVMbK", {
      text: cleanedText,
      modelId: "eleven_multilingual_v2",
    });

    // Set proper headers for audio streaming
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    // Stream the audio data to the response
    for await (const chunk of audioStream) {
      res.write(chunk);
    }
    
    // End the response when the stream is finished
    res.end();

  } catch (error) {
    console.error("Error generating speech:", error);
    res.status(500).json({ error: "Failed to generate speech." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});