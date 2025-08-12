import React, { useState, useRef, useEffect } from 'react';
// 1. IMPORT REACT-MARKDOWN
import ReactMarkdown from 'react-markdown'; 
import { MessageCircle, Send, User, Bot, X } from 'lucide-react';

const FloatingChatbot = ({ files = [], isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
        setMessages([{ role: 'bot', text: `Ready to answer questions about ${files.length} document(s).` }]);
    }
  }, [isOpen, files]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || files.length === 0) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-slate-50 rounded-2xl shadow-xl border border-gray-200 flex flex-col h-[70vh] max-h-[700px] z-50">
      <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-white to-slate-100 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">Document Chat</h1>
        </div>
        <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-slate-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-sm ${msg.role === 'user' ? 'bg-blue-600 text-red rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}`}>
              {/* 2. RENDER THE RESPONSE WITH REACT-MARKDOWN
                - We replace the simple <p> tag.
                - `prose`: Base class for typography styles.
                - `prose-sm`: Makes text slightly smaller, fitting for a chat bubble.
                - `max-w-none`: Removes max-width from prose so it fills the bubble.
                - `prose-p:my-0`: Removes vertical margins from paragraphs for tighter spacing.
              */}
              <div className={`prose prose-sm max-w-none prose-p:my-0 ${msg.role === 'user' && 'prose-invert'}`}>
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
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
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200 rounded-b-2xl">
        <div className="flex items-center space-x-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default FloatingChatbot;