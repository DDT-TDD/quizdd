import React, { useState } from 'react';
import RewardAnimation from './RewardAnimation';
import ProgressAnimation from './ProgressAnimation';
import LoadingAnimation from './LoadingAnimation';
import TransitionWrapper from './TransitionWrapper';

// Demo component to test all animations
const AnimationDemo: React.FC = () => {
  const [showReward, setShowReward] = useState(false);
  const [progress, setProgress] = useState(75);
  const [showContent, setShowContent] = useState(true);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Animation Demo</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>Reward Animations</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setShowReward(true)}>
            Show Success Animation
          </button>
        </div>
        <RewardAnimation
          type="success"
          isVisible={showReward}
          onComplete={() => setShowReward(false)}
          size="large"
        />
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Progress Animations</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <ProgressAnimation
            progress={progress}
            type="circular"
            size="medium"
            color="#4CAF50"
          />
          <ProgressAnimation
            progress={progress}
            type="linear"
            size="medium"
            color="#2196F3"
          />
          <ProgressAnimation
            progress={progress}
            type="wave"
            size="medium"
            color="#FF9800"
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Loading Animations</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <LoadingAnimation type="spinner" size="medium" />
          <LoadingAnimation type="dots" size="medium" />
          <LoadingAnimation type="pulse" size="medium" />
          <LoadingAnimation type="bounce" size="medium" />
          <LoadingAnimation type="quiz" size="medium" />
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Transition Animations</h2>
        <button 
          onClick={() => setShowContent(!showContent)}
          style={{ marginBottom: '20px' }}
        >
          Toggle Content
        </button>
        <TransitionWrapper
          type="slide"
          direction="up"
          duration={300}
          isVisible={showContent}
        >
          <div style={{ 
            padding: '20px', 
            background: '#f0f0f0', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3>Animated Content</h3>
            <p>This content slides in and out with smooth transitions!</p>
          </div>
        </TransitionWrapper>
      </section>
    </div>
  );
};

export default AnimationDemo;