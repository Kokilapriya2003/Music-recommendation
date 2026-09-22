from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.emotion_service import emotion_service
from ..models.schemas import EmotionDetectionResponse

router = APIRouter()

@router.post("/detect", response_model=EmotionDetectionResponse)
async def detect_emotion(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty image file received.")
        
        face_detected, faces_count, emotion, confidence = emotion_service.analyze_emotion(contents)

        if not face_detected:
            return EmotionDetectionResponse(
                success=False,
                face_detected=False,
                faces_count=faces_count,
                emotion=None,
                confidence=0.0
            )

        if faces_count > 1:
            return EmotionDetectionResponse(
                success=False,
                face_detected=True,
                faces_count=faces_count,
                emotion=None,
                confidence=0.0
            )

        return EmotionDetectionResponse(
            success=True,
            face_detected=True,
            faces_count=faces_count,
            emotion=emotion,
            confidence=confidence
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/supported")
async def get_supported_emotions():
    return {
        "emotions": [
            {"id": "happy", "label": "Happy", "emoji": "😊", "description": "Joyful, cheerful and uplifting music"},
            {"id": "sad", "label": "Sad", "emoji": "😢", "description": "Gentle, reflective and consoling music"},
            {"id": "angry", "label": "Angry", "emoji": "😡", "description": "High-intensity, powerful rock & metal tracks"},
            {"id": "neutral", "label": "Neutral", "emoji": "😐", "description": "Balanced, focus, ambient and lo-fi beats"},
            {"id": "surprise", "label": "Surprise", "emoji": "😲", "description": "Dynamic, vibrant and eclectic grooves"},
            {"id": "fear", "label": "Fear", "emoji": "😨", "description": "Atmospheric, suspenseful and dark ambient"},
            {"id": "disgust", "label": "Disgust", "emoji": "🤢", "description": "Raw, edgy and alternative music"}
        ]
    }
