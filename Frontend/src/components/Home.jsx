import React from "react";
import { useNavigate } from "react-router-dom";
// For animations, you'll need to install Framer Motion: npm install framer-motion
import { motion } from "framer-motion";

// --- SVG Icon Components (for better organization) ---
const IconFile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28px" height="28px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
  </svg>
);
const IconMagnifyingGlass = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28px" height="28px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
  </svg>
);
const IconRobot = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28px" height="28px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-28,16v24H120V152ZM80,164a12,12,0,0,1,12-12h12v24H92A12,12,0,0,1,80,164Zm84,12H152V152h12a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z" />
  </svg>
);
const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H80a8,8,0,0,1,0,16H32v64H224V136H176a8,8,0,0,1,0-16h48A16,16,0,0,1,240,136ZM85.66,77.66,120,43.31V128a8,8,0,0,0,16,0V43.31l34.34,34.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,77.66Z"></path>
    </svg>
);


const Home = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/service");
  };

  const features = [
    {
      icon: <IconFile />,
      title: "Heading & Subheading Extraction",
      description: "Automatically identify and extract structural elements for easy navigation.",
      className: "md:col-span-2",
    },
    {
      icon: <IconMagnifyingGlass />,
      title: "PDF Recommendation Engine",
      description: "Get personalized PDF recommendations based on your unique persona.",
      className: "",
    },
    {
      icon: <IconRobot />,
      title: "Intelligent Analysis",
      description: "Our AI provides valuable insights and summaries from your documents.",
      className: "md:col-span-3",
    },
  ];

  const howItWorksSteps = [
    {
      icon: <IconUpload />,
      title: "1. Upload Your PDF",
      description: "Securely drag and drop or select a file from your device.",
    },
    {
      icon: <IconRobot />,
      title: "2. Analyze & Extract",
      description: "Our engine processes the document, extracting key data and structure.",
    },
    {
      icon: <IconMagnifyingGlass />,
      title: "3. Get Insights",
      description: "Receive summaries and personalized recommendations in seconds.",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased">
      {/* --- Header --- */}
      

      <main className="container mx-auto px-4 py-16 md:py-24">
        {/* --- Hero Section --- */}
        <motion.section 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Unlock Instant Insights from Your <br />
            <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              PDF Documents
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8">
            Analyze, extract, and summarize with our powerful AI-driven tool. Turn static documents into actionable intelligence.
          </p>
          <button
            onClick={handleClick}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
          >
            Get Started for Free
          </button>
        </motion.section>

        {/* --- Features Section (Bento Grid) --- */}
        <section className="py-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need, and More
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4 group hover:border-blue-500 transition-colors duration-300 shadow-sm ${feature.className}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-blue-500 group-hover:text-blue-400 transition-colors">
                    {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="py-24">
            <h2 className="text-3xl font-bold text-center mb-12">
                Simple Steps to Powerful Insights
            </h2>
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
                {howItWorksSteps.map((step, index) => (
                    <motion.div 
                        key={index} 
                        className="flex flex-col items-center text-center max-w-xs"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-white border border-slate-200 rounded-full text-blue-500 shadow-sm">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-slate-500">{step.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>


        {/* --- Call to Action --- */}
        <section className="text-center py-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Dive In?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Start analyzing your PDFs today and unlock their hidden potential.
          </p>
          <button
            onClick={handleClick}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
          >
            Try PDF Analyzer Now
          </button>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-200">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-slate-500 text-sm mb-4 md:mb-0">
            © 2025 PDF Analyzer. All rights reserved.
          </p>
          <div className="flex gap-6 text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;