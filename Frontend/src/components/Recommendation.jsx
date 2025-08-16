import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Clock, Eye, MapPin, X, Plus, BrainCircuit, MessageCircle, ArrowLeft } from 'lucide-react';

// --- Placeholder for FloatingChatbot Component ---
// A placeholder is used here because the actual implementation was not provided.
// This allows the main application to run without errors.
const FloatingChatbot = ({ isOpen, onClose, files }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50">
      <div className="p-4 bg-indigo-600 text-white rounded-t-xl flex justify-between items-center">
        <h3 className="font-bold">Chat with Documents</h3>
        <button onClick={onClose} className="p-1 hover:bg-indigo-700 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="text-center text-slate-500 mt-8">
          <p>Chatbot UI</p>
          <p className="text-sm">Files available: {files.length}</p>
        </div>
      </div>
      <div className="p-2 border-t border-slate-200">
        <input
          type="text"
          placeholder="Ask a question..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>
    </div>
  );
};


// --- Main Recommendation Component ---
const Recommendation = () => {
  // --- STATE AND REFS ---
  const [persona, setPersona] = useState('');
  const [task, setTask] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState({ file: null, targetPage: 1 });
  const [isAdobeLoaded, setIsAdobeLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State for Adobe API object and selected text feature
  const [adobeApi, setAdobeApi] = useState(null);
  const [selectedText, setSelectedText] = useState('');

  // State for similar snippets feature
  const [similarSnippets, setSimilarSnippets] = useState(null);
  const [isSearchingSnippets, setIsSearchingSnippets] = useState(false);
  const [snippetSearchError, setSnippetSearchError] = useState('');

  const pdfViewerRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- CONFIGURATION ---
  // IMPORTANT: Replace "" with your actual Adobe Client ID.
  // const ADOBE_CLIENT_ID = import.meta.env.VITE_ADOBE_CLIENT_ID_LH; // import.meta.env.VITE_ADOBE_CLIENT_ID_LH;
  const ADOBE_CLIENT_ID = import.meta.env.VITE_ADOBE_CLIENT_ID_PROD; // import.meta.env.VITE_ADOBE_CLIENT_ID_LH;


  // --- EFFECTS ---
  // Load Adobe PDF Embed API script
  useEffect(() => {
    const loadAdobeAPI = () => {
      if (window.AdobeDC) {
        setIsAdobeLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://documentservices.adobe.com/view-sdk/viewer.js';
      script.onload = () => setIsAdobeLoaded(true);
      script.onerror = () => console.error('Failed to load Adobe PDF Embed API');
      document.head.appendChild(script);
    };
    loadAdobeAPI();
  }, []);

  // Initialize or clear the Adobe PDF viewer when the selected PDF or API readiness changes
  useEffect(() => {
    const initializeAdobeViewer = (file, targetPage) => {
      if (!isAdobeLoaded || !window.AdobeDC || !file || !pdfViewerRef.current) {
        return;
      }

      if (!ADOBE_CLIENT_ID) {
        console.error("Adobe Client ID is not set. PDF viewer cannot be initialized.");
        pdfViewerRef.current.innerHTML = `<div class="p-8 text-center text-red-500 h-full flex items-center justify-center"><span>Adobe Client ID is missing. Please add it to the code.</span></div>`;
        return;
      }

      pdfViewerRef.current.innerHTML = ''; // Clear previous instance
      setAdobeApi(null); // Reset API object
      setSelectedText(''); // Reset selected text

      try {
        const adobeDCView = new window.AdobeDC.View({
          clientId: ADOBE_CLIENT_ID,
          divId: pdfViewerRef.current.id,
        });

        const previewFilePromise = adobeDCView.previewFile({
          content: { promise: file.arrayBuffer() },
          metaData: { fileName: file.name },
        }, {
          embedMode: 'SIZED_CONTAINER',
          showAnnotationTools: true, // Enable for text selection and other tools
          showLeftHandPanel: true,
          showDownloadPDF: true,
          showPrintPDF: true,
        });

        previewFilePromise.then(viewer => {
          viewer.getAPIs().then(apis => {
            setAdobeApi(apis);
            if (targetPage > 1) {
              apis.gotoLocation(targetPage);
            }
          });
        });

      } catch (error) {
        console.error('Error initializing Adobe PDF viewer:', error);
        setErrorMessage('Could not initialize the Adobe PDF viewer.');
      }
    };

    if (selectedPdf.file) {
      initializeAdobeViewer(selectedPdf.file, selectedPdf.targetPage);
    } else if (pdfViewerRef.current) {
      pdfViewerRef.current.innerHTML = `<div class="p-8 text-center text-slate-500 h-full flex items-center justify-center"><span>${isAdobeLoaded ? 'Select a section to view the source PDF here.' : 'Loading PDF viewer...'}</span></div>`;
      setAdobeApi(null); // Clear API object if no file
      setSelectedText('');
    }
  }, [selectedPdf, isAdobeLoaded, ADOBE_CLIENT_ID]);

  // --- API HANDLERS & UI HANDLERS ---
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const uniqueNewFiles = newFiles.filter(
      newFile => !uploadedFiles.some(existingFile => existingFile.name === newFile.name)
    );
    
    if (uniqueNewFiles.length) {
      const updatedFiles = [...uploadedFiles, ...uniqueNewFiles];
      setUploadedFiles(updatedFiles);
      window.dispatchEvent(new CustomEvent('filesUpdated', { detail: { files: updatedFiles } }));
    }
  };

  const removeFile = (fileNameToRemove) => {
    const newFiles = uploadedFiles.filter(file => file.name !== fileNameToRemove);
    setUploadedFiles(newFiles);
    window.dispatchEvent(new CustomEvent('filesUpdated', { detail: { files: newFiles } }));
    
    if (selectedPdf.file?.name === fileNameToRemove) {
      setSelectedPdf({ file: null, targetPage: 1 });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  


  const handleGetTextAndFindSnippets = async () => {
  try {
    // Step 1: Get selected text
    if (!adobeApi) {
      setSelectedText("Viewer API is not ready.");
      return;
    }

    const result = await adobeApi.getSelectedContent();
    const capturedText = result?.data || "No text was selected.";
    setSelectedText(capturedText);

    // Step 2: Only proceed if text exists
    if (!capturedText || !selectedPdf.file) {
      setSnippetSearchError("Please select some text from a PDF first.");
      return;
    }

    // Step 3: Call snippet search
    setIsSearchingSnippets(true);
    setSimilarSnippets(null);
    setSnippetSearchError("");

    const formData = new FormData();
    formData.append("query_text", capturedText);
    formData.append("current_document_name", selectedPdf.file.name);
    uploadedFiles.forEach(file => formData.append("files", file));

    const response = await fetch("https://arijeey-10-pdf-analyze-backend.hf.space/semantic/find-similar-snippets", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Snippet search failed with status: ${response.status}`);
    }

    const data = await response.json();
    setSimilarSnippets(data);

  } catch (error) {
    console.error("Error in combined function:", error);
    setSnippetSearchError(`An error occurred: ${error.message}`);
  } finally {
    setIsSearchingSnippets(false);
  }
};


  const normalizeFileName = (name) => {
    if (!name) return '';
    return name.replace(/\.pdf$/i, '').replace(/[_\s-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  };

  const handleAnalyze = async () => {
    if (!persona || !task || uploadedFiles.length === 0) {
      setErrorMessage("Please define a persona, a task, and upload at least one document.");
      return;
    }
    setLoading(true);
    setAnalysisResults(null);
    setSelectedPdf({ file: null, targetPage: 1 });
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('persona', persona);
      formData.append('job', task);
      uploadedFiles.forEach(file => formData.append('files', file));

      // NOTE: Replace with your actual API endpoint if different
      const response = await fetch('https://arijeey-10-pdf-analyze-backend.hf.space/semantic/process-pdfs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Analysis request failed with status: ${response.status}`);
      }
      const data = await response.json();
      setAnalysisResults(data);
    } catch (error) {
      console.error('Error during analysis:', error);
      setErrorMessage(`An error occurred during analysis: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPage = (fileName, pageNumber) => {
    const normalizedFileName = normalizeFileName(fileName);
    const fileToLoad = uploadedFiles.find(f => normalizeFileName(f.name) === normalizedFileName);

    if (fileToLoad) {
      setSelectedPdf({ file: fileToLoad, targetPage: pageNumber });
    } else {
      setErrorMessage(`PDF "${fileName}" not found. Please ensure it is uploaded.`);
    }
  };
  
  const resetAnalysis = () => {
    setAnalysisResults(null);
    setUploadedFiles([]);
    setPersona('');
    setTask('');
    setSelectedPdf({ file: null, targetPage: 1 });
    setIsChatbotOpen(false);
    setErrorMessage('');
    setSelectedText('');
    setAdobeApi(null);
    setSimilarSnippets(null);
    setSnippetSearchError('');
    window.dispatchEvent(new CustomEvent('filesUpdated', { detail: { files: [] } }));
  };

  // --- HELPER FUNCTIONS FOR STYLING ---
  const getRankBadgeColor = (rank) => {
    if (rank <= 2) return 'bg-yellow-400 text-yellow-900';
    if (rank <= 4) return 'bg-slate-400 text-white';
    return 'bg-amber-600 text-white';
  };
  
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        {/* --- INPUT AND UPLOAD FORM --- */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">Semantic PDF Recommendation Engine</h1>
            <p className="text-slate-600 mt-1">Upload travel guides or reports. Define your persona and task to find the most relevant sections instantly.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Persona</label>
                <input type="text" value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="e.g., Avid Hiker, Culinary Tourist" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Task to be Done</label>
                <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g., Find challenging trails, Discover local cuisine" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"/>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Source Documents ({uploadedFiles.length})</label>
                <button onClick={triggerFileUpload} className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800"><Plus className="h-4 w-4" /> Add Files</button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf" onChange={handleFileChange} className="hidden" />
              {uploadedFiles.length === 0 ? (
                <div onClick={triggerFileUpload} className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-500 cursor-pointer transition-colors bg-slate-50">
                  <Upload className="mx-auto h-10 w-10 text-slate-400 mb-4" />
                  <p className="text-slate-600 font-semibold">Click or drag to upload PDFs</p>
                  <p className="text-sm text-slate-500">Add one or more PDF files to analyze.</p>
                </div>
              ) : (
                <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm border border-slate-200">
                      <div className="flex items-center truncate gap-2">
                        <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <span className="text-sm text-slate-800 font-medium truncate" title={file.name}>{file.name}</span>
                      </div>
                      <button onClick={() => removeFile(file.name)} className="p-1 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}
            <button onClick={handleAnalyze} disabled={loading || !persona || !task || uploadedFiles.length === 0} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
              {loading ? (<> <Clock className="h-5 w-5 animate-spin"/> Analyzing... </>) : (<> <BrainCircuit className="h-5 w-5"/> Analyze PDFs </>)}
            </button>
          </div>
        </div>

        {/* --- RESULTS SECTION --- */}
        {analysisResults && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Analysis Results</h2>
                  <p className="text-sm text-slate-500 mt-1">Showing top sections relevant to your task.</p>
                </div>
                <button onClick={resetAnalysis} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"><ArrowLeft className="h-4 w-4"/> New Analysis</button>
              </div>
              <div className="space-y-4">
                {analysisResults.data.extracted_sections.slice(0, 3).map((section, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                    <div className="p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(section.importance_rank)}`}>Rank #{section.importance_rank}</span>
                        </div>
                        <button onClick={() => navigateToPage(section.document, section.page_number)} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex-shrink-0 ml-2"><MapPin className="h-4 w-4 mr-1" />Page {section.page_number}</button>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-base">{section.section_title} {analysisResults.data.subsection_analysis[index]?.refined_text || 'No detailed summary available.'}</h4>
                      <p className="text-xs text-slate-500 flex items-center mt-3 truncate"><FileText className="h-3 w-3 mr-1.5" />{section.document}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200 h-fit sticky top-6">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center"><Eye className="h-5 w-5 text-indigo-500 mr-2" />Source Document</h3>
                <p className="text-sm text-slate-600 truncate font-medium mt-1" title={selectedPdf.file?.name}>{selectedPdf.file?.name || 'No PDF Selected'}</p>
              </div>
              <div className="p-2">
                <div id="adobe-pdf-viewer" ref={pdfViewerRef} className="border border-slate-300 rounded-lg bg-slate-50" style={{ height: '75vh' }}>
                  {/* This div is managed by the Adobe Viewer useEffect */}
                </div>
              </div>
                  
              {/* --- Get Selected Text & Find Snippets UI --- */}
              {adobeApi && (
                <div className="p-4 border-t border-slate-200 space-y-3">
                  
                  <button
  onClick={handleGetTextAndFindSnippets}
  disabled={isSearchingSnippets}
  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
>
  {isSearchingSnippets ? (
    <> <Clock className="h-4 w-4 animate-spin" /> Searching... </>
  ) : (
    <> <BrainCircuit className="h-4 w-4" /> Get Snippets </>
  )}
</button>

                  {selectedText && (
                    <>
                      <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700">
                        <p className="font-semibold mb-1">Captured Text:</p>
                        <p className="italic">"{selectedText}"</p>
                      </div>
                      
                    </>
                  )}
                </div>
              )}

              {/* --- Similar Snippets Results Section --- */}
              {(isSearchingSnippets || snippetSearchError || similarSnippets) && (
                <div className="p-4 border-t border-slate-200">
                  <h4 className="text-md font-bold text-slate-800 mb-3">Similar Snippets</h4>
                  {isSearchingSnippets && (
                    <div className="text-center p-4 text-slate-600">Searching for related content...</div>
                  )}
                  {snippetSearchError && (
                    <p className="text-red-600 text-sm p-2 bg-red-50 rounded-md">{snippetSearchError}</p>
                  )}
                  {similarSnippets?.data?.snippets && (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {similarSnippets.data.snippets.length > 0 ? (
                        similarSnippets.data.snippets.map((snippet, index) => (
                          <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-sm text-slate-800 mb-2 italic">"{snippet.text}"</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium truncate" title={snippet.document_name}>
                                <FileText className="h-3 w-3 inline-block mr-1.5" />
                                {snippet.document_name}
                              </span>
                              <button
                                onClick={() => navigateToPage(snippet.document_name, snippet.page_number)}
                                className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0 ml-2"
                              >
                                <MapPin className="h-3 w-3" />
                                Page {snippet.page_number}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 p-2">No similar snippets found across the documents.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Floating Chat Button --- */}
        {uploadedFiles.length > 0 && !isChatbotOpen && (
          <button onClick={() => setIsChatbotOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-all z-40 transform hover:scale-110" aria-label="Open Chat">
            <MessageCircle className="w-8 h-8" />
          </button>
        )}
        <FloatingChatbot files={uploadedFiles} isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      </div>
    </div>
  );
};

export default Recommendation;