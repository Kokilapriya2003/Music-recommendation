import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const emotionApi = {
  detect: async (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');

    const response = await api.post('/api/emotion/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const recommendationApi = {
  getRecommendations: async (emotion) => {
    const response = await api.post('/api/recommendations', { emotion });
    return response.data;
  },
  getSongs: async () => {
    const response = await api.get('/api/songs');
    return response.data;
  },
  getSongsByEmotion: async (emotion) => {
    const response = await api.get(`/api/songs/${emotion}`);
    return response.data;
  },
};

export default api;
