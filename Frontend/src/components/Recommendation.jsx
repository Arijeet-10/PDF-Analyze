import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Clock, Eye, ChevronDown, ChevronRight, Star, MapPin, Book, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

// Main Component
const Recommendation = () => {
  // State for inputs and files
  const [persona, setPersona] = useState('');
  const [task, setTask] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // This will be our single source of truth for files

  // State for results and loading
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  // --- NEW: State for Adobe PDF Embed API Viewer ---
  const [selectedPdf, setSelectedPdf] = useState({ file: null, targetPage: 1 });
  const [isAdobeLoaded, setIsAdobeLoaded] = useState(false);
  const pdfViewerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Replace with your actual Adobe PDF Embed API Client ID
  const ADOBE_CLIENT_ID = "628c0718047f4a0eaaccc8a09c8e3130";

  // --- Adobe PDF Embed API Script Loading ---
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

  // --- Core PDF Viewer Logic (using Adobe API) ---
  useEffect(() => {
    const initializeAdobeViewer = (file, targetPage) => {
      if (!isAdobeLoaded || !window.AdobeDC || !file || !pdfViewerRef.current) {
        return;
      }

      // Clear the container before rendering a new PDF
      pdfViewerRef.current.innerHTML = '';

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
            embedMode: 'SIZED_CONTAINER',
            showAnnotationTools: false,
            showLeftHandPanel: true,
            showDownloadPDF: true,
            showPrintPDF: true,
          }
        );

        // Use the promise to reliably navigate after the document is loaded
        previewFilePromise.then(viewer => {
          if (targetPage > 1) {
            viewer.getAPIs().then(apis => {
              apis.gotoLocation(targetPage);
            });
          }
        });

      } catch (error) {
        console.error('Error initializing Adobe PDF viewer:', error);
        alert('Could not initialize the Adobe PDF viewer. Check your Client ID and domain settings.');
      }
    };

    if (selectedPdf.file) {
      initializeAdobeViewer(selectedPdf.file, selectedPdf.targetPage);
    } else if (pdfViewerRef.current) {
      // Clear viewer if no PDF is selected
      pdfViewerRef.current.innerHTML = '<div class="p-8 text-center text-gray-500">Select a section to view the source PDF here.</div>';
    }
  }, [selectedPdf, isAdobeLoaded]);


  // --- UI Handlers ---

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };
  
  // *** NEW: Function to normalize filenames for robust matching ***
  const normalizeFileName = (name) => {
    if (!name) return '';
    return name
      .replace(/\.pdf$/i, '') // Remove .pdf extension
      .replace(/[_\s-]+/g, ' ') // Replace underscores, spaces, and dashes with a single space
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim()
      .toLowerCase();
  };


  const removeFile = (fileNameToRemove) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter(file => file.name !== fileNameToRemove);
      // If the removed file was the one being viewed, clear the viewer
      if (selectedPdf.file?.name === fileNameToRemove) {
        setSelectedPdf({ file: null, targetPage: 1 });
      }
      return newFiles;
    });
  };

  const handleAnalyze = async () => {
    if (!persona || !task || uploadedFiles.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('persona', persona);
      formData.append('job', task);
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:8000/semantic/process-pdfs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis request failed');
      const data = await response.json();
      setAnalysisResults(data);
      // Clear the selected PDF when new results are loaded
      setSelectedPdf({ file: null, targetPage: 1 });
    } catch (error) {
      console.error('Error during analysis:', error);
      alert('An error occurred during analysis. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  // *** MODIFIED: Use normalizeFileName for robust matching ***
  const navigateToPage = (fileName, pageNumber) => {
    const normalizedFileName = normalizeFileName(fileName);
    const fileToLoad = uploadedFiles.find(f => normalizeFileName(f.name) === normalizedFileName);
    
    if (fileToLoad) {
      setSelectedPdf({ file: fileToLoad, targetPage: pageNumber });
    } else {
      alert(`PDF "${fileName}" not found. Please ensure it is uploaded.`);
      console.log("Available files:", uploadedFiles.map(f => f.name));
      console.log("Normalized search:", normalizedFileName);
      console.log("Normalized available files:", uploadedFiles.map(f => normalizeFileName(f.name)));
    }
  };

  // Helper for styling score badges
  const getScoreColor = (score) => {
    if (score >= 0.4) return 'text-green-600 bg-green-100';
    if (score >= 0.35) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Helper for styling rank badges
  const getRankBadgeColor = (rank) => {
    if (rank <= 2) return 'bg-yellow-400 text-yellow-900';
    if (rank <= 4) return 'bg-gray-400 text-white';
    return 'bg-amber-600 text-white';
  };

  // --- Render Methods for UI Sections ---

  const renderUploadForm = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Persona</label>
          <input
            type="text"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="e.g., Tourist, Business Traveler"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Task to be Done</label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g., Plan a 4-day trip, Find best restaurants"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDFs</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Click or drag to upload PDF files</p>
        </div>
        <input ref={fileInputRef} type="file" multiple accept=".pdf" onChange={handleFileUpload} className="hidden" />
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center truncate">
                  <FileText className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                </div>
                <button onClick={() => removeFile(file.name)} className="text-red-600 hover:text-red-800 text-sm ml-4">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleAnalyze}
        disabled={loading || !persona || !task || uploadedFiles.length === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Analyzing...' : 'Analyze PDFs'}
      </button>
    </div>
  );

  const renderResults = () => {
    // *** MODIFIED: Combine and slice data for rendering ***
    const topResults = analysisResults.data.extracted_sections
      .slice(0, 3)
      .map((section, index) => ({
        ...section,
        // Assuming a 1-to-1 mapping between extracted_sections and subsection_analysis
        refined_text: analysisResults.data.subsection_analysis[index]?.refined_text || 'No detailed summary available.',
      }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Analysis */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
            <button onClick={() => { setAnalysisResults(null); setUploadedFiles([]); setSelectedPdf({ file: null, targetPage: 1 }); }} className="text-sm text-blue-600 hover:text-blue-800">New Analysis</button>
          </div>
          
          {/* *** MODIFIED: Render combined top 3 results *** */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><Star className="h-5 w-5 text-yellow-500 mr-2" />Top 3 Relevant Sections</h3>
            <div className="space-y-4">
              {topResults.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(section.importance_rank)}`}>#{section.importance_rank}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(section.similarity_score)}`}>{(section.similarity_score * 100).toFixed(1)}%</span>
                      </div>
                      <button onClick={() => navigateToPage(section.document, section.page_number)} className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        <MapPin className="h-4 w-4 mr-1" />Page {section.page_number}
                      </button>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{section.section_title} {section.refined_text}</h4>
                    <div className="text-sm text-gray-600 flex items-center"><FileText className="h-4 w-4 mr-1" />{section.document}</div>
                  </div>
                  
                  {/* <div className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => setExpandedSection(expandedSection === index ? null : index)}>
                     <div className="flex items-center justify-between text-sm font-medium text-blue-700">
                        <span>Detailed Summary</span>
                        {expandedSection === index ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                     </div>
                  </div> */}

                  {expandedSection === index && (
                    <div className="p-4 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{section.refined_text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: PDF Viewer */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center"><Eye className="h-5 w-5 text-green-500 mr-2" />Source Document</h3>
            <span className="text-sm text-gray-600 truncate font-medium">{selectedPdf.file?.name || 'No PDF Selected'}</span>
          </div>
          <div className="p-4">
            <div
              id="adobe-pdf-viewer"
              ref={pdfViewerRef}
              className="border border-gray-300 rounded-lg bg-gray-50"
              style={{ height: '75vh' }}
            >
              <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
                  {isAdobeLoaded ? 'Select a section to view the source PDF here.' : 'Loading PDF viewer...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Semantic PDF Analysis</h1>
            <p className="text-gray-600">Analyze PDFs based on your persona and task.</p>
             {ADOBE_CLIENT_ID === "YOUR_ADOBE_CLIENT_ID_HERE" && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Please replace YOUR_ADOBE_CLIENT_ID_HERE with your actual Adobe PDF Embed API Client ID to enable PDF viewing.
                  </p>
                </div>
              )}
          </div>
          {!analysisResults ? renderUploadForm() : null}
        </div>
        {analysisResults && renderResults()}
      </div>
    </div>
  );
};

export default Recommendation;
