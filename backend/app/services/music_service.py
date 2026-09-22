import json
import os
from pathlib import Path
from typing import List, Optional

def _find_songs_file() -> Optional[str]:
    candidates = [
        # Absolute path relative to file location
        Path(__file__).resolve().parents[3] / "data" / "songs.json",
        Path(__file__).resolve().parents[2] / "data" / "songs.json",
        Path(__file__).resolve().parents[1] / "data" / "songs.json",
        Path.cwd() / "data" / "songs.json",
        Path.cwd() / ".." / "data" / "songs.json",
        Path(r"D:\Music_recommentation\data\songs.json"),
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return str(candidate.resolve())
    return None

SONGS_FILE = _find_songs_file()

class MusicService:
    def __init__(self):
        self.songs = self._load_songs()

    def _load_songs(self) -> List[dict]:
        file_path = SONGS_FILE or _find_songs_file()
        if not file_path:
            print("Warning: songs.json file not found in any standard location.")
            return []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"Loaded {len(data)} songs from {file_path}")
                return data
        except Exception as e:
            print(f"Error loading songs from {file_path}: {e}")
            return []

    def get_all_songs(self) -> List[dict]:
        if not self.songs:
            self.songs = self._load_songs()
        return self.songs

    def get_songs_by_emotion(self, emotion: str) -> List[dict]:
        all_songs = self.get_all_songs()
        return [song for song in all_songs if song.get('emotion', '').lower() == emotion.lower()]

    def search_songs(
        self,
        query: Optional[str] = None,
        emotion: Optional[str] = None,
        genre: Optional[str] = None,
        mood: Optional[str] = None
    ) -> List[dict]:
        results = self.get_all_songs()
        if emotion and emotion.lower() != 'all':
            results = [s for s in results if s.get('emotion', '').lower() == emotion.lower()]
        if genre and genre.lower() != 'all':
            results = [s for s in results if s.get('genre', '').lower() == genre.lower()]
        if mood and mood.lower() != 'all':
            results = [s for s in results if mood.lower() in s.get('mood', '').lower()]
        if query:
            q = query.lower().strip()
            results = [
                s for s in results
                if q in s.get('title', '').lower()
                or q in s.get('artist', '').lower()
                or q in s.get('genre', '').lower()
            ]
        return results

music_service = MusicService()
