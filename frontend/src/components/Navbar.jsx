import React from 'react';
import { Menu, X, Music } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-glass backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-accent p-2 rounded-lg group-hover:rotate-12 transition-transform">
                <Music className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold gradient-text">MoodTune AI</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-brand-accent transition-colors">Home</Link>
            <Link to="/recommendations" className="text-sm font-medium hover:text-brand-accent transition-colors">Recommendations</Link>
            <Link to="/history" className="text-sm font-medium hover:text-brand-accent transition-colors">History</Link>
            <Link to="/about" className="text-sm font-medium hover:text-brand-accent transition-colors">About</Link>
            <button
              onClick={() => navigate('/recommendations')}
              className="bg-brand-accent hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
            >
              Detect My Mood
            </button>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-dark border-b border-white/10 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">Home</Link>
            <Link to="/recommendations" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">Recommendations</Link>
            <Link to="/history" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">History</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10">About</Link>
            <button
              onClick={() => { setIsOpen(false); navigate('/recommendations'); }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-semibold bg-brand-accent text-white mt-4"
            >
              Detect My Mood
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
