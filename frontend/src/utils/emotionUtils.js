export const EMOTION_MAP = {
  happy: { icon: '😊', color: 'text-yellow-400', description: 'Energetic & positive music' },
  sad: { icon: '😢', color: 'text-blue-400', description: 'Melancholy & soothing music' },
  angry: { icon: '😡', color: 'text-red-400', description: 'Powerful & aggressive music' },
  neutral: { icon: '😐', color: 'text-gray-400', description: 'Calm & balanced music' },
  fear: { icon: '😨', color: 'text-purple-400', description: 'Suspenseful & atmospheric music' },
  surprise: { icon: '😲', color: 'text-orange-400', description: 'Unexpected & dynamic music' },
  disgust: { icon: '🤢', color: 'text-green-400', description: 'Edgy & unconventional music' },
};

export const getEmotionDetails = (emotion) => {
  return EMOTION_MAP[emotion?.toLowerCase()] || {
    icon: '❓',
    color: 'text-white',
    description: 'Something unique for you'
  };
};
