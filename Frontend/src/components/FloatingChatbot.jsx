import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Send, User, Bot, X, Trash2, Podcast, Sparkles, Languages, Mic, ArrowDown } from 'lucide-react';

// A modern, reusable button component for the footer controls
const ControlButton = ({ onClick, disabled, title, children, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group ${className}`}
  >
    {children}
  </button>
);


const FloatingChatbot = ({ files = [], isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [podcastLoading, setPodcastLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [isListening, setIsListening] = useState(false); // State for voice input
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null); // Ref for SpeechRecognition instance

  // --- Language Configuration ---
  const [language, setLanguage] = useState('English');
  const languages = ['English', 'Bengali', 'Hindi'];
  const languageConfig = {
    'English': {
      initialMessage: "Hello! I'm your AI assistant. How can I help you with the provided documents?",
      placeholder: "Ask a question or use the mic...",
      clearConfirm: "Are you sure you want to clear the chat?",
      podcastTitle: "Generate Podcast Summary",
      voiceLangCode: "en-US" // Language code for Speech API
    },
    'Bengali': {
      initialMessage: "নমস্কার! আমি আপনার এআই অ্যাসিস্ট্যান্ট। আমি কিভাবে আপনাকে সাহায্য করতে পারি?",
      placeholder: "প্রশ্ন করুন অথবা মাইক ব্যবহার করুন...",
      clearConfirm: "আপনি কি চ্যাট মুছে ফেলতে চান?",
      podcastTitle: "পডকাস্ট সারাংশ তৈরি করুন",
      voiceLangCode: "bn-IN"
    },
    'Hindi': {
      initialMessage: "नमस्ते! मैं आपका एआई असिस्टेंट हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
      placeholder: "प्रश्न पूछें या माइक का उपयोग करें...",
      clearConfirm: "क्या आप वाकई चैट साफ़ करना चाहते हैं?",
      podcastTitle: "पॉडकास्ट सारांश उत्पन्न करें",
      voiceLangCode: "hi-IN"
    }
  };

  // --- Speech Recognition Setup Effect ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageConfig[language].voiceLangCode;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
    };
  }, [language]); // Re-initialize if language changes


  // --- Core Logic & Effects ---
  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'bot', text: languageConfig[language].initialMessage }]);
      setAudioSrc(null);
    }
  }, [isOpen, files, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, podcastLoading, audioSrc]);

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
    formData.append('language', language);

    try {
      // const res = await fetch('http://localhost:5000/ask-pdf', { method: 'POST', body: formData });
      const res = await fetch('https://pdf-analyze-features-backend.onrender.com/ask-pdf', { method: 'POST', body: formData });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'The server returned an error.');
      }
      const data = await res.json();
      const botMessage = { role: 'bot', text: data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { role: 'bot', text: `Sorry, an error occurred: ${err.message}` };
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
    formData.append('language', language);

    try {
      // const res = await fetch('http://localhost:5000/generate-podcast', { method: 'POST', body: formData });
      const res = await fetch('https://pdf-analyze-features-backend.onrender.com/generate-podcast', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.audioContent) {
        setAudioSrc(`data:audio/mp3;base64,${data.audioContent}`);
      } else {
        throw new Error("No audio content received");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = { role: 'bot', text: `Sorry, could not generate the podcast. Please try again.` };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setPodcastLoading(false);
  };

  const handleListen = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  const clearChat = () => {
    if (window.confirm(languageConfig[language].clearConfirm)) {
      setMessages([{ role: 'bot', text: languageConfig[language].initialMessage }]);
      setAudioSrc(null);
    }
  };

  if (!isOpen) return null;

  // --- MODERN UI ---
  return (
    <div className="fixed bottom-6 right-6 w-[440px] bg-white/80 backdrop-blur-2xl rounded-[28px] shadow-2xl border border-black/5 flex flex-col h-[85vh] max-h-[720px] z-50 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="relative p-4 border-b border-gray-200/60 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">AI Assistant</h1>
            <p className="text-xs text-gray-500">{language} Mode</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={clearChat} className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100/50 transition-colors" title="Clear Chat">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-200/50 transition-colors" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="relative flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${ msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-100 text-gray-800 rounded-bl-lg' }`}>
              <div className={`prose prose-sm max-w-none prose-p:my-0 prose-headings:my-2 ${ msg.role === 'user' ? 'prose-invert' : '' }`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-gray-600" /></div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-lg">
              <div className="flex items-center justify-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        {podcastLoading && (
            <div className="flex justify-center items-center p-4">
                <div className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-full shadow-md border border-gray-200/50">
                    <div className="flex items-center space-x-3">
                        <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
                        <p className="text-sm text-gray-700 font-medium">Brewing your audio summary...</p>
                    </div>
                </div>
            </div>
        )}
        {audioSrc && (
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-200/50 w-full">
             <div className="flex items-center space-x-3 mb-3">
               <Mic className="w-5 h-5 text-pink-500"/>
               <span className="text-sm font-semibold text-gray-800">Podcast Summary</span>
             </div>
             <audio controls src={audioSrc} className="w-full h-10 rounded-lg">
                 Your browser does not support the audio element.
             </audio>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Footer */}
      <footer className="relative p-4 border-t border-gray-200/60 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <ControlButton onClick={cycleLanguage} disabled={isLoading || podcastLoading} title={`Switch Language (current: ${language})`} className="bg-gray-100 hover:bg-gray-200 text-gray-600">
            <Languages className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
          </ControlButton>
          <ControlButton onClick={generatePodcast} disabled={isLoading || podcastLoading || files.length === 0} title={languageConfig[language].podcastTitle} className="bg-pink-500 hover:bg-pink-600 text-white">
            <Podcast className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
          </ControlButton>
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={languageConfig[language].placeholder}
              disabled={isLoading || podcastLoading}
              className="w-full pl-4 pr-24 py-3 bg-gray-100 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-sm placeholder-gray-500 disabled:opacity-60"
            />
            {/* --- NEW: Voice Input Button --- */}
            <button
              onClick={handleListen}
              disabled={isLoading || podcastLoading}
              title={isListening ? "Stop listening" : "Start voice input"}
              className={`absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-all duration-300 ${isListening ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
            {/* --- Send Button --- */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || podcastLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300 transition-all duration-300"
            >
              <ArrowDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FloatingChatbot;