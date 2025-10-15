import React, { useEffect, useState } from 'react';
import styles from './TransitionWrapper.module.css';

interface TransitionWrapperProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  isVisible?: boolean;
  className?: string;
}

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 300,
  delay = 0,
  isVisible = true,
  className = ''
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setAnimationClass(getAnimationClass(true));
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationClass(getAnimationClass(false));
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const getAnimationClass = (entering: boolean) => {
    const baseClass = styles[type];
    const directionClass = direction ? styles[`${type}${direction.charAt(0).toUpperCase() + direction.slice(1)}`] : '';
    const stateClass = entering ? styles.enter : styles.exit;
    
    return `${baseClass} ${directionClass} ${stateClass}`.trim();
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.wrapper} ${animationClass} ${className}`}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

export default TransitionWrapper;