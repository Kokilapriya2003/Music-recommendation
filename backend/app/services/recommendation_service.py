import random
from typing import List
from .music_service import music_service
from ..models.schemas import Song

class RecommendationService:
    def get_recommendations(self, emotion: str, limit: int = 10) -> List[dict]:
        all_songs = music_service.get_all_songs()
        scored_songs = []

        for song in all_songs:
            score = 0.0

            # Emotion match (50%)
            if song['emotion'].lower() == emotion.lower():
                score += 0.5

            # Mood match (20%) - Simplified: check if emotion name is in mood or vice versa
            if emotion.lower() in song['mood'].lower() or song['mood'].lower() in emotion.lower():
                score += 0.2

            # Genre match (15%) - Demo: prefer Pop/Rock for high energy emotions
            if emotion.lower() in ['happy', 'surprise', 'angry']:
                if song['genre'].lower() in ['pop', 'rock', 'funk']:
                    score += 0.15
            elif emotion.lower() in ['sad', 'neutral']:
                if song['genre'].lower() in ['ambient', 'classical', 'lo-fi']:
                    score += 0.15

            # Energy match (10%)
            # Happy/Angry/Surprise -> High energy
            # Sad/Neutral -> Low energy
            energy = song['energy']
            if emotion.lower() in ['happy', 'angry', 'surprise']:
                score += (energy * 0.1)
            else:
                score += ((1 - energy) * 0.1)

            # Random diversity (5%)
            score += random.uniform(0, 0.05)

            scored_songs.append((song, score))

        # Sort by score descending
        scored_songs.sort(key=lambda x: x[1], reverse=True)

        return [song for song, score in scored_songs[:limit]]

recommendation_service = RecommendationService()
