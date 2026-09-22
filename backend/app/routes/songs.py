from fastapi import APIRouter, HTTPException, Query
from ..services.music_service import music_service
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_all_songs(
    q: Optional[str] = Query(None, description="Search query by title or artist"),
    emotion: Optional[str] = Query(None, description="Filter by emotion"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    mood: Optional[str] = Query(None, description="Filter by mood")
):
    if q or emotion or genre or mood:
        return music_service.search_songs(query=q, emotion=emotion, genre=genre, mood=mood)
    return music_service.get_all_songs()

@router.get("/{emotion}", response_model=List[dict])
async def get_songs_by_emotion(emotion: str):
    songs = music_service.get_songs_by_emotion(emotion)
    if not songs:
        raise HTTPException(status_code=404, detail="No songs found for this emotion")
    return songs
