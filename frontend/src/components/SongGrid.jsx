import React from 'react';
import SongCard from './SongCard';

const SongGrid = ({ songs, onPlay, onFavoriteToggle }) => {
  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl">
        <p className="text-gray-400 text-lg">No songs found matching your criteria.</p>
        <p className="text-xs text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          onPlay={onPlay}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
};

export default SongGrid;
