import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, Sparkles, Zap, AlertCircle } from 'lucide-react';

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
            throw new Error(errData.error || 'Failed to fetch facts.');
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

  // Helper component for individual fact list items for a cleaner look
  const FactListItem = ({ children }) => (
    <li className="flex items-start">
      <Zap className="w-4 h-4 mr-3 mt-1 text-amber-500 flex-shrink-0" />
      <span className="text-slate-600 leading-relaxed">{children}</span>
    </li>
  );

  return (
    <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden z-50 border border-slate-200/80">
      {/* Window Header */}
      <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">Interesting Facts</h3>
        </div>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700" 
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Window Content */}
      <div className="h-80 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Loader2 className="w-10 h-10 mb-3 text-slate-400 animate-spin" />
            <p className="text-sm font-medium">Analyzing documents...</p>
            <p className="text-xs text-slate-400">Extracting key information.</p>
          </div>
        )}

        {/* Global Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-4 rounded-lg">
             <AlertCircle className="w-8 h-8 mb-2" />
            <p className="font-bold">An Error Occurred</p>
            <p className="text-sm text-center">{error}</p>
          </div>
        )}
        
        {/* Empty State (No files uploaded) */}
        {!loading && !error && files.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <FileText className="w-10 h-10 mb-3 text-slate-400" />
            <p className="text-sm font-medium">No documents</p>
            <p className="text-xs text-slate-400 text-center">Upload PDFs to generate facts.</p>
          </div>
        )}

        {/* Success State (Displaying Facts) */}
        {!loading && !error && facts.length > 0 && (
          <div className="space-y-4">
            {facts.map((item, index) => {
               // Check if the facts array contains a known processing error message
               const hasErrorFact = item.facts.length === 1 && (
                 item.facts[0].includes("Could not process") || 
                 item.facts[0].includes("does not contain enough text")
               );

              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200/80 overflow-hidden">
                  {/* Card Header with Filename */}
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                    <h4 className="font-medium text-sm text-slate-700 truncate flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />
                      {item.filename}
                    </h4>
                  </div>
                  
                  {/* Card Body with Facts or Error */}
                  <div className="p-4">
                    {hasErrorFact ? (
                       <div className="flex items-center text-sm text-slate-500">
                         <AlertCircle className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                         <p>{item.facts[0]}</p>
                       </div>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {item.facts.map((fact, fIndex) => (
                          <FactListItem key={fIndex}>{fact}</FactListItem>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}