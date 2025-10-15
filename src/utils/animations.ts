import { useEffect, useState, useCallback } from 'react';

// Animation utility functions
export const AnimationUtils = {
  // Stagger animations for lists
  getStaggerDelay: (index: number, baseDelay: number = 100): number => {
    return index * baseDelay;
  },

  // Get random animation delay for organic feel
  getRandomDelay: (min: number = 0, max: number = 500): number => {
    return Math.random() * (max - min) + min;
  },

  // Easing functions
  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  easeOut: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },

  easeIn: (t: number): number => {
    return t * t * t;
  },

  // Bounce easing
  easeBounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },

  // Animation frame utilities
  requestAnimationFrame: (callback: FrameRequestCallback): number => {
    return window.requestAnimationFrame(callback);
  },

  cancelAnimationFrame: (id: number): void => {
    window.cancelAnimationFrame(id);
  }
};

// Hook for managing animation states
export const useAnimation = (initialState: boolean = false) => {
  const [isAnimating, setIsAnimating] = useState(initialState);
  const [animationId, setAnimationId] = useState<number | null>(null);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationId) {
      AnimationUtils.cancelAnimationFrame(animationId);
      setAnimationId(null);
    }
  }, [animationId]);

  const animate = useCallback((callback: FrameRequestCallback) => {
    const id = AnimationUtils.requestAnimationFrame(callback);
    setAnimationId(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      if (animationId) {
        AnimationUtils.cancelAnimationFrame(animationId);
      }
    };
  }, [animationId]);

  return {
    isAnimating,
    startAnimation,
    stopAnimation,
    animate
  };
};

// Hook for staggered list animations
export const useStaggeredAnimation = (itemCount: number, delay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false));

  const startStaggeredAnimation = useCallback(() => {
    const newVisibleItems = new Array(itemCount).fill(false);
    setVisibleItems(newVisibleItems);

    // Stagger the appearance of items
    for (let i = 0; i < itemCount; i++) {
      setTimeout(() => {
        setVisibleItems(prev => {
          const updated = [...prev];
          updated[i] = true;
          return updated;
        });
      }, i * delay);
    }
  }, [itemCount, delay]);

  const resetAnimation = useCallback(() => {
    setVisibleItems(new Array(itemCount).fill(false));
  }, [itemCount]);

  return {
    visibleItems,
    startStaggeredAnimation,
    resetAnimation
  };
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  const ref = useCallback((node: Element | null) => {
    if (node) setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold]);

  return { ref, isVisible };
};

// Hook for managing multiple animation sequences
export const useAnimationSequence = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSequence = useCallback((steps: Array<{ delay: number; action: () => void }>) => {
    setIsPlaying(true);
    setCurrentStep(0);

    steps.forEach((step, index) => {
      setTimeout(() => {
        step.action();
        setCurrentStep(index + 1);
        
        if (index === steps.length - 1) {
          setIsPlaying(false);
        }
      }, step.delay);
    });
  }, []);

  const resetSequence = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return {
    currentStep,
    isPlaying,
    playSequence,
    resetSequence
  };
};

// Performance monitoring for animations
export const AnimationPerformance = {
  // Check if device prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check device performance capabilities
  isLowEndDevice: (): boolean => {
    // Simple heuristic based on hardware concurrency and memory
    const cores = navigator.hardwareConcurrency || 1;
    const memory = (navigator as any).deviceMemory || 1;
    
    return cores <= 2 || memory <= 2;
  },

  // Get recommended animation settings based on device
  getRecommendedSettings: () => {
    const prefersReduced = AnimationPerformance.prefersReducedMotion();
    const isLowEnd = AnimationPerformance.isLowEndDevice();

    return {
      enableAnimations: !prefersReduced,
      enableComplexAnimations: !prefersReduced && !isLowEnd,
      animationDuration: prefersReduced ? 0 : isLowEnd ? 200 : 300,
      enableParticleEffects: !prefersReduced && !isLowEnd,
      enableLottieAnimations: !prefersReduced && !isLowEnd
    };
  }
};

// Animation constants
export const ANIMATION_CONSTANTS = {
  DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 800
  },
  DELAYS: {
    STAGGER: 100,
    SHORT: 200,
    MEDIUM: 500,
    LONG: 1000
  },
  EASINGS: {
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

export default AnimationUtils;