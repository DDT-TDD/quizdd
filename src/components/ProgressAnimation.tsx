import React, { useEffect, useState } from 'react';
import styles from './ProgressAnimation.module.css';

interface ProgressAnimationProps {
  progress: number; // 0-100
  type?: 'circular' | 'linear' | 'wave';
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  animated?: boolean;
  color?: string;
  className?: string;
}

const ProgressAnimation: React.FC<ProgressAnimationProps> = ({
  progress,
  type = 'circular',
  size = 'medium',
  showPercentage = true,
  animated = true,
  color = '#4CAF50',
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  const getSizeClass = () => {
    switch (size) {
      case 'small': return styles.small;
      case 'large': return styles.large;
      default: return styles.medium;
    }
  };

  const renderCircularProgress = () => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    return (
      <div className={`${styles.circularContainer} ${getSizeClass()}`}>
        <svg className={styles.circularSvg} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={styles.progressCircle}
            style={{
              transition: animated ? 'stroke-dashoffset 1s ease-in-out' : 'none'
            }}
          />
        </svg>
        {showPercentage && (
          <div className={styles.percentageText} style={{ color }}>
            {Math.round(animatedProgress)}%
          </div>
        )}
        {/* Sparkle effects for high progress */}
        {animatedProgress > 80 && (
          <div className={styles.sparkles}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.sparkle} ${styles[`sparkle${i + 1}`]}`}>✨</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLinearProgress = () => {
    return (
      <div className={`${styles.linearContainer} ${getSizeClass()}`}>
        <div className={styles.linearTrack}>
          <div
            className={styles.linearFill}
            style={{
              width: `${animatedProgress}%`,
              backgroundColor: color,
              transition: animated ? 'width 1s ease-in-out' : 'none'
            }}
          >
            {/* Animated shine effect */}
            <div className={styles.shine}></div>
          </div>
        </div>
        {showPercentage && (
          <div className={styles.linearPercentage} style={{ color }}>
            {Math.round(animatedProgress)}%
          </div>
        )}
      </div>
    );
  };

  const renderWaveProgress = () => {
    return (
      <div className={`${styles.waveContainer} ${getSizeClass()}`}>
        <div className={styles.waveBackground}>
          <div
            className={styles.wave}
            style={{
              height: `${animatedProgress}%`,
              transition: animated ? 'height 1s ease-in-out' : 'none'
            }}
          >
            <div className={styles.waveAnimation} style={{ backgroundColor: color }}>
              <div className={styles.waveTop}></div>
            </div>
          </div>
        </div>
        {showPercentage && (
          <div className={styles.wavePercentage} style={{ color }}>
            {Math.round(animatedProgress)}%
          </div>
        )}
      </div>
    );
  };

  const renderProgress = () => {
    switch (type) {
      case 'linear': return renderLinearProgress();
      case 'wave': return renderWaveProgress();
      default: return renderCircularProgress();
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {renderProgress()}
    </div>
  );
};

export default ProgressAnimation;