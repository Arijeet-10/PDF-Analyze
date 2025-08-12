import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Send, User, Bot, X, Trash2, Podcast, Sparkles } from 'lucide-react';

const FloatingChatbot = ({ files = [], isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [podcastLoading, setPodcastLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
        setMessages([{ role: 'bot', text: `Hello! I'm here to help you with your documents. What would you like to know?` }]);
        setAudioSrc(null);
    }
  }, [isOpen, files]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, audioSrc, podcastLoading]);

  const sendMessage = async () => {
    if (!input.trim() || files.length === 0) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAudioSrc(null);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('question', input);

    try {
      const res = await fetch('http://localhost:5000/ask-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'The server returned an error.');
      }

      const data = await res.json();
      const botMessage = { role: 'bot', text: data.answer };
      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      const errorMessage = {
        role: 'bot',
        text: `Sorry, I encountered an error: ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePodcast = async () => {
    if (files.length === 0) return;
    setPodcastLoading(true);
    setAudioSrc(null);
    setMessages([]);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const res = await fetch('http://localhost:5000/generate-podcast', { 
        method: 'POST',
        body: formData,
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
        role: 'bot',
        text: `Sorry, I encountered an error generating the podcast. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setPodcastLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat and any generated podcast?")) {
      setMessages([{ role: 'bot', text: `Hello! I'm here to help you with your documents. What would you like to know?` }]);
      setAudioSrc(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col h-[70vh] max-h-[700px] z-50 overflow-hidden">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative p-6 border-b border-gray-200/50 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Document Assistant</h1>
            <p className="text-xs text-gray-500 font-medium">Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={clearChat}
            className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 group"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="relative flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            
            <div className={`max-w-[85%] px-5 py-4 rounded-3xl shadow-sm text-sm leading-relaxed transform transition-all duration-300 hover:scale-[1.02] ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-lg shadow-lg' 
                : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-lg border border-gray-200/50 shadow-md'
            }`}>
              <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-gray'} [&>p]:mb-2 [&>p:last-child]:mb-0`}>
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 px-5 py-4 rounded-3xl rounded-bl-lg shadow-md">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Podcast loading */}
        {podcastLoading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-3xl shadow-md border border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-700 font-medium">Creating your podcast experience...</p>
              </div>
            </div>
          </div>
        )}

        {/* Audio player */}
        {audioSrc && (
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Podcast className="w-5 h-5 text-pink-600" />
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-200/50 w-full">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Your Podcast is Ready!</span>
              </div>
              <audio controls src={audioSrc} className="w-full h-10 rounded-xl">
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      {/* Footer */}
      <footer className="relative p-6 bg-white/60 backdrop-blur-sm border-t border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here..."
              disabled={isLoading || podcastLoading}
              className="w-full px-5 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm hover:shadow-md disabled:opacity-60"
            />
            {input.trim() && (
              <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || podcastLoading}
            className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          <button
            onClick={generatePodcast}
            disabled={podcastLoading || isLoading || files.length === 0}
            className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 text-white rounded-2xl flex items-center justify-center hover:from-pink-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
            title="Generate Podcast Summary"
          >
            <Podcast className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center justify-center mt-3">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>Ready to assist</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FloatingChatbot;