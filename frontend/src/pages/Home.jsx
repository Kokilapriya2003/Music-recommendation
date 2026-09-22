import React from 'react';
import { Info, History, Music, Sparkles, Smile, Headphones, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CameraView from '../components/CameraView';

const Home = () => {
  const navigate = useNavigate();

  const handleEmotionDetected = (result) => {
    navigate('/recommendations', { state: result });
  };

  const handleQuickMoodClick = (mood) => {
    navigate('/recommendations', {
      state: { emotion: mood.toLowerCase(), confidence: 0.95 },
    });
  };

  return (
    <div className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 space-y-8">
        <div className="inline-flex items-center gap-2 bg-brand-accent/20 text-brand-accent px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> AI-Powered Music Discovery
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          Music Recommendation <br />
          <span className="gradient-text">Based on Facial Expressions</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Discover music that understands how you feel. MoodTune AI estimates your facial expression in real time and curates the perfect soundtrack for your state of mind.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            to="/recommendations"
            className="bg-brand-accent hover:bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-600/30 flex items-center gap-2"
          >
            <Headphones className="w-5 h-5" /> Detect My Mood
          </Link>
          <Link
            to="/about"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Info className="w-5 h-5" /> How It Works
          </Link>
        </div>
      </section>

      {/* Live Detector Section */}
      <section className="py-12">
        <CameraView onEmotionDetected={handleEmotionDetected} />
      </section>

      {/* Quick Mood Shortcuts */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold mb-3">Or Explore by Expression</h2>
        <p className="text-gray-400 text-sm mb-6">Click any mood to get instant music recommendations</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { name: 'Happy', emoji: '😊', color: 'hover:border-yellow-400/50' },
            { name: 'Sad', emoji: '😢', color: 'hover:border-blue-400/50' },
            { name: 'Angry', emoji: '😡', color: 'hover:border-red-400/50' },
            { name: 'Surprise', emoji: '😲', color: 'hover:border-orange-400/50' },
            { name: 'Neutral', emoji: '😐', color: 'hover:border-purple-400/50' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => handleQuickMoodClick(item.name)}
              className={`px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm font-semibold ${item.color}`}
            >
              <span className="text-lg">{item.emoji}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Detect Expression',
              desc: 'Our vision engine detects your face via live webcam or photo upload.',
              icon: <Smile className="w-6 h-6" />,
            },
            {
              step: '02',
              title: 'Analyze Emotion',
              desc: 'AI analyzes facial cues (smiles, landmarks, tension) with zero latency.',
              icon: <Sparkles className="w-6 h-6" />,
            },
            {
              step: '03',
              title: 'Personalized Audio',
              desc: 'Scored by emotion, tempo, energy, and mood for a tailored listening experience.',
              icon: <Music className="w-6 h-6" />,
            },
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-8 group hover:border-brand-accent/50 transition-all rounded-2xl">
              <div className="text-brand-accent font-black text-4xl mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                {item.step}
              </div>
              <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-brand-accent">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="py-12 glass-card p-8 text-center max-w-3xl mx-auto rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
          <span>🔒</span> Privacy-First Architecture
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Your privacy is strictly respected. Video and image frames are analyzed transiently in memory and are never saved or uploaded to permanent databases. Detection history remains exclusively in your browser's local storage.
        </p>
      </section>
    </div>
  );
};

export default Home;
