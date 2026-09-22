import React from 'react';
import { Play, Heart, ExternalLink, Zap } from 'lucide-react';
import { storage } from '../utils/storage';

const SongCard = ({ song, onPlay, onFavoriteToggle }) => {
  const isFav = storage.isFavorite(song.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    storage.toggleFavorite(song);
    if (onFavoriteToggle) onFavoriteToggle();
  };

  return (
    <div className="glass-card overflow-hidden group hover:border-brand-accent/50 transition-all hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="aspect-square bg-gradient-to-br from-purple-950 via-zinc-900 to-black relative overflow-hidden flex items-center justify-center">
          {/* Subtle album art simulation */}
          <div className="text-center p-6 select-none opacity-40 group-hover:opacity-20 transition-opacity">
            <span className="text-5xl font-black text-white/20">♪</span>
            <p className="text-xs uppercase tracking-widest text-gray-500 mt-2 font-mono">{song.genre}</p>
          </div>

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
            <button
              onClick={() => onPlay && onPlay(song)}
              className="bg-brand-accent hover:bg-purple-500 p-4 rounded-full text-white transform scale-75 group-hover:scale-100 transition-all shadow-xl shadow-purple-600/50"
              title="Play Preview in App"
            >
              <Play fill="white" className="w-6 h-6 ml-0.5" />
            </button>
          </div>

          {/* Top-Right Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-colors ${
              isFav ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-gray-300 hover:text-white'
            }`}
            title={isFav ? 'Remove Favorite' : 'Save to Favorites'}
          >
            <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
          </button>

          {/* Bottom Tags */}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-brand-accent capitalize">
            {song.mood}
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-gray-300">
            {song.genre}
          </div>
        </div>

        <div className="p-4">
          <h4 className="font-bold truncate text-lg text-white" title={song.title}>
            {song.title}
          </h4>
          <p className="text-gray-400 text-sm truncate mb-3" title={song.artist}>
            {song.artist}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>Energy: {Math.round(song.energy * 100)}%</span>
            <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden ml-1">
              <div
                className="bg-yellow-400 h-full rounded-full"
                style={{ width: `${Math.round(song.energy * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 border-t border-white/5 flex items-center justify-between gap-2">
        <button
          onClick={() => onPlay && onPlay(song)}
          className="text-xs font-semibold text-brand-accent hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" /> Play Preview
        </button>

        <a
          href={song.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          title="Open in YouTube"
        >
          <span>YouTube</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default SongCard;
