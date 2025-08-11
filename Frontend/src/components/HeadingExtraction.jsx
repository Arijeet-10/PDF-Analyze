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
} from "lucide-react";

/**
 * A React component for uploading PDF documents, extracting their heading structure,
 * and displaying the results with an interactive PDF viewer that highlights
 * headings when they are clicked.
 */
const HeadingExtraction = () => {
  // State for managing uploaded files
  const [files, setFiles] = useState([]);
  // State for storing the analysis results from the backend
  const [results, setResults] = useState([]);
  // State for displaying user-facing messages (e.g., loading, error, success)
  const [message, setMessage] = useState("");
  // State to track loading status during API calls
  const [isLoading, setIsLoading] = useState(false);
  // State to manage the visual style of the drag-and-drop area
  const [dragActive, setDragActive] = useState(false);
  // State to store object URLs for PDF previews, allowing them to be opened in new tabs
  const [pdfUrls, setPdfUrls] = useState({});
  // State to track the currently selected PDF for viewing
  const [selectedPdf, setSelectedPdf] = useState(null);
  // State to control which page is currently displayed ('upload' or 'results')
  const [currentPage, setCurrentPage] = useState("upload");
  // State to manage the expanded/collapsed state of each document's outline in the results
  const [expandedDocs, setExpandedDocs] = useState({});
  // State to track if the Adobe PDF Embed API script has loaded
  const [isAdobeLoaded, setIsAdobeLoaded] = useState(false);
  // State to store the ID of the current highlight annotation for easy removal
  const [highlightAnnotationId, setHighlightAnnotationId] = useState(null);

  // Ref for the div where the Adobe PDF viewer will be rendered
  const pdfViewerRef = useRef(null);
  // Ref for the hidden file input element to trigger it programmatically
  const fileInputRef = useRef(null);
  // Ref to store the Adobe Viewer API object once it's initialized
  const adobeApiRef = useRef(null);

  // IMPORTANT: Replace with your actual Adobe PDF Embed API Client ID
  const ADOBE_CLIENT_ID = "628c0718047f4a0eaaccc8a09c8e3130";

  // Effect to load the Adobe PDF Embed API script
  useEffect(() => {
    const loadAdobeAPI = () => {
      if (window.AdobeDC) {
        setIsAdobeLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://documentservices.adobe.com/view-sdk/viewer.js";
      script.onload = () => setIsAdobeLoaded(true);
      script.onerror = () => console.error("Failed to load Adobe PDF Embed API");
      document.head.appendChild(script);
    };
    loadAdobeAPI();
  }, []);

  // Effect to clean up created object URLs when the component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(pdfUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pdfUrls]);

  /**
   * Finds and returns a file object from the `files` state by its name.
   * @param {string} filename - The name of the file to find.
   * @returns {File|undefined} The file object or undefined if not found.
   */
  const getFileByName = (filename) => {
    return files.find((file) => file.name === filename);
  };

  /**
   * Initializes the Adobe PDF viewer in the designated div.
   * @param {File} file - The PDF file to display.
   * @param {number} [targetPage=1] - The initial page number to display.
   */
  const initializeAdobeViewer = (file, targetPage = 1) => {
    if (!isAdobeLoaded || !window.AdobeDC || !file) {
      console.error("Adobe API not loaded or no file provided.");
      return;
    }

    if (pdfViewerRef.current) {
      pdfViewerRef.current.innerHTML = ""; // Clear previous viewer instance
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
          showAnnotationTools: false, // Set to true to allow user annotations
          showLeftHandPanel: false,
          showDownloadPDF: true,
          showPrintPDF: false,
          defaultViewMode: "FIT_PAGE",
        }
      );

      previewFilePromise.then((adobeViewer) => {
        // Store the viewer instance in the ref for access to its APIs
        adobeApiRef.current = adobeViewer;
        adobeViewer.getAPIs().then((apis) => {
          apis.gotoLocation(targetPage);
        });
      }).catch(e => console.error("Error during PDF preview:", e));

    } catch (error) {
      console.error("Error initializing Adobe PDF viewer:", error);
      setMessage("Could not display PDF. Ensure the Adobe Client ID is correct and the domain is registered.");
    }
  };

  // Effect to initialize or clear the PDF viewer when the selected PDF changes
  useEffect(() => {
    if (selectedPdf && isAdobeLoaded) {
      initializeAdobeViewer(selectedPdf.file, selectedPdf.targetPage);
    }

    if (!selectedPdf && pdfViewerRef.current) {
      pdfViewerRef.current.innerHTML = "";
      adobeApiRef.current = null; // Clear the API ref
    }
  }, [selectedPdf, isAdobeLoaded]);

  /**
   * Adds new files to the file list, ensuring no duplicates are added.
   * @param {File[]} newFiles - An array of files to add.
   */
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

  /**
   * Handles file selection from the file input.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleFileChange = (e) => {
    if (e.target.files) {
      addFilesToList(Array.from(e.target.files));
      e.target.value = null; // Reset input to allow re-selecting the same file
    }
  };

  /**
   * Removes a specific file from the list.
   * @param {string} fileNameToRemove - The name of the file to remove.
   */
  const handleRemoveFile = (fileNameToRemove) => {
    const urlToRevoke = pdfUrls[fileNameToRemove];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileNameToRemove));
    setPdfUrls((prevUrls) => {
      const newUrls = { ...prevUrls };
      delete newUrls[fileNameToRemove];
      return newUrls;
    });
  };

  /**
   * Handles clicking on a heading in the results list.
   * It opens the corresponding PDF, navigates to the correct page,
   * and highlights the heading text.
   * @param {object} doc - The document object from the results.
   * @param {object} heading - The heading object containing text and page number.
   */
  const handleHeadingClick = async (doc, heading) => {
    const file = getFileByName(doc.filename);
    if (!file) {
      console.error("Could not find file:", doc.filename);
      return;
    }

    // Set the selected PDF, which triggers the viewer to open
    setSelectedPdf({ file, targetPage: heading.page + 1 });

    // Use a timeout to ensure the viewer API is ready after the component re-renders
    setTimeout(async () => {
      if (!adobeApiRef.current) {
        console.error("Adobe Viewer API is not available.");
        return;
      }

      try {
        const apis = await adobeApiRef.current.getAPIs();

        // 1. Remove the previous highlight if one exists
        if (highlightAnnotationId) {
          await apis.removeAnnotations([highlightAnnotationId]);
          setHighlightAnnotationId(null);
        }

        // 2. Search for the heading text to get its location (quads)
        const searchResults = await apis.search(heading.text);
        const resultOnPage = searchResults.find(r => r.page_num === heading.page + 1);

        if (resultOnPage && resultOnPage.quads.length > 0) {
          // 3. Add a new highlight annotation
          const [newAnnotation] = await apis.addAnnotations([
            {
              type: "HIGHLIGHT",
              page: heading.page + 1,
              quadPoints: resultOnPage.quads[0], // Use the first bounding box
              color: [255, 255, 0], // Yellow
              opacity: 0.5,
            },
          ]);
          // 4. Store the new annotation's ID
          setHighlightAnnotationId(newAnnotation.id);
        } else {
          console.warn(`Could not find text "${heading.text}" on page ${heading.page + 1} to highlight.`);
          apis.gotoLocation(heading.page + 1); // Fallback to just navigating
        }
      } catch (error) {
        console.error("Error during text highlighting:", error);
      }
    }, 500); // 500ms delay to allow viewer to initialize
  };

  /**
   * Toggles the expanded/collapsed view of a document's outline.
   * @param {string} filename - The filename of the document to toggle.
   */
  const toggleExpand = (filename) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [filename]: !prev[filename],
    }));
  };

  /**
   * Handles drag events for the file drop zone.
   * @param {React.DragEvent} e - The drag event.
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  /**
   * Handles the drop event for the file drop zone.
   * @param {React.DragEvent} e - The drop event.
   */
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

  /**
   * Handles the main upload and analysis process.
   */
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one PDF file.");
      return;
    }
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      setIsLoading(true);
      setMessage("Processing your documents...");

      // Replace with your actual API endpoint
      const response = await fetch("http://localhost:8000/api/pdf-outline", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
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
      setMessage(`Failed to extract PDF content: ${error.message}`);
      setIsLoading(false);
    }
  };

  /**
   * Opens a PDF in a new browser tab.
   * @param {string} filename - The name of the file to open.
   * @param {number} [page=0] - The page number to navigate to (0-indexed).
   */
  const openPdfInNewTab = (filename, page = 0) => {
    const pdfUrl = pdfUrls[filename];
    if (pdfUrl) {
      window.open(`${pdfUrl}#page=${page + 1}`, "_blank");
    }
  };

  /**
   * Returns a status icon based on the current application state.
   * @returns {JSX.Element|null}
   */
  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (results.length > 0) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (message && !isLoading && results.length === 0) return <AlertCircle className="w-5 h-5 text-red-500" />;
    return null;
  };

  /**
   * Calculates the indentation level for headings based on their level (H1, H2, etc.).
   * @param {string} levelStr - The heading level string (e.g., "H2").
   * @returns {string} The CSS margin-left value.
   */
  const getIndentLevel = (levelStr) => {
    if (typeof levelStr !== "string") return "0px";
    const level = parseInt(levelStr.replace("H", ""), 10);
    return isNaN(level) || level <= 1 ? "0px" : `${(level - 1) * 24}px`;
  };

  /**
   * Resets the application state and returns to the upload page.
   */
  const goBackToUpload = () => {
    setCurrentPage("upload");
    setSelectedPdf(null);
    setResults([]);
    setFiles([]);
    Object.values(pdfUrls).forEach((url) => URL.revokeObjectURL(url));
    setPdfUrls({});
    setMessage("");
    setHighlightAnnotationId(null);
  };

  /**
   * The component for the initial file upload page.
   */
  const UploadPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">PDF Document Analyzer</h1>
              <p className="text-sm text-gray-500">Extract headings and document structure</p>
            </div>
          </div>
          {ADOBE_CLIENT_ID.includes("CLIENT_ID") && (
             <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
               <p className="text-sm text-yellow-800">
                 <strong>Note:</strong> Please replace the placeholder with your actual Adobe PDF Embed API Client ID to enable PDF viewing.
               </p>
             </div>
           )}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8 border-b border-gray-100 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Your Documents</h2>
            <p className="text-gray-600">Select or drag PDF files to analyze their structure</p>
          </div>
          <div className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                dragActive ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload-input"
              />
              <div className="flex flex-col items-center space-y-6">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                    dragActive ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Upload
                    className={`w-10 h-10 transition-colors ${
                      dragActive ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xl font-medium text-gray-900 mb-2">Drop PDF files here, or click to browse</p>
                  <p className="text-gray-500">Support for multiple PDF documents</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Selected Files ({files.length})</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add More</span>
                    </button>
                    <button
                      onClick={() => {
                        const clearedFileNames = files.map((f) => f.name);
                        const newPdfUrls = { ...pdfUrls };
                        clearedFileNames.forEach((name) => {
                          if (newPdfUrls[name]) {
                            URL.revokeObjectURL(newPdfUrls[name]);
                            delete newPdfUrls[name];
                          }
                        });
                        setFiles([]);
                        setPdfUrls(newPdfUrls);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => openPdfInNewTab(file.name)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-white"
                          title="Preview PDF in New Tab"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRemoveFile(file.name)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white"
                          title="Remove File"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message && (
              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className="text-blue-800">{message}</span>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Analyze Documents</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * The component for displaying the analysis results and the PDF viewer.
   */
  const ResultsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        
      </div>

      <div className="w-full mx-auto px-6 py-8">
        <div className={`flex gap-8 ${selectedPdf ? 'h-[calc(100vh-120px)]' : ''}`}>
          <div className={`space-y-6 ${selectedPdf ? 'w-1/2 overflow-y-auto pr-4' : 'w-full'}`}>
            {results.map((doc, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{doc.filename}</h3>
                      <div className="flex items-center flex-wrap gap-x-4 text-sm text-gray-500">
                        <span>Title: {doc.title || "N/A"}</span>
                        <span>•</span>
                        <span>{doc.outline?.outline?.length || 0} headings</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => toggleExpand(doc.filename)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition px-2 py-1 rounded hover:bg-gray-50"
                      >
                        {expandedDocs[doc.filename] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span>{expandedDocs[doc.filename] ? "Hide" : "Show"}</span>
                      </button>
                      <button
                        onClick={() => openPdfInNewTab(doc.filename)}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Open PDF in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open</span>
                      </button>
                    </div>
                  </div>
                </div>

                {expandedDocs[doc.filename] && (
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Document Structure</h4>
                    {doc.outline?.outline?.length > 0 ? (
                      <div className="space-y-1">
                        {doc.outline.outline.map((heading, hIdx) => (
                          <button
                            key={hIdx}
                            onClick={() => handleHeadingClick(doc, heading)}
                            className="w-full flex items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors group text-left border border-transparent hover:border-gray-200"
                            style={{ marginLeft: getIndentLevel(heading.level) }}
                          >
                            <ChevronRight className="w-4 h-4 text-gray-300 mr-3 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                            <div className="flex-1 flex justify-between items-center gap-4 min-w-0">
                              <span
                                className={`truncate font-medium group-hover:text-blue-600 transition-colors ${
                                  heading.level === "H1" ? "text-gray-900 text-base" : "text-gray-800 text-sm"
                                }`}
                              >
                                {heading.text}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0">
                                <span>Page {heading.page + 1}</span>
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">No headings found in this document</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedPdf && (
            <div className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 truncate">{selectedPdf.file.name}</h3>
                  <p className="text-sm text-gray-500">{isAdobeLoaded ? 'Adobe PDF Viewer' : 'Loading viewer...'}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPdf(null);
                    setHighlightAnnotationId(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  aria-label="Close PDF Viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-4">
                <div
                  id="adobe-pdf-viewer"
                  ref={pdfViewerRef}
                  className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white h-full"
                >
                  {!isAdobeLoaded && (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 text-blue-600 mb-3 animate-spin" />
                        <p className="text-gray-600 font-medium">Loading Adobe PDF Viewer...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return currentPage === "upload" ? <UploadPage /> : <ResultsPage />;
};

export default HeadingExtraction;
