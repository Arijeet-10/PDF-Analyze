import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, Sparkles, AlertCircle, Lightbulb, Brain, Zap, Search } from 'lucide-react';

// Modern loading animation component
const ModernLoadingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: Search, text: "Scanning documents", color: "text-blue-500" },
    { icon: Brain, text: "Processing content", color: "text-purple-500" },
    { icon: Zap, text: "Extracting insights", color: "text-emerald-500" },
    { icon: Sparkles, text: "Finalizing facts", color: "text-amber-500" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      {/* Main animation container */}
      <div className="relative mb-8">
        {/* Outer rotating ring */}
        <div className="w-24 h-24 rounded-full border-4 border-gray-200 relative">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        </div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            {React.createElement(steps[currentStep].icon, {
              className: `w-8 h-8 text-white transition-all duration-300 ${steps[currentStep].color}`
            })}
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute -inset-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
              style={{
                left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
                top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
                animation: `float ${2 + i * 0.1}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1500 ease-out"
          style={{ 
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            transform: 'translateX(-100%)',
            animation: 'slideIn 1.5s ease-out forwards'
          }}
        />
      </div>

      {/* Current step text */}
      <div className="space-y-3">
        <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analyzing Documents
        </h4>
        <div className="flex items-center justify-center gap-3">
          {React.createElement(steps[currentStep].icon, {
            className: `w-5 h-5 ${steps[currentStep].color} transition-all duration-300`
          })}
          <p className={`text-sm font-medium transition-all duration-300 ${steps[currentStep].color}`}>
            {steps[currentStep].text}
          </p>
        </div>
        <p className="text-xs text-gray-400 animate-pulse">
          This may take a few moments...
        </p>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); opacity: 0.6; }
          to { transform: translateY(-10px) scale(1.1); opacity: 0.9; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>
    </div>
  );
};

// A dedicated component for displaying different states (error, empty)
const StatusDisplay = ({ icon: Icon, title, message }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
    <Icon className="w-12 h-12 mb-4 text-gray-400" />
    <h4 className="text-lg font-semibold text-gray-700">{title}</h4>
    <p className="text-sm">{message}</p>
  </div>
);

// A component for a single fact item, enhancing text decoration
const FactListItem = ({ children }) => (
  <li className="flex items-start gap-3 py-2 border-b border-gray-200/60 last:border-b-0">
    <div className="w-5 h-5 flex-shrink-0 mt-0.5">
        <Lightbulb className="w-5 h-5 text-blue-500/80" />
    </div>
    <span className="text-gray-700 text-sm leading-relaxed">{children}</span>
  </li>
);

// A card to neatly display facts for a single file
const FactCard = ({ filename, facts }) => {
    // Check if the facts array contains a known processing error message
    const hasErrorFact = facts.length === 1 && (
        facts[0].includes("Could not process") || 
        facts[0].includes("does not contain enough text")
    );

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-black/5 shadow-sm transition-all hover:shadow-md">
            <div className="px-5 py-3 border-b border-gray-200/60">
                <h4 className="font-semibold text-sm text-gray-800 truncate flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    {filename}
                </h4>
            </div>
            <div className="p-5">
                {hasErrorFact ? (
                    <div className="flex items-center text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <p>{facts[0]}</p>
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {facts.map((fact, fIndex) => (
                            <FactListItem key={fIndex}>{fact}</FactListItem>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default function FactsWindow({ isOpen, onClose, files }) {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect to fetch facts when the window is opened or files change
  useEffect(() => {
    if (isOpen && files.length > 0) {
      const fetchFacts = async () => {
        setLoading(true);
        setError('');
        setFacts([]);

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
          const res = await fetch('http://localhost:5000/facts', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to fetch facts from the server.');
          }

          const data = await res.json();
          setFacts(data.facts);
        } catch (err) {
          console.error(err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchFacts();
    }
  }, [isOpen, files]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (loading) {
      return <ModernLoadingAnimation />;
    }

    if (error) {
      return (
        <StatusDisplay 
          icon={AlertCircle}
          title="An Error Occurred"
          message={error}
        />
      );
    }
    
    if (files.length === 0) {
        return (
            <StatusDisplay 
                icon={FileText}
                title="No Documents Provided"
                message="Please upload one or more PDF files to generate interesting facts."
            />
        );
    }

    if (facts.length > 0) {
      return (
        <div className="space-y-4">
          {facts.map((item, index) => (
            <FactCard key={index} filename={item.filename} facts={item.facts} />
          ))}
        </div>
      );
    }

    return null; // Default empty state after loading if no facts are returned
  };

  return (
    <div className="fixed bottom-6 right-6 w-[480px] max-w-[calc(100vw-3rem)] bg-white/60 backdrop-blur-2xl shadow-2xl rounded-3xl flex flex-col h-[80vh] max-h-[700px] z-50 border border-black/5 font-sans overflow-hidden">
      {/* Window Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200/70 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white/90" />
          </div>
          <h3 className="text-gray-800 font-bold text-xl">Key Facts</h3>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-800 transition-colors p-1.5 rounded-full hover:bg-gray-500/10" 
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {renderContent()}
      </div>
    </div>
  );
}