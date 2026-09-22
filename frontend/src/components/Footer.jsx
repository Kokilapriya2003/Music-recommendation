import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-dark border-t border-white/10 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} MoodTune AI. Music that understands your mood.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Built with React, FastAPI, and DeepFace AI.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
