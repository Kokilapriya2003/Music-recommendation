from pydantic import BaseModel
from typing import List, Optional

class EmotionDetectionResponse(BaseModel):
    success: bool
    face_detected: bool
    faces_count: int
    emotion: Optional[str] = None
    confidence: float = 0.0

class RecommendationRequest(BaseModel):
    emotion: str
    limit: Optional[int] = 10

class Song(BaseModel):
    id: int
    title: str
    artist: str
    genre: str
    language: str
    emotion: str
    mood: str
    energy: float
    url: str

class RecommendationResponse(BaseModel):
    emotion: str
    recommendations: List[Song]
