import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListTree, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion'; // For animations: npm install framer-motion

const Service = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <ListTree className="h-10 w-10 text-blue-500" />,
      title: 'Heading & Structure Extraction',
      description: 'Automatically analyze your PDF to extract a clean, structured outline of all headings and subheadings.',
      action: () => navigate('/heading-extraction'),
      ariaLabel: 'Select Heading and Structure Extraction service',
    },
    {
      icon: <Sparkles className="h-10 w-10 text-purple-500" />,
      title: 'Recommendations',
      description: 'Get personalized insights and content recommendations based on the topics and themes within your documents.',
      action: () => navigate('/recommendation'),
      ariaLabel: 'Select AI-Powered Recommendations service',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        {/* --- Page Header --- */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Choose a Service
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            Select one of our powerful tools to get started.
          </p>
        </motion.div>

        {/* --- Service Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <button
                onClick={service.action}
                aria-label={service.ariaLabel}
                className="w-full h-full text-left p-8 bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 group flex flex-col"
              >
                <div className="flex-shrink-0">{service.icon}</div>
                <div className="flex-grow mt-6">
                  <h2 className="text-xl font-bold text-slate-900">{service.title}</h2>
                  <p className="mt-2 text-slate-600">{service.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-end text-blue-600 font-semibold">
                  Select Service
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Service;
