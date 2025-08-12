import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageInsights from './PageInsights';
import FactsWindow from './FactsWindow'; // Import the new component
import { Lightbulb, Sparkles } from 'lucide-react'; // Import new icon

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showFacts, setShowFacts] = useState(false); // State for Facts window
  const [uploadedFiles, setUploadedFiles] = useState([]); // State for uploaded files

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  // Effect to listen for a global event that updates the file list
  useEffect(() => {
    const handleFileUpdate = (event) => {
      setUploadedFiles(event.detail.files || []);
    };
    window.addEventListener('filesUpdated', handleFileUpdate);
    return () => {
      window.removeEventListener('filesUpdated', handleFileUpdate);
    };
  }, []);

  return (
    <div className="text-sm text-white w-full">
      <nav className="relative h-[70px] flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 bg-white text-gray-900 transition-all shadow">
        <a href="/" className="flex items-center space-x-2">
            <h2>
                <span className='text-2xl font-bold'>PDF </span>
                <span className='text-2xl font-bold text-blue-600'>Analyzer</span>
            </h2>
        </a>
        <ul className="hidden md:flex items-center space-x-8 md:pl-28">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/service">Services</Link>
          </li>
          <li>
            <Link to="/">Portfolio</Link>
          </li>
          <li>
            <Link to="/">Pricing</Link>
          </li>
        </ul>

        
            <button
              onClick={() => setShowFacts(true)}
              className="bg-white hover:bg-gray-50 border border-gray-300 px-6 py-2 rounded-full active:scale-95 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploadedFiles.length === 0}
              title={uploadedFiles.length === 0 ? "Upload PDFs to see facts" : "Show interesting facts"}
            >
              <Lightbulb className="inline-block mr-2 h-4 w-4" />
              Insights
            </button>
        
        
        {/* Mobile Menu Button (unchanged) */}
        <button
          aria-label="menu-btn"
          type="button"
          className="menu-btn inline-block md:hidden active:scale-90 transition ml-4"
          onClick={toggleMobileMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
            <path d="M3 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2z" />
          </svg>
        </button>

        {/* Mobile menu (unchanged) */}
        {mobileMenuOpen && (
          <div className="mobile-menu absolute top-[70px] left-0 w-full bg-white shadow-sm p-6 md:hidden">
            {/* ... mobile links ... */}
          </div>
        )}
      </nav>
      <PageInsights open={showInsights} onClose={() => setShowInsights(false)} />
      {/* Render the new FactsWindow component */}
      <FactsWindow isOpen={showFacts} onClose={() => setShowFacts(false)} files={uploadedFiles} />
    </div>
  );
};

export default Header;