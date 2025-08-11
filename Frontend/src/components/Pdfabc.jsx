import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Clock, Database, Eye, ChevronDown, ChevronRight, Star, MapPin, Book, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

const Pdfabc = () => {
  const [persona, setPersona] = useState('');
  const [task, setTask] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [pdfStorage, setPdfStorage] = useState({});
  const [adobeDCView, setAdobeDCView] = useState(null);
  const [isAdobeLoaded, setIsAdobeLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const pdfViewerRef = useRef(null);

  // Replace with your actual Adobe PDF Embed API Client ID
  const ADOBE_CLIENT_ID = "YOUR_ADOBE_CLIENT_ID_HERE";

  // Load Adobe PDF Embed API
  useEffect(() => {
    const loadAdobeAPI = () => {
      if (window.AdobeDC) {
        setIsAdobeLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://documentservices.adobe.com/view-sdk/viewer.js';
      script.onload = () => {
        setIsAdobeLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Adobe PDF Embed API');
      };
      document.head.appendChild(script);
    };

    loadAdobeAPI();
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Store PDFs in memory
    for (const file of files) {
      await storePdfInMemory(file);
    }
  };

  // Store PDF in memory
  const storePdfInMemory = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      setPdfStorage(prev => ({
        ...prev,
        [file.name]: {
          data: uint8Array,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          url: URL.createObjectURL(file) // Create blob URL for Adobe API
        }
      }));
    } catch (error) {
      console.error('Error storing PDF:', error);
    }
  };

  // Get PDF from storage
  const getPdfFromStorage = (fileName) => {
    return pdfStorage[fileName];
  };

  // Initialize Adobe PDF Embed viewer
  const initializeAdobeViewer = (fileName) => {
    if (!isAdobeLoaded || !window.AdobeDC) {
      console.error('Adobe PDF Embed API not loaded');
      return;
    }

    const found = findPdfInStorage(fileName);
    if (!found) {
      console.error('PDF not found in storage:', fileName);
      console.log('Available PDFs:', Object.keys(pdfStorage));
      return;
    }
    
    const storedPdf = found.pdf;

    // Clear previous viewer
    if (pdfViewerRef.current) {
      pdfViewerRef.current.innerHTML = '';
    }

    try {
      const adobeDCView = new window.AdobeDC.View({
        clientId: ADOBE_CLIENT_ID,
        divId: 'adobe-pdf-viewer'
      });

      // Configure viewer options
      const viewerConfig = {
        embedMode: 'SIZED_CONTAINER',
        showAnnotationTools: false,
        showLeftHandPanel: true,
        showDownloadPDF: true,
        showPrintPDF: false,
        showZoomControl: true,
        showPageControls: true,
        showBookmarks: true,
        showThumbnails: true,
        enableFormFilling: false,
        enableLinearization: true
      };

      // Preview file
      adobeDCView.previewFile({
        content: { location: { url: storedPdf.url } },
        metaData: { fileName: storedPdf.name }
      }, viewerConfig);

      setAdobeDCView(adobeDCView);

      // Set up event listeners
      adobeDCView.registerCallback(
        window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
        (event) => {
          console.log('Adobe PDF Event:', event);
        },
        {
          enablePDFAnalytics: false
        }
      );

    } catch (error) {
      console.error('Error initializing Adobe PDF viewer:', error);
    }
  };

  // Helper function to normalize file names for comparison
  const normalizeFileName = (name) => {
    return name
      .replace(/\.pdf$/i, '') // Remove .pdf extension
      .replace(/[_\s-]+/g, ' ') // Replace underscores, spaces, and dashes with single space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .toLowerCase();
  };

  // Helper function to find PDF by partial name match
  const findPdfInStorage = (docName) => {
    // First try exact match
    if (pdfStorage[docName]) {
      return { key: docName, pdf: pdfStorage[docName] };
    }
    
    // Normalize the search name
    const normalizedSearchName = normalizeFileName(docName);
    
    // Try to find by normalized name match
    const keys = Object.keys(pdfStorage);
    for (const key of keys) {
      const normalizedKey = normalizeFileName(key);
      
      if (normalizedKey === normalizedSearchName) {
        return { key, pdf: pdfStorage[key] };
      }
    }
    
    // If still not found, try partial matching
    for (const key of keys) {
      const normalizedKey = normalizeFileName(key);
      
      if (normalizedKey.includes(normalizedSearchName) || 
          normalizedSearchName.includes(normalizedKey)) {
        return { key, pdf: pdfStorage[key] };
      }
    }
    
    return null;
  };

  const handlePdfSelection = (docName) => {
    setSelectedPdf(docName);
    
    const found = findPdfInStorage(docName);
    if (found && isAdobeLoaded) {
      setTimeout(() => initializeAdobeViewer(found.key), 100);
    } else if (!found) {
      console.warn(`PDF "${docName}" not found in storage. Available PDFs:`, Object.keys(pdfStorage));
    }
  };

  // Navigate to specific page when section is clicked
  const navigateToPage = (document, pageNumber) => {
    if (selectedPdf !== document) {
      setSelectedPdf(document);
      const found = findPdfInStorage(document);
      if (found) {
        setTimeout(() => {
          initializeAdobeViewer(found.key);
          // Adobe PDF Embed API doesn't have a direct page navigation method
          // This would require additional implementation
        }, 500);
      } else {
        console.warn(`PDF "${document}" not found for navigation. Available PDFs:`, Object.keys(pdfStorage));
      }
    }
    // Note: Adobe PDF Embed API doesn't provide programmatic page navigation
    // Users will need to navigate manually using the viewer controls
  };

  const removeFile = (index) => {
    const fileToRemove = uploadedFiles[index];
    
    // Revoke blob URL to prevent memory leaks
    const storedPdf = getPdfFromStorage(fileToRemove.name);
    if (storedPdf && storedPdf.url) {
      URL.revokeObjectURL(storedPdf.url);
    }
    
    // Remove from storage
    setPdfStorage(prev => {
      const newStorage = { ...prev };
      delete newStorage[fileToRemove.name];
      return newStorage;
    });
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Clear viewer if this was the selected PDF
    if (selectedPdf === fileToRemove.name) {
      setSelectedPdf(null);
      if (pdfViewerRef.current) {
        pdfViewerRef.current.innerHTML = '';
      }
    }
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

      if (!response.ok) throw new Error('Failed to analyze PDFs');

      const data = await response.json();
      setAnalysisResults(data);
    } catch (error) {
      console.error('Error during analysis:', error);
      alert('An error occurred while analyzing the PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.4) return 'text-green-600 bg-green-50';
    if (score >= 0.35) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRankBadgeColor = (rank) => {
    if (rank <= 2) return 'bg-yellow-500 text-white';
    if (rank <= 4) return 'bg-gray-400 text-white';
    return 'bg-amber-600 text-white';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Revoke all blob URLs to prevent memory leaks
      Object.values(pdfStorage).forEach(pdf => {
        if (pdf.url) {
          URL.revokeObjectURL(pdf.url);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Semantic PDF Analysis</h1>
            <p className="text-gray-600">Upload PDFs and analyze them based on your persona and task</p>
            {ADOBE_CLIENT_ID === "YOUR_ADOBE_CLIENT_ID_HERE" && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Please replace ADOBE_CLIENT_ID with your actual Adobe PDF Embed API Client ID to enable PDF viewing.
                </p>
              </div>
            )}
          </div>
          
          {!analysisResults && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persona
                  </label>
                  <input
                    type="text"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    placeholder="e.g., Tourist, Business Traveler, Food Enthusiast"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task to be Done
                  </label>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="e.g., Plan a trip for 4 days, Find best restaurants"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDFs
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload PDF files</p>
                  <p className="text-sm text-gray-500">Supports multiple file uploads</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !persona || !task || uploadedFiles.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Analyze PDFs'
                )}
              </button>
            </div>
          )}
        </div>

        {analysisResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Results Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
                    <button 
                      onClick={() => setAnalysisResults(null)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      New Analysis
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analysisResults.data.metadata.total_chunks_processed}</div>
                      <div className="text-sm text-gray-600">Chunks Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analysisResults.data.metadata.processing_time_seconds}s</div>
                      <div className="text-sm text-gray-600">Processing Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{analysisResults.data.metadata.input_documents.length}</div>
                      <div className="text-sm text-gray-600">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{analysisResults.data.extracted_sections.length}</div>
                      <div className="text-sm text-gray-600">Key Sections</div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(analysisResults.data.metadata.processing_timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      Top Extracted Sections
                    </h3>
                    <div className="space-y-4">
                      {analysisResults.data.extracted_sections.map((section, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${getRankBadgeColor(section.importance_rank)}`}>
                                #{section.importance_rank}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(section.similarity_score)}`}>
                                {(section.similarity_score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <button
                              onClick={() => navigateToPage(section.document, section.page_number)}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              Page {section.page_number}
                            </button>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-2">{section.section_title}</h4>
                          <div className="text-sm text-gray-600 flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {section.document}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Book className="h-5 w-5 text-blue-500 mr-2" />
                      Detailed Subsection Analysis
                    </h3>
                    <div className="space-y-3">
                      {analysisResults.data.subsection_analysis.map((subsection, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div 
                            className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${getScoreColor(subsection.similarity_score)}`}>
                                  {(subsection.similarity_score * 100).toFixed(1)}%
                                </span>
                                <span className="text-sm font-medium text-gray-900">{subsection.document}</span>
                              </div>
                              <div className="flex items-center text-gray-500">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigateToPage(subsection.document, subsection.page_number);
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-800 mr-2 transition-colors"
                                >
                                  Page {subsection.page_number}
                                </button>
                                {expandedSection === index ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </div>
                            </div>
                          </div>
                          {expandedSection === index && (
                            <div className="p-4 border-t border-gray-200">
                              <p className="text-gray-700 leading-relaxed">{subsection.refined_text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adobe PDF Viewer Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Eye className="h-5 w-5 text-green-500 mr-2" />
                    Source Documents
                  </h3>
                  <div className="space-y-2">
                    {analysisResults.data.metadata.input_documents.map((doc, index) => {
                      const found = findPdfInStorage(doc);
                      const isAvailable = !!found;
                      
                      return (
                        <div 
                          key={index}
                          onClick={() => isAvailable && handlePdfSelection(doc)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedPdf === doc 
                              ? 'border-blue-500 bg-blue-50' 
                              : isAvailable 
                                ? 'border-gray-200 hover:border-gray-300 cursor-pointer'
                                : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className={`h-5 w-5 mr-2 ${isAvailable ? 'text-red-600' : 'text-red-400'}`} />
                              <span className="text-sm font-medium text-gray-900 truncate">{doc}</span>
                            </div>
                            {!isAvailable && (
                              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                Not Found
                              </span>
                            )}
                            {isAvailable && found.key !== doc && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded" title={`Mapped to: ${found.key}`}>
                                Mapped
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {selectedPdf && findPdfInStorage(selectedPdf) && (
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">{selectedPdf}</div>
                      {!isAdobeLoaded && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-blue-700">Loading Adobe PDF Viewer...</p>
                        </div>
                      )}
                    </div>

                    {/* Adobe PDF Viewer Container */}
                    <div 
                      id="adobe-pdf-viewer" 
                      ref={pdfViewerRef}
                      style={{ 
                        width: '100%', 
                        height: '600px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      {!isAdobeLoaded && (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                          <div className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-600 text-sm">Loading PDF viewer...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-gray-500 text-center">
                      Use the viewer controls to zoom, navigate, and search within the PDF.
                      Click on sections in the analysis to view the corresponding document.
                    </div>
                  </div>
                )}
                
                {selectedPdf && !findPdfInStorage(selectedPdf) && (
                  <div className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <FileText className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
                      <p className="text-yellow-700 text-sm mb-2">PDF Not Available</p>
                      <p className="text-yellow-600 text-xs mb-3">
                        Document "{selectedPdf}" was not found in your uploaded files.
                      </p>
                      <details className="text-left">
                        <summary className="text-xs text-yellow-700 cursor-pointer hover:text-yellow-800">
                          Available uploaded PDFs ({Object.keys(pdfStorage).length})
                        </summary>
                        <div className="mt-2 space-y-1">
                          {Object.keys(pdfStorage).map((pdfName, index) => (
                            <div key={index} className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                              {pdfName}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pdfabc;