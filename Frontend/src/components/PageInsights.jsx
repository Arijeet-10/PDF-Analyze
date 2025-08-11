import React, { useState, useEffect, useRef } from "react";
import { X, Send, MessageCircle, User, Bot, Trash2, Podcast } from "lucide-react";

export default function PageInsights({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageText, setPageText] = useState("");
  const [audioSrc, setAudioSrc] = useState(null);
  const [podcastLoading, setPodcastLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function formatMessage(text) {
    let html = text;

    // Headings
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

    // Bullet points
    html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
    if (html.includes("<li>")) {
      html = `<ul>${html}</ul>`;
    }

    // Line breaks
    html = html.replace(/\n/g, "<br />");

    return html.trim();
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, audioSrc, podcastLoading]);

  useEffect(() => {
    if (open) {
      const mainElement = document.querySelector("main") || document.body;
      setPageText(mainElement.innerText.replace(/\s+/g, " ").trim());
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
  const res = await fetch("http://localhost:5000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: pageText, question: input }),
  });

  const data = await res.json();
  const botMessage = { role: "bot", text: data.answer };
  setMessages((prev) => [...prev, botMessage]);
} catch (err) {
  console.error(err);
  const errorMessage = {
    role: "bot",
    text: "Sorry, I encountered an error. Please try again.",
  };
  setMessages((prev) => [...prev, errorMessage]);
}
setLoading(false);

  };

  const generatePodcast = async () => {
    setPodcastLoading(true);
    setAudioSrc(null);
    try {
      const contextTitle = document.title || "the current page";
      
      const res = await fetch("http://localhost:5000/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pageText, contextTitle }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.audioContent) {
        setAudioSrc(`data:audio/mp3;base64,${data.audioContent}`);
      } else {
        throw new Error("No audio content received");
      }

    } catch (err) {
      console.error(err);
       const errorMessage = {
        role: "bot",
        text: "Sorry, I encountered an error generating the podcast. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setPodcastLoading(false);
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat?")) {
      setMessages([]);
      setAudioSrc(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white shadow-2xl rounded-2xl overflow-hidden z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Page Insights</h3>
            <p className="text-blue-100 text-xs">
              Ask me anything about this page
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && !audioSrc && !podcastLoading && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Start a conversation about this page!</p>
            <p className="text-xs mt-1">
              Or, generate a podcast summary.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start space-x-3 ${
              msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-white text-gray-800 shadow-sm border"
              }`}
            >
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
              />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
         {podcastLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border">
              <p className="text-sm text-gray-700">Generating your podcast, please wait...</p>
            </div>
          </div>
        )}
        {audioSrc && (
            <div className="flex items-start space-x-3">
                 <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-2 rounded-2xl shadow-sm border w-full">
                    <audio controls src={audioSrc} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about this page..."
            disabled={loading || podcastLoading}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 text-black"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || podcastLoading}
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Send className="w-4 h-4" />
          </button>
           <button
            onClick={generatePodcast}
            disabled={podcastLoading || loading}
            className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full flex items-center justify-center hover:from-pink-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            title="Generate Podcast"
          >
            <Podcast className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • Powered by AI
        </p>
      </div>
    </div>
  );
}

