import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageInsights from './PageInsights';
import FactsWindow from './FactsWindow';
import { Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false); // Renamed for clarity
  const [showFacts, setShowFacts] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  // Effect to listen for the global file update event
  useEffect(() => {
    const handleFileUpdate = (event) => {
      setUploadedFiles(event.detail.files || []);
    };
    window.addEventListener('filesUpdated', handleFileUpdate);
    return () => {
      window.removeEventListener('filesUpdated', handleFileUpdate);
    };
  }, []);

  // Effect to handle body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/service", label: "Services" },
    { href: "/", label: "Portfolio" },
    { href: "/", label: "Pricing" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <nav className="h-16 flex items-center justify-between container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className='text-2xl font-bold text-slate-900'>PDF</span>
            <span className='text-2xl font-bold text-blue-600'>Analyzer</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.href} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setShowFacts(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploadedFiles.length === 0}
              title={uploadedFiles.length === 0 ? "Upload PDFs to see insights" : "Show AI insights"}
            >
              <Sparkles className="h-4 w-4" />
              Insights
            </button>
            <Link to="/get-started" className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="menu-btn"
            type="button"
            className="menu-btn md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      {/* Animated Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white p-4 md:hidden"
          >
            <div className="flex justify-between items-center h-16 border-b border-slate-200">
                <Link to="/" className="flex items-center" onClick={toggleMobileMenu}>
                    <span className='text-2xl font-bold text-slate-900'>PDF</span>
                    <span className='text-2xl font-bold text-blue-600'>Analyzer</span>
                </Link>
                <button aria-label="close-menu" onClick={toggleMobileMenu}>
                    <X className="h-6 w-6" />
                </button>
            </div>
            <ul className="flex flex-col items-center mt-8 space-y-6">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} onClick={toggleMobileMenu} className="text-lg font-medium text-slate-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="absolute bottom-8 left-4 right-4 flex flex-col items-center gap-4">
               <button
                  onClick={() => { setShowFacts(true); toggleMobileMenu(); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full font-medium text-slate-600 bg-slate-100 disabled:opacity-50"
                  disabled={uploadedFiles.length === 0}
                >
                  <Sparkles className="h-5 w-5" />
                  Insights
                </button>
                <Link to="/get-started" onClick={toggleMobileMenu} className="w-full text-center px-4 py-3 rounded-full font-semibold bg-blue-600 text-white">
                  Get Started
                </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modals (No change in logic) */}
      <PageInsights open={showInsights} onClose={() => setShowInsights(false)} />
      <FactsWindow isOpen={showFacts} onClose={() => setShowFacts(false)} files={uploadedFiles} />
    </>
  );
};

export default Header;