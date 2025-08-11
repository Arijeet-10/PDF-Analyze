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
  const ADOBE_CLIENT_ID = "628c0718047f4a0eaaccc8a09c8e3130"; // Using a demo key

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
      script.onerror = () =>
        console.error("Failed to load Adobe PDF Embed API");
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
          showAnnotationTools: false,
          showLeftHandPanel: false,
          showDownloadPDF: true,
          showPrintPDF: true,
          defaultViewMode: "FIT_PAGE",
        }
      );

      previewFilePromise
        .then((adobeViewer) => {
          adobeApiRef.current = adobeViewer; // Store the viewer instance
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

  // Effect to initialize or clear the PDF viewer when the selected PDF changes
  useEffect(() => {
    if (selectedPdf && isAdobeLoaded) {
      initializeAdobeViewer(selectedPdf.file, selectedPdf.targetPage);
    } else if (!selectedPdf && pdfViewerRef.current) {
      pdfViewerRef.current.innerHTML = ""; // Clear the viewer content
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
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileNameToRemove)
    );
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
  
    const isSameDoc = selectedPdf?.file.name === file.name;
    // Set the selected PDF, which triggers the viewer to open or update
    setSelectedPdf({ file, targetPage: heading.page + 1 });
  
    // Use a small delay to ensure the viewer API is ready, especially when loading a new doc
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
        
        // Find the specific search result for the correct page
        const resultOnPage = searchResults.find(r => r.page_num === heading.page + 1);
  
        if (resultOnPage && resultOnPage.quads.length > 0) {
          // 3. Add a new highlight annotation
          const [newAnnotation] = await apis.addAnnotations([
            {
              type: "HIGHLIGHT",
              page: heading.page + 1,
              quadPoints: resultOnPage.quads[0], // Use the first bounding box
              color: [255, 215, 0], // A nice gold color
              opacity: 0.5,
            },
          ]);
          // 4. Store the new annotation's ID
          setHighlightAnnotationId(newAnnotation.id);
          // 5. Go to the annotation location
          apis.gotoLocation(heading.page + 1, resultOnPage.quads[0][0], resultOnPage.quads[0][1]);
        } else {
          console.warn(
            `Could not find text "${heading.text}" on page ${
              heading.page + 1
            } to highlight.`
          );
          apis.gotoLocation(heading.page + 1); // Fallback to just navigating to the page
        }
      } catch (error) {
        console.error("Error during text highlighting:", error);
      }
    }, isSameDoc ? 100 : 500); // Shorter delay if doc is already open
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
    files.forEach((file) => formData.append("files", file));

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
   * Calculates the indentation level for headings based on their level (H1, H2, etc.).
   * @param {string} levelStr - The heading level string (e.g., "H2").
   * @returns {string} The CSS margin-left value.
   */
  const getIndentLevel = (levelStr) => {
    if (typeof levelStr !== "string") return "0px";
    const level = parseInt(levelStr.replace("H", ""), 10);
    return isNaN(level) || level <= 1 ? "0px" : `${(level - 1) * 20}px`;
  };

  /**
   * Resets the application state and returns to the upload page.
   */
  const goBackToUpload = () => {
    setCurrentPage("upload");
    setSelectedPdf(null);
    setResults([]);
    // Revoke old URLs before clearing files
    Object.values(pdfUrls).forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setPdfUrls({});
    setMessage("");
    setHighlightAnnotationId(null);
  };
  
  /**
   * Clears all selected files from the list.
   */
  const clearAllFiles = () => {
      Object.values(pdfUrls).forEach(url => URL.revokeObjectURL(url));
      setFiles([]);
      setPdfUrls({});
  }

  /**
   * The component for the initial file upload page.
   */
  const UploadPage = () => (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-blue-600 rounded-xl p-3 mb-4">
             <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            PDF Document Analyzer
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Upload your PDFs to automatically extract their heading structure.
          </p>
        </header>

        <main className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
          <div className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 hover:border-slate-400"
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
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    dragActive ? "bg-blue-100" : "bg-slate-100"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 transition-colors duration-300 ${
                      dragActive ? "text-blue-600" : "text-slate-500"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    Drop PDFs here or{" "}
                    <span className="text-blue-600">browse files</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Maximum file size: 50MB
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900">
                    Selected Files ({files.length})
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add More</span>
                    </button>
                    <button
                      onClick={clearAllFiles}
                      className="text-sm text-slate-500 hover:text-red-600 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                        <button
                          onClick={() => openPdfInNewTab(file.name)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-md hover:bg-slate-200"
                          title="Preview PDF in New Tab"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFile(file.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-slate-200"
                          title="Remove File"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50/50 border-t border-slate-200 rounded-b-2xl">
             {message && !isLoading && (
              <div className={`mt-2 mb-6 p-3 rounded-lg border flex items-center space-x-3 text-sm ${message.includes('Failed') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                {message.includes('Failed') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span>{message}</span>
              </div>
            )}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || isLoading}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/30"
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
        </main>
      </div>
    </div>
  );

  /**
   * The component for displaying the analysis results and the PDF viewer.
   */
  const ResultsPage = () => (
    <div className="h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">
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

      <main className="flex-1 flex gap-6 p-6 min-h-0">
        {/* Left Panel: Results List */}
        <div className="w-full lg:w-1/2 flex-shrink-0 overflow-y-auto space-y-4 pr-2">
          {results.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200"
            >
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-800 mb-1 truncate">
                      {doc.filename}
                    </h3>
                    <div className="flex items-center flex-wrap gap-x-3 text-xs text-slate-500">
                      <span>{doc.outline?.outline?.length || 0} headings found</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => toggleExpand(doc.filename)}
                      className="flex items-center space-x-1 text-xs text-slate-600 hover:text-blue-600 transition px-2 py-1 rounded hover:bg-slate-100 font-medium"
                    >
                      {expandedDocs[doc.filename] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span>{expandedDocs[doc.filename] ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {expandedDocs[doc.filename] && (
                <div className="p-2">
                  {doc.outline?.outline?.length > 0 ? (
                    <div className="space-y-1 p-2 max-h-[60vh] overflow-y-auto">
                      {doc.outline.outline.map((heading, hIdx) => (
                        <button
                          key={hIdx}
                          onClick={() => handleHeadingClick(doc, heading)}
                          className="w-full flex items-center py-2 px-3 rounded-md hover:bg-blue-50 transition-colors group text-left"
                          style={{ marginLeft: getIndentLevel(heading.level) }}
                        >
                          <div className="flex-1 flex justify-between items-center gap-4 min-w-0">
                            <span
                              className={`truncate font-medium group-hover:text-blue-700 transition-colors ${
                                heading.level === "H1"
                                  ? "text-slate-800 text-sm"
                                  : "text-slate-600 text-sm"
                              }`}
                            >
                              {heading.text}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0">
                              <span>P.{heading.page + 1}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">No headings found in this document.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Panel: PDF Viewer */}
        <div className="hidden lg:flex w-1/2 bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 flex-col overflow-hidden">
          {selectedPdf ? (
            <>
              <div className="p-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                  <h3 className="text-sm font-semibold text-slate-800 truncate px-2">
                    {selectedPdf.file.name}
                  </h3>
                <button
                  onClick={() => {
                    setSelectedPdf(null);
                    setHighlightAnnotationId(null);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors rounded-md hover:bg-slate-100"
                  aria-label="Close PDF Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 bg-slate-50 min-h-0">
                <div
                  id="adobe-pdf-viewer"
                  ref={pdfViewerRef}
                  className="w-full h-full"
                >
                  {!isAdobeLoaded && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 text-blue-600 mb-3 animate-spin" />
                        <p className="text-slate-600 font-medium">Loading PDF Viewer...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-50/50 p-8">
                <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-slate-200">
                        <BookOpen className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Document Viewer</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">Click on a heading from the list on the left to view the document and highlight its location.</p>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );

  return currentPage === "upload" ? <UploadPage /> : <ResultsPage />;
};

export default HeadingExtraction;