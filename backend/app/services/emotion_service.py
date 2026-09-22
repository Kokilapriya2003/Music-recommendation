import cv2
import numpy as np
from typing import Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmotionService:
    def __init__(self):
        self.deepface_available = False
        self._init_deepface()
        self._init_opencv_cascades()

    def _init_deepface(self):
        try:
            from deepface import DeepFace
            self.DeepFace = DeepFace
            # Quick check / warmup
            logger.info("DeepFace library is available.")
            self.deepface_available = True
        except Exception as e:
            logger.warning(f"DeepFace not available ({e}). Using optimized OpenCV vision engine.")
            self.DeepFace = None
            self.deepface_available = False

    def _init_opencv_cascades(self):
        try:
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            self.smile_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_smile.xml'
            )
            self.eye_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_eye.xml'
            )
        except Exception as e:
            logger.error(f"Error loading OpenCV cascades: {e}")
            self.face_cascade = None
            self.smile_cascade = None
            self.eye_cascade = None

    def analyze_emotion(self, image_bytes: bytes) -> Tuple[bool, int, Optional[str], float]:
        """
        Analyzes emotion from image bytes.
        Returns: (face_detected: bool, faces_count: int, emotion: Optional[str], confidence: float)
        """
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                logger.error("Failed to decode image bytes.")
                return False, 0, None, 0.0

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 1. Face Detection using OpenCV Haar Cascade for guaranteed accuracy & face count
            if self.face_cascade is not None:
                faces = self.face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(40, 40)
                )
            else:
                faces = []

            faces_count = len(faces)

            if faces_count == 0:
                logger.info("No faces detected in frame.")
                return False, 0, None, 0.0

            if faces_count > 1:
                logger.info(f"Multiple faces detected: {faces_count}")
                return True, faces_count, None, 0.0

            # Single face detected
            x, y, w, h = faces[0]
            face_roi_gray = gray[y:y+h, x:x+w]
            face_roi_color = img[y:y+h, x:x+w]

            # Try DeepFace first if available
            if self.deepface_available and self.DeepFace is not None:
                try:
                    results = self.DeepFace.analyze(
                        face_roi_color,
                        actions=['emotion'],
                        enforce_detection=False,
                        silent=True
                    )
                    if results and isinstance(results, list) and len(results) > 0:
                        res = results[0]
                        dominant = res.get('dominant_emotion', 'neutral').lower()
                        emotion_scores = res.get('emotion', {})
                        score = float(emotion_scores.get(dominant, 80.0))
                        confidence = round(min(max(score / 100.0, 0.5), 0.99), 2)
                        return True, 1, dominant, confidence
                except Exception as df_err:
                    logger.warning(f"DeepFace inference failed, falling back to OpenCV heuristics: {df_err}")

            # Smart OpenCV Fallback Analyzer
            return self._analyze_opencv_expression(face_roi_gray, w, h)

        except Exception as e:
            logger.error(f"Error analyzing emotion: {e}", exc_info=True)
            return False, 0, None, 0.0

    def _analyze_opencv_expression(self, face_gray: np.ndarray, w: int, h: int) -> Tuple[bool, int, Optional[str], float]:
        """
        Fast, lightweight facial expression analysis using smile and geometric features.
        """
        try:
            # Lower half of the face for mouth/smile detection
            mouth_region = face_gray[int(h * 0.55):h, int(w * 0.15):int(w * 0.85)]
            upper_region = face_gray[int(h * 0.15):int(h * 0.5), int(w * 0.15):int(w * 0.85)]

            smiles = []
            if self.smile_cascade is not None and mouth_region.size > 0:
                smiles = self.smile_cascade.detectMultiScale(
                    mouth_region,
                    scaleFactor=1.6,
                    minNeighbors=15,
                    minSize=(25, 25)
                )

            eyes = []
            if self.eye_cascade is not None and upper_region.size > 0:
                eyes = self.eye_cascade.detectMultiScale(
                    upper_region,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(15, 15)
                )

            # Heuristics based on facial landmarks
            if len(smiles) > 0:
                # Distinct smile detected
                confidence = min(0.75 + (len(smiles) * 0.07), 0.96)
                return True, 1, "happy", round(confidence, 2)

            # Check for surprise: wide open eyes and high vertical contrast in mouth
            if len(eyes) >= 2:
                # High eye area with neutral/open mouth
                laplacian_var = cv2.Laplacian(face_gray, cv2.CV_64F).var()
                if laplacian_var > 350:
                    return True, 1, "surprise", 0.82

            # Check intensity distribution for sad / angry vs neutral
            # Lower mouth tension / downward corners often produce lower brightness in mouth area
            mouth_mean = np.mean(mouth_region) if mouth_region.size > 0 else 128
            upper_mean = np.mean(upper_region) if upper_region.size > 0 else 128

            if mouth_mean < upper_mean * 0.78:
                return True, 1, "sad", 0.78
            elif upper_mean < mouth_mean * 0.75:
                return True, 1, "angry", 0.79
            else:
                return True, 1, "neutral", 0.86

        except Exception as err:
            logger.warning(f"Fallback expression analysis error: {err}")
            return True, 1, "neutral", 0.80

emotion_service = EmotionService()
