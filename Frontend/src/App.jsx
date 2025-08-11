import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HeadingExtraction from "./components/HeadingExtraction";
import Recommendation from "./components/Recommendation";
import Pdfabc from "./components/pdfabc";
import Home from "./components/Home";
import Service from './components/Service';
import Header from "./components/Header";
import PageSummarizer from "./components/PageSummarizer";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/heading-extraction" element={<HeadingExtraction />} />
        <Route path="/recommendation" element={<Recommendation />} />
        {/* <Route path="/pdfabc" element={<Pdfabc />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/service" element={<Service />} />
        <Route path="/page-summarizer" element={<PageSummarizer />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
