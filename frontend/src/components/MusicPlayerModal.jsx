import React from 'react';
import { X, ExternalLink, Heart, Music, Disc3, Zap } from 'lucide-react';
import { storage } from '../utils/storage';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1`;
  }
  return null;
};

const MusicPlayerModal = ({ song, onClose, onFavoriteToggle }) => {
  if (!song) return null;

  const embedUrl = getYouTubeEmbedUrl(song.url);
  const isFav = storage.isFavorite(song.id);

  const handleFav = () => {
    storage.toggleFavorite(song);
    if (onFavoriteToggle) onFavoriteToggle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
              <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white truncate max-w-sm">{song.title}</h3>
              <p className="text-xs text-gray-400">{song.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFav}
              className={`p-2 rounded-lg transition-colors ${
                isFav ? 'text-red-400 bg-red-500/10' : 'text-gray-400 hover:text-white bg-white/5'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <a
              href={song.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"
              title="Open in YouTube"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video / Audio player */}
        <div className="w-full aspect-video bg-black relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={song.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <Music className="w-12 h-12 mb-3 text-brand-accent" />
              <p className="text-lg font-medium">Direct playback preview unavailable</p>
              <a
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 bg-brand-accent text-white px-6 py-2 rounded-full font-bold text-sm"
              >
                Listen on External Player
              </a>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="p-6 bg-zinc-950/60 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-brand-accent/20 text-brand-accent font-semibold capitalize">
              {song.emotion}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">
              {song.genre}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400">
              {song.mood}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400">
              {song.language}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Energy:</span>
            <div className="w-20 bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${Math.round(song.energy * 100)}%` }}
              />
            </div>
            <span>{Math.round(song.energy * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerModal;
