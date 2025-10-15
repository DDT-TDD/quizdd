import React from 'react';
import styles from './LoadingAnimation.module.css';

interface LoadingAnimationProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'quiz';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'medium',
  color = '#4CAF50',
  message,
  overlay = false
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return styles.small;
      case 'large': return styles.large;
      default: return styles.medium;
    }
  };

  const renderSpinner = () => (
    <div className={`${styles.spinner} ${getSizeClass()}`} style={{ borderTopColor: color }}>
      <div className={styles.spinnerInner}></div>
    </div>
  );

  const renderDots = () => (
    <div className={`${styles.dots} ${getSizeClass()}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={styles.dot}
          style={{ 
            backgroundColor: color,
            animationDelay: `${i * 0.2}s`
          }}
        ></div>
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${styles.pulse} ${getSizeClass()}`}>
      <div className={styles.pulseRing} style={{ borderColor: color }}></div>
      <div className={styles.pulseCore} style={{ backgroundColor: color }}></div>
    </div>
  );

  const renderBounce = () => (
    <div className={`${styles.bounce} ${getSizeClass()}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={styles.bounceItem}
          style={{ 
            backgroundColor: color,
            animationDelay: `${i * 0.1}s`
          }}
        ></div>
      ))}
    </div>
  );

  const renderQuizLoader = () => (
    <div className={`${styles.quizLoader} ${getSizeClass()}`}>
      <div className={styles.book}>
        <div className={styles.bookPages}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.page}
              style={{ animationDelay: `${i * 0.3}s` }}
            ></div>
          ))}
        </div>
        <div className={styles.bookSpine} style={{ backgroundColor: color }}></div>
      </div>
      <div className={styles.questionMarks}>
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className={styles.questionMark}
            style={{ 
              color: color,
              animationDelay: `${i * 0.4}s`
            }}
          >
            ?
          </span>
        ))}
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'bounce': return renderBounce();
      case 'quiz': return renderQuizLoader();
      default: return renderSpinner();
    }
  };

  const content = (
    <div className={styles.container}>
      {renderLoader()}
      {message && (
        <div className={styles.message} style={{ color }}>
          {message}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className={styles.overlay}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingAnimation;