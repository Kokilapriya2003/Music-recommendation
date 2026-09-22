import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, X, Music, RefreshCw, Sparkles, SlidersHorizontal } from 'lucide-react';
import CameraView from '../components/CameraView';
import EmotionCard from '../components/EmotionCard';
import SongGrid from '../components/SongGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MusicPlayerModal from '../components/MusicPlayerModal';
import { recommendationApi } from '../services/api';
import { storage } from '../utils/storage';

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'angry', label: 'Angry', emoji: '😡' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'surprise', label: 'Surprise', emoji: '😲' },
];

const Recommendations = () => {
  const location = useLocation();
  const [state, setState] = useState('idle'); // idle, result, error
  const [emotionResult, setEmotionResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSong, setActiveSong] = useState(null);
  const [, setFavUpdateTick] = useState(0);

  const [filters, setFilters] = useState({
    genre: 'All',
    energy: 'All',
  });

  // Check if routed from Home with pre-detected emotion
  useEffect(() => {
    if (location.state && location.state.emotion) {
      handleEmotionDetected({
        emotion: location.state.emotion,
        confidence: location.state.confidence || 0.90,
      });
    }
  }, [location.state]);

  const handleEmotionDetected = async (result) => {
    setEmotionResult(result);
    setState('result');
    setError(null);

    // Save to history
    storage.saveDetection({
      emotion: result.emotion,
      confidence: result.confidence,
    });

    // Fetch recommendations
    fetchRecommendations(result.emotion);
  };

  const handleFaceError = (result) => {
    setState('error');
    if (result.faces_count === 0) {
      setError('No face detected. Ensure good lighting and face the camera directly, or upload a clear photo.');
    } else if (result.faces_count > 1) {
      setError('Multiple faces detected. Please make sure only one person is in the frame.');
    } else {
      setError('Emotion analysis could not be completed. Please try again or select a mood directly.');
    }
  };

  const fetchRecommendations = async (emotion) => {
    setLoadingRecs(true);
    try {
      const data = await recommendationApi.getRecommendations(emotion);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError('Failed to fetch recommendations. Please check backend connection.');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSwitchMood = (moodId) => {
    setEmotionResult({
      emotion: moodId,
      confidence: 0.95,
    });
    fetchRecommendations(moodId);
  };

  const filteredSongs = recommendations.filter((song) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = song.title.toLowerCase().includes(q);
      const matchArtist = song.artist.toLowerCase().includes(q);
      const matchGenre = song.genre.toLowerCase().includes(q);
      if (!matchTitle && !matchArtist && !matchGenre) return false;
    }

    // Genre filter
    if (filters.genre !== 'All' && song.genre.toLowerCase() !== filters.genre.toLowerCase()) {
      return false;
    }

    // Energy filter
    if (filters.energy !== 'All') {
      if (filters.energy === 'Low' && song.energy > 0.4) return false;
      if (filters.energy === 'Medium' && (song.energy < 0.4 || song.energy > 0.7)) return false;
      if (filters.energy === 'High' && song.energy < 0.7) return false;
    }

    return true;
  });

  const availableGenres = ['All', ...new Set(recommendations.map((s) => s.genre))];

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold mb-3 gradient-text">
          Music That Understands Your Mood
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
          Analyze your expression with AI or pick your mood to receive personalized sound recommendations.
        </p>
      </div>

      {/* State: Camera / Detector Idle */}
      {state === 'idle' && (
        <div className="flex justify-center">
          <CameraView
            onEmotionDetected={handleEmotionDetected}
            onFaceError={handleFaceError}
          />
        </div>
      )}

      {/* State: Detection Error */}
      {state === 'error' && (
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center py-8">
          <ErrorMessage message={error} />
          <div className="flex gap-4">
            <button
              onClick={() => setState('idle')}
              className="bg-brand-accent hover:bg-purple-600 text-white px-8 py-3 rounded-full font-bold transition-all active:scale-95 shadow-lg shadow-purple-600/30"
            >
              Try Again
            </button>
            <button
              onClick={() => handleSwitchMood('happy')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all"
            >
              Pick Mood Manually
            </button>
          </div>
        </div>
      )}

      {/* State: Result & Recommendations */}
      {state === 'result' && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Emotion Card & Controls */}
          <div className="flex flex-col items-center gap-6">
            <EmotionCard
              emotion={emotionResult.emotion}
              confidence={emotionResult.confidence}
            />

            {/* Switch Mood Quick Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-400 font-medium mr-1">Switch Mood:</span>
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSwitchMood(m.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 border ${
                    emotionResult.emotion.toLowerCase() === m.id
                      ? 'bg-brand-accent text-white border-brand-accent shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setState('idle')}
              className="text-gray-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-detect with Camera / Photo
            </button>
          </div>

          {/* Recommendations Header & Filter Toolbar */}
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-accent/20 text-brand-accent rounded-lg">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">
                    {emotionResult.emotion} Playlist
                  </h3>
                  <p className="text-xs text-gray-400">
                    {filteredSongs.length} track{filteredSongs.length !== 1 ? 's' : ''} scored for your mood
                  </p>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search song or artist..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Genre Selector */}
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters((prev) => ({ ...prev, genre: e.target.value }))}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  {availableGenres.map((g) => (
                    <option key={g} value={g} className="bg-zinc-900 text-white">
                      {g === 'All' ? 'All Genres' : g}
                    </option>
                  ))}
                </select>

                {/* Energy Filter */}
                <select
                  value={filters.energy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, energy: e.target.value }))}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="All" className="bg-zinc-900 text-white">All Energy Levels</option>
                  <option value="Low" className="bg-zinc-900 text-white">Low Energy (&lt;40%)</option>
                  <option value="Medium" className="bg-zinc-900 text-white">Medium Energy (40-70%)</option>
                  <option value="High" className="bg-zinc-900 text-white">High Energy (&gt;70%)</option>
                </select>
              </div>
            </div>

            {/* Song Grid / Spinner */}
            {loadingRecs ? (
              <LoadingSpinner message="Curating songs matched to your mood..." />
            ) : (
              <SongGrid
                songs={filteredSongs}
                onPlay={(song) => setActiveSong(song)}
                onFavoriteToggle={() => setFavUpdateTick((t) => t + 1)}
              />
            )}
          </div>
        </div>
      )}

      {/* In-App Music Player Modal */}
      {activeSong && (
        <MusicPlayerModal
          song={activeSong}
          onClose={() => setActiveSong(null)}
          onFavoriteToggle={() => setFavUpdateTick((t) => t + 1)}
        />
      )}
    </div>
  );
};

export default Recommendations;
