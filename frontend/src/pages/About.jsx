import React from 'react';

const About = () => {
  const techStack = [
    { name: 'React', desc: 'Frontend UI framework' },
    { name: 'Vite', desc: 'Next-generation frontend tooling' },
    { name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
    { name: 'FastAPI', desc: 'High-performance Python API' },
    { name: 'OpenCV', desc: 'Computer vision library' },
    { name: 'DeepFace', desc: 'Facial expression analysis' },
    { name: 'Pydantic', desc: 'Data validation' },
    { name: 'JavaScript', desc: 'Web interactivity' },
  ];

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">About MoodTune AI</h2>
        <p className="text-gray-400 text-lg">The intersection of artificial intelligence, computer vision, and music.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-brand-accent">The Vision</h3>
          <p className="text-gray-300 leading-relaxed">
            MoodTune AI is designed to create a seamless emotional connection between the user and their music.
            By analyzing facial landmarks and expressions, the system estimates the user's current state and
            recommends music that either complements or enhances that mood.
          </p>

          <h3 className="text-2xl font-bold text-brand-accent mt-8">How It Works</h3>
          <div className="space-y-4">
            {[
              { step: 'Capture', text: 'Webcam captures a frame of your face.' },
              { step: 'Analyze', text: 'DeepFace AI estimates the dominant emotion.' },
              { step: 'Match', text: 'Our recommendation engine scores songs by emotion, energy, and mood.' },
              { step: 'Play', text: 'You get a curated list of music perfectly tuned to you.' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="bg-brand-accent/20 text-brand-accent font-bold px-2 py-1 rounded text-xs">{item.step}</span>
                <p className="text-gray-400 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h3 className="text-2xl font-bold text-brand-accent">Tech Stack</h3>
          <div className="grid grid-cols-2 gap-4">
            {techStack.map((tech, idx) => (
              <div key={idx} className="glass-card p-4 text-center">
                <p className="font-bold text-white">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 bg-purple-900/10 border-purple-500/20">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              🔒 Privacy First
            </h3>
            <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4">
              <li>Camera frames are processed in memory and not stored.</li>
              <li>No facial images are uploaded to any permanent database.</li>
              <li>Your detection history is stored locally in your browser.</li>
              <li>No personal data is collected or tracked.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
