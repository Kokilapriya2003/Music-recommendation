import React from 'react';
import { getEmotionDetails } from '../utils/emotionUtils';

const EmotionCard = ({ emotion, confidence, description }) => {
  const { icon, color } = getEmotionDetails(emotion);

  return (
    <div className="glass-card p-8 text-center max-w-md mx-auto animate-in zoom-in duration-500">
      <div className="text-7xl mb-4">{icon}</div>
      <h3 className={`text-3xl font-bold uppercase mb-2 ${color}`}>{emotion}</h3>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1 text-gray-400">
          <span>Model Confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${color.replace('text', 'bg')}`}
            style={{ width: `${confidence * 100}%` }}
          ></div>
        </div>
      </div>

      <p className="text-gray-300 italic">{description || getEmotionDetails(emotion).description}</p>
    </div>
  );
};

export default EmotionCard;
