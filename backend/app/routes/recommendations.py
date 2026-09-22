from fastapi import APIRouter, HTTPException
from ..services.recommendation_service import recommendation_service
from ..models.schemas import RecommendationRequest, RecommendationResponse
from typing import List

router = APIRouter()

@router.post("/", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    try:
        limit = request.limit if request.limit and request.limit > 0 else 10
        recs = recommendation_service.get_recommendations(request.emotion, limit=limit)
        return RecommendationResponse(
            emotion=request.emotion,
            recommendations=recs
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
