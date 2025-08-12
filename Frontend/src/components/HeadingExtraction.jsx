import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  PlusCircle,
  X,
  BookOpen,
  MessageCircle,
  FileUp,
  FileCheck2,
  ListTree,
  FileX2,
} from "lucide-react";
import FloatingChatbot from "./FloatingChatbot"; // Make sure path is correct

// A professional, modern UI for the PDF Document Analyzer
const HeadingExtraction = () => {
  // --- STATE AND REFS (Original logic preserved) ---
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrls, setPdfUrls] = useState({});
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState("upload");
  const [expandedDocs, setExpandedDocs] = useState({});
  const [isAdobeLoaded, setIsAdobeLoaded] = useState(false);
  const [highlightAnnotationId, setHighlightAnnotationId] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const pdfViewerRef = useRef(null);
  const fileInputRef = useRef(null);
  const adobeApiRef = useRef(null);

  const ADOBE_CLIENT_ID = "628c0718047f4a0eaaccc8a09c8e3130"; // Replace with your Adobe Client ID

  // --- EFFECTS (Original logic preserved) ---
  useEffect(() => {
    const loadAdobeAPI = () => {
      if (window.AdobeDC) {
        setIsAdobeLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://documentservices.adobe.com/view-sdk/viewer.js";
      script.onload = () => setIsAdobeLoaded(true);
      script.onerror = () =>
        console.error("Failed to load Adobe PDF Embed API");
      document.head.appendChild(script);
    };
    loadAdobeAPI();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(pdfUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pdfUrls]);

  useEffect(() => {
    if (selectedPdf && isAdobeLoaded) {
      initializeAdobeViewer(selectedPdf.file, selectedPdf.targetPage);
    } else if (!selectedPdf && pdfViewerRef.current) {
      pdfViewerRef.current.innerHTML = "";
      adobeApiRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPdf, isAdobeLoaded]);

  // --- CORE FUNCTIONS (Original logic preserved) ---
  const getFileByName = (filename) => {
    return files.find((file) => file.name === filename);
  };
  
  const initializeAdobeViewer = (file, targetPage = 1) => {
    if (!isAdobeLoaded || !window.AdobeDC || !file) {
      console.error("Adobe API not loaded or no file provided.");
      return;
    }

    if (pdfViewerRef.current) {
      pdfViewerRef.current.innerHTML = "";
    }

    try {
      const adobeDCView = new window.AdobeDC.View({
        clientId: ADOBE_CLIENT_ID,
        divId: pdfViewerRef.current.id,
      });

      const previewFilePromise = adobeDCView.previewFile(
        {
          content: { promise: file.arrayBuffer() },
          metaData: { fileName: file.name },
        },
        {
          embedMode: "SIZED_CONTAINER",
          showAnnotationTools: false,
          showLeftHandPanel: false,
          showDownloadPDF: true,
          showPrintPDF: true,
          defaultViewMode: "FIT_PAGE",
        }
      );

      previewFilePromise
        .then((adobeViewer) => {
          adobeApiRef.current = adobeViewer;
          adobeViewer.getAPIs().then((apis) => {
            apis.gotoLocation(targetPage);
          });
        })
        .catch((e) => console.error("Error during PDF preview:", e));
    } catch (error) {
      console.error("Error initializing Adobe PDF viewer:", error);
      setMessage(
        "Could not display PDF. Ensure the Adobe Client ID is correct and the domain is registered."
      );
    }
  };

  const addFilesToList = (newFiles) => {
    const uniqueNewFiles = newFiles.filter(
      (newFile) => !files.some((existingFile) => existingFile.name === newFile.name)
    );

    if (uniqueNewFiles.length === 0) return;

    setFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);

    const newUrls = {};
    uniqueNewFiles.forEach((file) => {
      if (file.type === "application/pdf") {
        newUrls[file.name] = URL.createObjectURL(file);
      }
    });
    setPdfUrls((prev) => ({ ...prev, ...newUrls }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      addFilesToList(Array.from(e.target.files));
      e.target.value = null;
    }
  };

  const handleRemoveFile = (fileNameToRemove) => {
    const urlToRevoke = pdfUrls[fileNameToRemove];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileNameToRemove)
    );
    setPdfUrls((prevUrls) => {
      const newUrls = { ...prevUrls };
      delete newUrls[fileNameToRemove];
      return newUrls;
    });
  };

  const handleHeadingClick = async (doc, heading) => {
    const file = getFileByName(doc.filename);
    if (!file) {
      console.error("Could not find file:", doc.filename);
      return;
    }
  
    const isSameDoc = selectedPdf?.file.name === file.name;
    setSelectedPdf({ file, targetPage: heading.page + 1 });
  
    setTimeout(async () => {
      if (!adobeApiRef.current) {
        console.error("Adobe Viewer API is not available.");
        return;
      }
  
      try {
        const apis = await adobeApiRef.current.getAPIs();
  
        if (highlightAnnotationId) {
          await apis.removeAnnotations([highlightAnnotationId]);
          setHighlightAnnotationId(null);
        }
  
        const searchResults = await apis.search(heading.text);
        
        const resultOnPage = searchResults.find(r => r.page_num === heading.page + 1);
  
        if (resultOnPage && resultOnPage.quads.length > 0) {
          const [newAnnotation] = await apis.addAnnotations([
            {
              type: "HIGHLIGHT",
              page: heading.page + 1,
              quadPoints: resultOnPage.quads[0],
              color: [255, 215, 0], // Yellow
              opacity: 0.5,
            },
          ]);
          setHighlightAnnotationId(newAnnotation.id);
          apis.gotoLocation(heading.page + 1, resultOnPage.quads[0][0], resultOnPage.quads[0][1]);
        } else {
          console.warn(
            `Could not find text "${heading.text}" on page ${
              heading.page + 1
            } to highlight.`
          );
          apis.gotoLocation(heading.page + 1);
        }
      } catch (error) {
        console.error("Error during text highlighting:", error);
      }
    }, isSameDoc ? 100 : 500);
  };
  
  const toggleExpand = (filename) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [filename]: !prev[filename],
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === "application/pdf"
      );
      addFilesToList(droppedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one PDF file to analyze.");
      return;
    }
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setIsLoading(true);
      setMessage("Processing your documents... This may take a moment.");

      const response = await fetch("http://localhost:8000/api/pdf-outline", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setResults(data || []);
      setMessage("Extraction completed successfully!");
      setIsLoading(false);

      const initialExpandedState = {};
      if (data) {
        data.forEach((doc) => {
          initialExpandedState[doc.filename] = true;
        });
      }
      setExpandedDocs(initialExpandedState);
      setCurrentPage("results");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`Failed to process documents: ${error.message}`);
      setIsLoading(false);
    }
  };

  const openPdfInNewTab = (filename, page = 0) => {
    const pdfUrl = pdfUrls[filename];
    if (pdfUrl) {
      window.open(`${pdfUrl}#page=${page + 1}`, "_blank");
    }
  };

  const getIndentLevelClass = (levelStr) => {
    if (typeof levelStr !== 'string') return 'pl-0';
    const level = parseInt(levelStr.replace("H", ""), 10);
    if (isNaN(level) || level <= 1) return 'pl-3';
    return `pl-${(level - 1) * 4 + 3}`; // e.g., H2 -> pl-7, H3 -> pl-11
  };
  
  const getHeadingTextStyle = (levelStr) => {
    if (typeof levelStr !== 'string') return 'text-slate-600';
    const level = parseInt(levelStr.replace("H", ""), 10);
    switch (level) {
      case 1: return 'text-slate-800 font-semibold text-sm';
      case 2: return 'text-slate-700 font-medium text-sm';
      default: return 'text-slate-600 text-sm';
    }
  };

  const goBackToUpload = () => {
    setCurrentPage("upload");
    setSelectedPdf(null);
    setResults([]);
    Object.values(pdfUrls).forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setPdfUrls({});
    setMessage("");
    setHighlightAnnotationId(null);
    setIsChatbotOpen(false);
  };
  
  const clearAllFiles = () => {
      Object.values(pdfUrls).forEach(url => URL.revokeObjectURL(url));
      setFiles([]);
      setPdfUrls({});
      setMessage("");
  }
  
  // --- UI COMPONENTS ---

  const UploadScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-xl p-3 mb-4">
            <ListTree className="w-10 h-10" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Document Outline Extractor
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">
            Instantly generate a clickable table of contents for any PDF document.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200">
          <div
            className={`relative p-8 border-2 border-dashed rounded-t-2xl transition-all duration-300 ${
              dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-slate-400"
            }`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <input
              ref={fileInputRef} type="file" accept="application/pdf" multiple
              onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <FileUp className={`w-12 h-12 mb-4 transition-colors ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <p className="text-lg font-semibold text-slate-700">
                Drag & drop PDFs here, or{' '}
                <span className="text-indigo-600 font-bold">browse your files</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">Supports multiple PDF files up to 50MB each.</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-slate-800">
                  Upload Queue ({files.length})
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add More</span>
                  </button>
                  <button onClick={clearAllFiles} className="text-sm text-slate-500 hover:text-red-600 font-medium">
                    Clear All
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 -mr-2">
                {files.map((file) => (
                  <div key={file.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="flex items-center space-x-3 min-w-0">
                      <FileText className="w-6 h-6 text-red-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate text-sm">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                      <button onClick={() => openPdfInNewTab(file.name)} className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors rounded-md hover:bg-slate-200" title="Preview PDF">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRemoveFile(file.name)} className="p-1.5 text-slate-500 hover:text-red-600 transition-colors rounded-md hover:bg-slate-200" title="Remove File">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 bg-slate-50/70 border-t border-slate-200 rounded-b-2xl">
            {message && !isLoading && (
              <div className={`mb-4 p-3 rounded-lg border flex items-start space-x-3 text-sm ${message.includes('Failed') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                {message.includes('Failed') ? <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                <span className="leading-snug">{message}</span>
              </div>
            )}
             <button
                onClick={handleUpload}
                disabled={files.length === 0 || isLoading}
                className="w-full h-12 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 text-base shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-5 h-5" />
                    <span>Generate Outlines</span>
                  </>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultsScreen = () => (
    <div className="h-screen bg-slate-50 flex flex-col">
       <header className="bg-white border-b border-slate-200 sticky top-0 z-30 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ListTree className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900 hidden sm:block">
                Analysis Results
              </h1>
            </div>
            <button
              onClick={goBackToUpload}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        {/* Left Panel: Document Outlines */}
        <aside className="w-full lg:w-1/2 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-slate-800">Document Outlines</h2>
                <p className="text-sm text-slate-500">{results.length} document(s) analyzed.</p>
            </div>
            <div className="overflow-y-auto space-y-2 p-2">
            {results.map((doc, idx) => (
                <div key={idx} className="bg-slate-50/80 rounded-lg">
                <button
                    onClick={() => toggleExpand(doc.filename)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100 transition-colors rounded-lg"
                >
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">{doc.filename}</h3>
                        <p className="text-xs text-slate-500">{doc.outline?.outline?.length || 0} headings</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${expandedDocs[doc.filename] ? 'rotate-180' : ''}`} />
                </button>
                {expandedDocs[doc.filename] && (
                    <div className="pb-2 px-1">
                    {doc.outline?.outline?.length > 0 ? (
                        <div className="space-y-0.5 mt-1 border-t border-slate-200 pt-2">
                        {doc.outline.outline.map((heading, hIdx) => (
                            <button
                            key={hIdx}
                            onClick={() => handleHeadingClick(doc, heading)}
                            className={`w-full flex items-start text-left py-1.5 rounded-md hover:bg-indigo-50 transition-colors group ${getIndentLevelClass(heading.level)}`}
                            >
                            <span className={`flex-1 truncate group-hover:text-indigo-700 transition-colors ${getHeadingTextStyle(heading.level)}`}>
                                {heading.text}
                            </span>
                            <span className="ml-2 text-xs text-slate-400 font-mono group-hover:text-indigo-500 transition-colors pr-2">
                                P.{heading.page + 1}
                            </span>
                            </button>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 px-4">
                            <FileX2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm font-medium">No headings found.</p>
                        </div>
                    )}
                    </div>
                )}
                </div>
            ))}
            </div>
        </aside>

        {/* Right Panel: PDF Viewer */}
        <section className="w-full lg:w-1/2 flex bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 flex-col overflow-hidden">
          {selectedPdf ? (
            <>
              <div className="p-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
                  <h3 className="text-sm font-semibold text-slate-800 truncate px-2">{selectedPdf.file.name}</h3>
                <button
                  onClick={() => { setSelectedPdf(null); setHighlightAnnotationId(null); }}
                  className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors rounded-md hover:bg-slate-200"
                  aria-label="Close PDF Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 bg-slate-100 min-h-0">
                <div id="adobe-pdf-viewer" ref={pdfViewerRef} className="w-full h-full">
                  {!isAdobeLoaded && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-slate-600">
                        <Loader2 className="mx-auto h-8 w-8 text-indigo-600 mb-3 animate-spin" />
                        <p className="font-medium">Loading PDF Viewer...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-50/50 p-8">
                <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-200">
                        <BookOpen className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">Document Viewer</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                        Select a heading from the list to preview the document here.
                    </p>
                </div>
            </div>
          )}
        </section>
      </main>
      
      {/* Floating Chatbot */}
      {files.length > 0 && !isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-all z-40 transform hover:scale-110"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}
      <FloatingChatbot 
        files={files} 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </div>
  );

  return currentPage === "upload" ? <UploadScreen /> : <ResultsScreen />;
};

export default HeadingExtraction;