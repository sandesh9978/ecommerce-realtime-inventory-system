import React, { useState, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import websiteKnowledgeBase from "./websiteKnowledgeBase";

const BOT_NAME = "ShopBot";
const STORAGE_KEY = "chatBotHistory";

const fuse = new Fuse(websiteKnowledgeBase, {
  keys: ["question"],
  threshold: 0.4, // Adjust for strictness
});

function getBotResponse(userInput) {
  const result = fuse.search(userInput);
  if (result.length > 0) {
    const answer = result[0].item.answer;
    if (typeof answer === 'function') {
      return answer();
    }
    return answer;
  }
  return "Sorry, I couldn't find information about that. Please try asking about another page or feature!";
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, open]);

  const handleSend = (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    const userMsg = { sender: "user", text: msg, time: new Date().toLocaleTimeString() };
    const botMsg = { sender: "bot", text: getBotResponse(msg), time: new Date().toLocaleTimeString() };
    setHistory((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSend(e);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear chat history?")) {
      setHistory([]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl hover:bg-blue-700 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✖" : "💬"}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-full bg-white rounded-lg shadow-2xl flex flex-col border border-blue-200 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 rounded-t-lg">
            <span className="text-white font-bold">{BOT_NAME}</span>
            <button onClick={handleClear} className="text-xs text-white hover:underline">Clear</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2" style={{ maxHeight: 320 }}>
            {history.length === 0 && (
              <div className="text-gray-400 text-sm text-center mt-8">How can I help you today?</div>
            )}
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] text-sm shadow ${
                    msg.sender === "user"
                      ? "bg-blue-100 text-blue-900 self-end"
                      : "bg-gray-100 text-gray-700 self-start"
                  }`}
                  title={msg.time}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="flex items-center border-t px-2 py-2 bg-gray-50 rounded-b-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            <button
              type="submit"
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
