import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { Trash2, Music, Heart, ArrowRight, Play, Disc3 } from 'lucide-react';
import MusicPlayerModal from '../components/MusicPlayerModal';

const History = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'favorites'
  const [history, setHistory] = useState(storage.getHistory());
  const [favorites, setFavorites] = useState(storage.getFavorites());
  const [activeSong, setActiveSong] = useState(null);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your detection history?')) {
      storage.clearHistory();
      setHistory([]);
    }
  };

  const handleFavoriteToggle = () => {
    setFavorites(storage.getFavorites());
  };

  const getEmoji = (emotion) => {
    const map = {
      happy: '😊',
      sad: '😢',
      angry: '😡',
      neutral: '😐',
      surprise: '😲',
      fear: '😨',
      disgust: '🤢',
    };
    return map[emotion?.toLowerCase()] || '🎵';
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('history')}
            className={`text-xl font-bold pb-2 transition-all border-b-2 ${
              activeTab === 'history'
                ? 'text-white border-brand-accent'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Detection History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`text-xl font-bold pb-2 transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'text-white border-brand-accent'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Heart className="w-5 h-5 text-red-400 fill-current" />
            Favorite Songs ({favorites.length})
          </button>
        </div>

        {activeTab === 'history' && history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {/* Tab: Detection History */}
      {activeTab === 'history' && (
        <>
          {history.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <p className="text-gray-400 text-lg">No detections recorded yet.</p>
              <button
                onClick={() => navigate('/recommendations')}
                className="mt-4 bg-brand-accent text-white px-6 py-2 rounded-full font-bold text-sm"
              >
                Detect My Mood Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    navigate('/recommendations', {
                      state: { emotion: item.emotion, confidence: item.confidence },
                    })
                  }
                  className="glass-card p-4 rounded-xl flex items-center justify-between hover:border-brand-accent/50 cursor-pointer transition-all hover:translate-x-1 group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getEmoji(item.emotion)}</span>
                    <div>
                      <p className="font-bold text-white capitalize flex items-center gap-2">
                        {item.emotion || 'Neutral'}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-brand-accent">
                          {Math.round((item.confidence || 0.8) * 100)}%
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 group-hover:text-brand-accent transition-colors">
                    <span>View Songs</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Favorites */}
      {activeTab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-lg">No favorite songs saved yet.</p>
              <p className="text-xs text-gray-500 mt-1">
                Click the heart icon on any song card to save it here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((song) => (
                <div
                  key={song.id}
                  className="glass-card p-4 rounded-xl flex items-center justify-between gap-3 group hover:border-brand-accent/50 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => setActiveSong(song)}
                      className="p-3 bg-brand-accent/20 group-hover:bg-brand-accent text-brand-accent group-hover:text-white rounded-lg transition-colors flex-shrink-0"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-white text-sm truncate">{song.title}</h4>
                      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 mt-1 inline-block capitalize">
                        {song.genre} • {song.emotion}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      storage.toggleFavorite(song);
                      handleFavoriteToggle();
                    }}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Music Player Modal */}
      {activeSong && (
        <MusicPlayerModal
          song={activeSong}
          onClose={() => setActiveSong(null)}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}
    </div>
  );
};

export default History;
