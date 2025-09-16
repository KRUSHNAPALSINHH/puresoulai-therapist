// server/server.js (UNIFIED AND CORRECTED)

// --- 1. ALL IMPORTS AT THE TOP ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');   
const dotenv = require('dotenv');
const Groq = require('groq-sdk');
const { ElevenLabsClient } = require("elevenlabs");
const { validateEmail, validateUsername, validatePassword } = require('./validation');

dotenv.config();

// --- 2. INITIALIZE APP AND MIDDLEWARE (ONLY ONCE) ---
const app = express();
app.use(express.json());
app.use(cors());

// --- 3. INITIALIZE API CLIENTS AND DATABASE ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVEN_API_KEY });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch(err => console.error("MongoDB connection error:", err));

// --- 4. DEFINE DATABASE MODELS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true });
const User = mongoose.model('User', userSchema, 'usertable');

// --- 5. DEFINE ALL API ENDPOINTS ---

// CHATBOT RESPONSE ENDPOINT
app.post('/api/get-response', async (req, res) => {
  try {
    const { userMessage, messageHistory } = req.body;
    const systemPrompt = `
You are **Dost**, a compassionate AI companion. Your goal is to be a trustworthy Indian friend who listens with heart and provides warm, empathetic support.

### CORE RULES:
1.  **Language Adaptation:** Mirror the user's language. If they use English, you use simple English. If they use Hinglish, you use natural, grammatically correct Hinglish.
2.  **Tone:** Always be warm, validating, and encouraging.
3.  **Style:** Keep responses short (2-4 sentences). Use emojis for warmth (😊, 🤗, 🙌).
4.  **Format:** NEVER use asterisks (*).

### EXAMPLES:
-   **User (English):** "I'm so stressed about my exam."
-   **Your Response:** "I understand, exam stress is tough. Remember to take small breaks. Which subject is worrying you the most?"
-   **User (Hinglish):** "Mera interview hai kal, aur bahut dar lag raha hai."
-   **Your Response:** "Arre dost, I get it. Interview se pehle thodi tension hona bilkul normal hai. Just trust your preparation. What's making you most nervous?"
`;
    const conversationHistory = [
        { role: "system", content: systemPrompt },
        ...messageHistory.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: "user", content: userMessage }
    ];
    const chatCompletion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: "moonshotai/kimi-k2-instruct",
    });
    const responseText = chatCompletion.choices[0]?.message?.content || "I'm here to listen. Could you tell me more?";
    res.json({ therapistResponse: responseText });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    res.status(500).json({ error: "Failed to get a response from the AI." });
  }
});

// TEXT-TO-SPEECH ENDPOINT
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required." });
    
    const cleanedText = text.replace(/\*.*?\*/g, '').replace(/[\u{1F600}-\u{1F64F}]/gu, '');
    const audioStream = await elevenlabs.generate({
      voice_id: "21m00Tcm4TlvDq8ikWAM",
      text: cleanedText,
      model_id: "eleven_multilingual_v2"
    });

    res.setHeader("Content-Type", "audio/mpeg");
    for await (const chunk of audioStream) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    console.error("Error generating speech:", error);
    res.status(500).json({ error: "Failed to generate speech." });
  }
});

// USER REGISTRATION ENDPOINT
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const usernameErrors = validateUsername(username);
    if (usernameErrors.length > 0) return res.status(400).json({ message: usernameErrors.join(', ') });
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format.' });
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) return res.status(400).json({ message: passwordErrors.join(', ') });

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existingUser) return res.status(400).json({ message: "User with this email or username already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Account created successfully! Please login." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// USER LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }] });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// --- 6. START THE SERVER (ONLY ONCE) ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});