const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCkRR1yOAUU7W36v19bfgxvDcZ1Tz-gz3I'); // Get this from Google AI Studio
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const PORT = 3000;

let rooms = {};

// Add chatbot function
async function getChatbotResponse(message) {
  try {
    console.log('Chatbot received message:', message); // Debug log
    const result = await model.generateContent(message);
    const response = await result.response;
    console.log('Chatbot response:', response.text()); // Debug log
    return response.text();
  } catch (error) {
    console.error('Chatbot error:', error);
    return "Sorry, I'm having trouble processing your request.";
  }
}

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    // Handle user joining a room
    if (data.type === "join") {
      const { username, room } = data;
      ws.username = username;
      ws.room = room;

      if (!rooms[room]) rooms[room] = [];
      rooms[room].push(ws);

      broadcast(room, { type: "info", message: `${username} has joined the room.` });
    }

    // Handle message broadcasting
    if (data.type === "message") {
      const { username, room, message, isAICommand } = data;
      broadcast(room, { type: "message", username, message, isAICommand });

      // Check if message is directed to chatbot (e.g., "@bot hello")
      if (message.toLowerCase().startsWith("@bot ")) {
        const botQuery = message.substring(5); // Remove "@bot " prefix
        const botResponse = await getChatbotResponse(botQuery);
        broadcast(room, { 
          type: "ai_response",
          username: "AI Bot",
          message: botResponse 
        });
      }
    }

    // Handle AI direct messages
    if (data.type === "ai_message") {
      const botResponse = await getChatbotResponse(data.message);
      ws.send(JSON.stringify({
        type: "ai_response",
        message: botResponse
      }));
    }

    // Handle "user is typing" notifications
    if (data.type === "typing") {
      const { username, room } = data;
      broadcast(room, { type: "typing", username }, ws);
    }
  });

  ws.on("close", () => {
    const { username, room } = ws;
    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter((client) => client !== ws);
      broadcast(room, { type: "info", message: `${username} has left the room.` });
    }
  });
});

// Broadcast message to all clients in the room
function broadcast(room, message, exclude) {
  if (!rooms[room]) return;
  rooms[room].forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

app.use(express.static("public"));

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
