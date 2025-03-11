import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import axios from "axios";

// ✅ Function to generate unique background color for each user
const getUserColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 70%)`; // 🎨 Generate unique HSL color
  return color;
};

const Chat = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // ✅ Fetch old messages from MongoDB
  useEffect(() => {
    axios
      .get("https://vite-project-alpha-liard.vercel.app/api/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Receive new messages
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  // ✅ Send message
  const sendMessage = () => {
    if (message.trim() && username.trim()) {
      socket.emit("sendMessage", { username, text: message });
      setMessage("");
    }
  };

  // ✅ Send message on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl md:text-8xl font-bold mb-4">Chat App</h1>

      {/* ✅ Username Input */}
      <input
        className="w-full max-w-100 h-20 text-4xl text-center p-2 border bg-gray-800 text-white rounded"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* ✅ Chat Box */}
      <div className="w-full max-w-300 h-[3000px] bg-gray-800 p-8 overflow-y-auto border border-gray-700 rounded mt-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 text-3xl mb-2 rounded-lg max-w-[75%] ${
              msg.username === username ? "ml-auto text-right" : "mr-auto text-left"
            }`}
            style={{
              backgroundColor: getUserColor(msg.username), // 🎨 Dynamic BG color
              color: "#000", // Keep text readable
              padding: "8px",
              borderRadius: "10px",
            }}
          >
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
        {/* ✅ Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ Message Input & Send Button */}
      <div className="flex w-full max-w-300 h-40 bg-gray-800 p-4 border border-gray-700 rounded mt-6">
        <input
          className="flex-1 p-2 border bg-gray-800 text-white rounded-l"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress} // ✅ Press "Enter" to send
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 px-4 py-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
