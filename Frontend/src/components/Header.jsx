import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageInsights from './PageInsights';
import { Lightbulb } from 'lucide-react';


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

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
          onClick={() => setShowInsights(true)}
          className="md:inline hidden bg-white hover:bg-gray-50 border border-gray-300 ml-20 px-9 py-2 rounded-full active:scale-95 transition-all"
        >
          <Lightbulb className="inline-block mr-2" />
          Insights
        </button>

        <button
          aria-label="menu-btn"
          type="button"
          className="menu-btn inline-block md:hidden active:scale-90 transition"
          onClick={toggleMobileMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
            <path d="M3 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2zm0 7a1 1 0 1 0 0 2h24a1 1 0 1 0 0-2z" />
          </svg>
        </button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu absolute top-[70px] left-0 w-full bg-white shadow-sm p-6 md:hidden">
            <ul className="flex flex-col space-y-4 text-lg">
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
              type="button"
              className="bg-white text-gray-600 border border-gray-300 mt-6 text-sm hover:bg-gray-50 active:scale-95 transition-all w-40 h-11 rounded-full"
            >
              Get started
            </button>
          </div>
        )}
      </nav>
       <PageInsights open={showInsights} onClose={() => setShowInsights(false)} />
    </div>
  );
};

export default Header;
