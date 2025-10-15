import React from 'react';
import Lottie from 'lottie-react';
import styles from './RewardAnimation.module.css';

interface RewardAnimationProps {
  type: 'success' | 'failure' | 'achievement' | 'streak';
  isVisible: boolean;
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}

// Simple animation data for success (we'll use CSS animations as fallback)
const successAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { 
          a: 1, 
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0, 0, 100] },
            { t: 30, s: [120, 120, 100] },
            { t: 60, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [50, 50] }
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.2, 0.8, 0.2, 1] },
          o: { a: 0, k: 100 }
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

const RewardAnimation: React.FC<RewardAnimationProps> = ({
  type,
  isVisible,
  onComplete,
  size = 'medium'
}) => {
  const getAnimationData = () => {
    // In a real implementation, you'd have different animation files
    // For now, we'll use the same basic animation
    return successAnimationData;
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return styles.small;
      case 'large': return styles.large;
      default: return styles.medium;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success': return styles.success;
      case 'failure': return styles.failure;
      case 'achievement': return styles.achievement;
      case 'streak': return styles.streak;
      default: return styles.success;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`${styles.container} ${getSizeClass()} ${getTypeClass()}`}>
      <div className={styles.animationWrapper}>
        <Lottie
          animationData={getAnimationData()}
          loop={false}
          autoplay={true}
          onComplete={onComplete}
          className={styles.lottieAnimation}
        />
        {/* Fallback CSS animation */}
        <div className={styles.fallbackAnimation}>
          <div className={styles.circle}></div>
          <div className={styles.checkmark}>✓</div>
        </div>
      </div>
      
      {/* Particle effects */}
      <div className={styles.particles}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`${styles.particle} ${styles[`particle${i + 1}`]}`}></div>
        ))}
      </div>
    </div>
  );
};

export default RewardAnimation;