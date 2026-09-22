export const storage = {
  saveDetection: (detection) => {
    const history = storage.getHistory();
    const newHistory = [
      { ...detection, timestamp: new Date().toISOString() },
      ...history,
    ].slice(0, 30); // Keep last 30
    localStorage.setItem('moodtune_history', JSON.stringify(newHistory));
  },

  getHistory: () => {
    try {
      const history = localStorage.getItem('moodtune_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  },

  clearHistory: () => {
    localStorage.removeItem('moodtune_history');
  },

  getFavorites: () => {
    try {
      const favs = localStorage.getItem('moodtune_favorites');
      return favs ? JSON.parse(favs) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite: (song) => {
    const favs = storage.getFavorites();
    const exists = favs.some((s) => s.id === song.id);
    let updated;
    if (exists) {
      updated = favs.filter((s) => s.id !== song.id);
    } else {
      updated = [song, ...favs];
    }
    localStorage.setItem('moodtune_favorites', JSON.stringify(updated));
    return !exists;
  },

  isFavorite: (songId) => {
    const favs = storage.getFavorites();
    return favs.some((s) => s.id === songId);
  },
};
