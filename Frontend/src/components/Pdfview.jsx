import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, Search, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// A helper component for a styled section in the controls
const ControlSection = ({ title, children }) => (
  <div className="mt-6 pt-4 border-t border-slate-200">
    <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Pdfview = () => {
  // --- STATE AND REFS ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAdobeLoaded, setIsAdobeLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for DOM elements
  const pdfViewerRef = useRef(null);
  const fileInputRef = useRef(null);

  // State for API objects
  const [adobeApi, setAdobeApi] = useState(null);
  const [searchObject, setSearchObject] = useState(null);
  
  // State for API data and UI controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomLimits, setZoomLimits] = useState({ minZoom: 0.25, maxZoom: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [selectedText, setSelectedText] = useState('');

  // --- CONFIGURATION ---
  const ADOBE_CLIENT_ID = import.meta.env.VITE_ADOBE_CLIENT_ID_LH || "YOUR_ADOBE_CLIENT_ID";

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

  // Initialize or clear the Adobe PDF viewer
  useEffect(() => {
    const initializeAdobeViewer = (file) => {
      if (!isAdobeLoaded || !file || !pdfViewerRef.current) return;

      if (!ADOBE_CLIENT_ID || ADOBE_CLIENT_ID === "YOUR_ADOBE_CLIENT_ID") {
        console.error("Adobe Client ID is not set.");
        setErrorMessage("Adobe Client ID is missing. PDF viewer cannot be initialized.");
        pdfViewerRef.current.innerHTML = `<div class="p-8 text-center text-red-500 h-full flex items-center justify-center"><span>Adobe Client ID is missing.</span></div>`;
        return;
      }

      pdfViewerRef.current.innerHTML = '';
      setErrorMessage('');

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
          showAnnotationTools: true,
          showLeftHandPanel: true,
          showDownloadPDF: true,
          showPrintPDF: true,
          // *** Enable Search APIs ***
          enableSearchAPIs: true, 
        });

        previewFilePromise.then(adobeViewer => {
          adobeViewer.getAPIs().then(apis => {
            // *** Store the API object in state ***
            setAdobeApi(apis);
            console.log("Adobe Viewer APIs loaded successfully.");

            // Get initial data on load
            apis.getZoomAPIs().getZoomLimits()
              .then(limits => setZoomLimits(limits))
              .catch(e => console.error("Error getting zoom limits:", e));
            
            apis.getCurrentPage()
              .then(page => setCurrentPage(page))
              .catch(e => console.error("Error getting current page:", e));
          });
        });
      } catch (error) {
        console.error('Error initializing Adobe PDF viewer:', error);
        setErrorMessage('Could not initialize the Adobe PDF viewer.');
      }
    };

    if (selectedFile) {
      initializeAdobeViewer(selectedFile);
    } else {
      if (pdfViewerRef.current) {
        pdfViewerRef.current.innerHTML = `
          <div class="p-8 text-center text-slate-500 h-full flex items-center justify-center">
            <span>${isAdobeLoaded ? 'Upload a PDF to view it here.' : 'Loading PDF viewer...'}</span>
          </div>`;
      }
      // Reset all API-related state when file is removed
      setAdobeApi(null);
      setBookmarks([]);
      setAttachments([]);
      setMetadata(null);
      setSearchObject(null);
      setSearchResults(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, isAdobeLoaded]);


  // --- API HANDLER FUNCTIONS ---
  
  // Zoom APIs
  const handleZoomIn = () => adobeApi?.getZoomAPIs().zoomIn().then(setZoomLevel).catch(console.error);
  const handleZoomOut = () => adobeApi?.getZoomAPIs().zoomOut().then(setZoomLevel).catch(console.error);
  const handleSetZoom = (level) => {
    const newZoom = parseFloat(level);
    if (!isNaN(newZoom)) {
      adobeApi?.getZoomAPIs().setZoomLevel(newZoom).then(setZoomLevel).catch(console.error);
    }
  };

  // Search APIs
  const handleSearch = () => {
    if (!searchQuery) return;
    adobeApi?.search(searchQuery)
      .then(searchObj => {
        setSearchObject(searchObj);
        searchObj.onResultsUpdate(resultInfo => {
          console.log("Search results update:", resultInfo);
          setSearchResults(resultInfo);
        });
      })
      .catch(console.error);
  };
  const handleNextResult = () => searchObject?.next().catch(console.error);
  const handlePrevResult = () => searchObject?.previous().catch(console.error);
  const handleClearSearch = () => {
    searchObject?.clear().catch(console.error);
    setSearchObject(null);
    setSearchResults(null);
    setSearchQuery('');
  };

  // Bookmark APIs
  const handleGetBookmarks = () => {
    adobeApi?.getBookmarkAPIs().getBookmarks()
      .then(b => setBookmarks(b || []))
      .catch(e => {
          console.error("Error getting bookmarks:", e);
          setBookmarks([]); // Ensure it's an array on failure
      });
  };
  const handleOpenBookmark = (id) => adobeApi?.getBookmarkAPIs().openBookmark(id).catch(console.error);

  // Attachment APIs
  const handleGetAttachments = () => {
    adobeApi?.getAttachmentAPIs().getAttachments()
      .then(a => setAttachments(a || []))
      .catch(e => {
          console.error("Error getting attachments:", e);
          setAttachments([]);
      });
  };
  const handleDownloadAttachment = (name) => {
    adobeApi?.getAttachmentAPIs().getAttachmentBuffer(name)
      .then(result => {
        const blob = new Blob([result.buffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(console.error);
  };

  // Metadata APIs
  const handleGetPDFMetadata = () => {
    adobeApi?.getPDFMetadata()
      .then(data => setMetadata({ type: 'Basic Metadata', data }))
      .catch(console.error);
  };
  const handleGetXMPMetadata = () => {
    adobeApi?.getXMPMetadata()
      .then(data => setMetadata({ type: 'XMP Metadata', data }))
      .catch(console.error);
  };

  // Other APIs
  const handleGetSelectedContent = () => {
    adobeApi?.getSelectedContent()
      .then(result => setSelectedText(result?.data || 'No text selected.'))
      .catch(e => {
        console.error(e);
        setSelectedText('Error getting selection.');
      });
  };
  const handleSetCursor = (cursor) => adobeApi?.setCursor(cursor).catch(console.error);
  const handleResetCursor = () => adobeApi?.resetCursor();
  const handleGetCurrentPage = () => adobeApi?.getCurrentPage().then(setCurrentPage).catch(console.error);
  const handleGoToLocation = (page) => {
    const pageNum = parseInt(page);
    if (!isNaN(pageNum)) {
      adobeApi?.gotoLocation(pageNum).then(() => handleGetCurrentPage()).catch(console.error);
    }
  };
  const handleToggleTextSelection = (enable) => adobeApi?.enableTextSelection(enable).catch(console.error);


  // --- UI HANDLERS ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setErrorMessage('');
    } else {
      setErrorMessage('Please select a valid PDF file.');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  // Helper to render bookmarks recursively
  const renderBookmarks = (bookmarkList) => (
    <ul className="pl-4 list-disc list-inside space-y-1">
      {bookmarkList.map(bookmark => (
        <li key={bookmark.id}>
          <span className="text-slate-700">{bookmark.title}</span>
          <button onClick={() => handleOpenBookmark(bookmark.id)} className="ml-2 text-xs text-indigo-600 hover:underline">
            Go
          </button>
          {bookmark.children && bookmark.children.length > 0 && renderBookmarks(bookmark.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- LEFT COLUMN: UPLOAD & CONTROLS --- */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-fit">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">PDF Viewer & API Demo</h1>
          <p className="text-slate-600 mb-6">Upload a PDF to display it and interact with the Adobe PDF Embed APIs.</p>
          
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />

          {!selectedFile ? (
            <div onClick={triggerFileUpload} className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-500 cursor-pointer transition-colors bg-slate-50">
              <Upload className="mx-auto h-10 w-10 text-slate-400 mb-4" />
              <p className="text-slate-600 font-semibold">Click to upload a PDF</p>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm border border-slate-200">
                <div className="flex items-center truncate gap-2">
                  <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-sm text-slate-800 font-medium truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </span>
                </div>
                <button onClick={removeFile} className="p-1 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {errorMessage && <p className="text-red-600 text-sm mt-4">{errorMessage}</p>}
          
          {/* --- API CONTROLS - RENDERED CONDITIONALLY --- */}
          {adobeApi && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">API Controls</h2>
              
              {/* Zoom Controls */}
              <ControlSection title="Zoom">
                <div className="flex items-center gap-2">
                    <button onClick={handleZoomOut} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><ZoomOut size={16}/></button>
                    <input 
                        type="range" 
                        min={zoomLimits.minZoom} 
                        max={zoomLimits.maxZoom} 
                        step="0.05" 
                        value={zoomLevel} 
                        onChange={(e) => handleSetZoom(e.target.value)}
                        className="w-full"
                    />
                    <button onClick={handleZoomIn} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><ZoomIn size={16}/></button>
                </div>
                <p className="text-sm text-slate-500">Current Zoom: {Number(zoomLevel).toFixed(2)} (Min: {zoomLimits.minZoom}, Max: {zoomLimits.maxZoom})</p>
              </ControlSection>

              {/* Search Controls */}
              <ControlSection title="Search">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter search term..."
                    className="flex-grow p-2 border border-slate-300 rounded-md text-sm"
                  />
                  <button onClick={handleSearch} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"><Search size={16}/></button>
                </div>
                {searchObject && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevResult} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><ChevronLeft size={16}/></button>
                            <button onClick={handleNextResult} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300"><ChevronRight size={16}/></button>
                            {searchResults && <span className="text-sm text-slate-600">{searchResults.currentResult?.index} of {searchResults.totalResults}</span>}
                        </div>
                        <button onClick={handleClearSearch} className="text-sm text-red-600 hover:underline">Clear</button>
                    </div>
                )}
              </ControlSection>

              {/* Navigation & Page Controls */}
              <ControlSection title="Navigation">
                 <div className="flex items-center gap-2">
                     <p className="text-sm text-slate-600">Current Page: <strong>{currentPage}</strong></p>
                     <button onClick={handleGetCurrentPage} className="text-sm text-indigo-600 hover:underline">Refresh</button>
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="number" min="1" placeholder="Page #" id="page-input" className="w-20 p-2 border border-slate-300 rounded-md text-sm"/>
                    <button onClick={() => handleGoToLocation(document.getElementById('page-input').value)} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300 text-sm">Go</button>
                 </div>
              </ControlSection>

              {/* Bookmarks */}
              <ControlSection title="Bookmarks">
                <button onClick={handleGetBookmarks} className="w-full p-2 bg-slate-200 rounded-md hover:bg-slate-300 text-sm font-medium">Get Bookmarks</button>
                {bookmarks.length > 0 ? renderBookmarks(bookmarks) : <p className="text-sm text-slate-500">No bookmarks found or not loaded.</p>}
              </ControlSection>

              {/* Attachments */}
              <ControlSection title="Attachments">
                <button onClick={handleGetAttachments} className="w-full p-2 bg-slate-200 rounded-md hover:bg-slate-300 text-sm font-medium">Get Attachments</button>
                {attachments.length > 0 ? (
                  <ul className="space-y-1">
                    {attachments.map(att => (
                      <li key={att.name} className="flex justify-between items-center text-sm">
                        <span>{att.name}</span>
                        <button onClick={() => handleDownloadAttachment(att.name)} className="text-xs text-indigo-600 hover:underline">Download</button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500">No attachments found or not loaded.</p>}
              </ControlSection>

              {/* Metadata */}
              <ControlSection title="Metadata">
                <div className="flex gap-2">
                    <button onClick={handleGetPDFMetadata} className="flex-1 p-2 bg-slate-200 rounded-md hover:bg-slate-300 text-sm font-medium">Get Basic Info</button>
                    <button onClick={handleGetXMPMetadata} className="flex-1 p-2 bg-slate-200 rounded-md hover:bg-slate-300 text-sm font-medium">Get XMP Data</button>
                </div>
                {metadata && (
                    <div className="mt-2 p-2 bg-slate-100 rounded text-xs">
                        <h4 className="font-bold">{metadata.type}</h4>
                        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(metadata.data, null, 2)}</pre>
                    </div>
                )}
              </ControlSection>
              
              {/* Other Controls */}
              <ControlSection title="Misc. Controls">
                 <button onClick={handleGetSelectedContent} className="w-full p-2 bg-slate-200 rounded-md hover:bg-slate-300 text-sm font-medium">Get Selected Text</button>
                 {selectedText && <p className="p-2 bg-slate-100 rounded text-sm text-slate-700">"{selectedText}"</p>}
                 <div className="flex items-center gap-2">
                    <select id="cursor-select" className="flex-grow p-2 border border-slate-300 rounded-md text-sm">
                        <option value="default">Default</option>
                        <option value="crosshair">Crosshair</option>
                        <option value="help">Help</option>
                        <option value="wait">Wait</option>
                        <option value="text">Text</option>
                    </select>
                    <button onClick={() => handleSetCursor(document.getElementById('cursor-select').value)} className="p-2 bg-slate-200 rounded-md hover:bg-slate-300 text-sm">Set Cursor</button>
                    <button onClick={handleResetCursor} className="text-sm text-red-600 hover:underline">Reset</button>
                 </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleTextSelection(true)} className="flex-1 p-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm">Enable Text Selection</button>
                    <button onClick={() => handleToggleTextSelection(false)} className="flex-1 p-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm">Disable Text Selection</button>
                 </div>
              </ControlSection>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: PDF VIEWER --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="p-2 h-full">
            <div
              id="adobe-pdf-viewer"
              ref={pdfViewerRef}
              className="border border-slate-300 rounded-lg bg-slate-50 w-full"
              style={{ height: 'calc(100vh - 2rem)' }}
            >
              {/* This div is managed by the Adobe Viewer useEffect */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pdfview;