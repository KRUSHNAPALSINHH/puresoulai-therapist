# 🌸 Puresoul AI – Your Empathetic Wellness Companion  

> 🧠💖 **Puresoul AI** is a full-stack web application designed to be an empathetic and supportive wellness companion.  
It leverages **real-time emotion detection** and a **sophisticated AI chatbot** to provide an interactive mental wellness experience.  

The heart of Puresoul AI is **"Dost"** 🤝 – a compassionate AI therapist persona that communicates like a trusted friend, adapting its language to make users feel understood and supported.  

---

## ✨ Key Features
- 🔐 **Secure User Authentication** – Sign-up & login with hashed passwords, JWT sessions, and MongoDB Atlas.  
- 💬 **AI-Powered Therapy Chat** – Real-time empathetic conversations powered by **Groq LPU Inference Engine** ⚡.  
- 🌐 **Adaptive Language Persona** – Detects English vs Hinglish and responds naturally.  
- 🎙️ **Voice-to-Voice Interaction**  
  - 🗣️ Speech-to-Text via Web Speech API  
  - 🔊 Text-to-Speech via **ElevenLabs** realistic voices  
- 😊 **Real-Time Emotion Detection**  
  - Uses **Google MediaPipe Face Landmarker**  
  - Collects 10 readings → finds dominant emotion  
  - Smart popup with a choice to start a therapy session  

---

## 🛠️ Tech Stack

### 🎨 Frontend
- ⚛️ React + React Router  
- 🎬 Framer Motion (animations)  
- 🖌️ Tailwind CSS  
- 🔗 React Context API (state management)  
- 🎯 Lucide React (icons)  

### ⚙️ Backend
- 🌐 Node.js + Express  
- 🗄️ MongoDB Atlas (Mongoose ORM)  
- 🔑 JWT Authentication + bcrypt password hashing  

### 🤖 AI & External Services
- ⚡ **Groq** – Ultra-low-latency LPU inference engine  
- 🗣️ **ElevenLabs** – High-quality AI voices  
- 👀 **Google MediaPipe** – Real-time emotion & facial analysis  

---

## 🚀 Getting Started

### ✅ Prerequisites
Make sure you have:  
- [Node.js](https://nodejs.org/) v18+  
- [Git](https://git-scm.com/)  
- A **MongoDB Atlas** account  
- A **Groq AI** API key  
- An **ElevenLabs** API key  

---

### 🔧 Installation & Setup

1️⃣ **Clone the repository**
```bash
git clone https://github.com/your-username/puresoul-ai.git
cd puresoul-ai
2️⃣ Backend Setup

bash
Copy code
cd server
npm install
Create .env file in server/:

env
Copy code
MONGO_URI=mongodb+srv://user:<password>@cluster.mongodb.net/puresouldb
JWT_SECRET=your_super_long_secret
GROQ_API_KEY=your_groq_api_key_here
ELEVEN_API_KEY=your_elevenlabs_api_key_here
3️⃣ Frontend Setup

bash
Copy code
cd ..
npm install
4️⃣ Run the App
Open two terminals:

Terminal 1 → Backend:

bash
Copy code
cd server
node server.js
Terminal 2 → Frontend:

bash
Copy code
npm run dev
App will run at 👉 http://localhost:5173

🎥 How to Use
✍️ Sign Up / Log In → Secure account creation.

📸 Emotion Detection → Allow camera → App analyzes expressions.

😌 Popup Prompt → Based on dominant emotion.

🗣️ Therapy Session → Chat with Dost via text 🎹 or voice 🎙️.

🔊 Voice Response → Dost replies with text + realistic speech.

📦 Dependencies
Category	Packages
Frontend	React, Tailwind, Framer Motion, Lucide React
Backend	Express, Mongoose, bcrypt.js, JWT
AI / APIs	Groq, ElevenLabs, Google MediaPipe

🤝 Contributing
Contributions are welcome! 🎉
Fork → Branch → Commit → Push → PR

