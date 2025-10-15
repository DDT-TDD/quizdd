// @ts-nocheck
/**
 * Animation Performance Optimizer
 * Ensures smooth 60fps animations and manages animation resources
 */

interface AnimationConfig {
  targetFPS: number;
  enableGPUAcceleration: boolean;
  reduceMotionRespect: boolean;
  memoryLimit: number; // MB
  maxConcurrentAnimations: number;
}

interface PerformanceMetrics {
  currentFPS: number;
  frameDrops: number;
  memoryUsage: number;
  activeAnimations: number;
  lastFrameTime: number;
}

class AnimationOptimizer {
  private config: AnimationConfig;
  private metrics: PerformanceMetrics;
  private frameTimeHistory: number[] = [];
  private animationRegistry: Map<string, Animation> = new Map();
  private rafId: number | null = null;
  private isMonitoring: boolean = false;

  constructor() {
    this.config = {
      targetFPS: 60,
      enableGPUAcceleration: true,
      reduceMotionRespect: true,
      memoryLimit: 20, // 20MB for animations
      maxConcurrentAnimations: 5,
    };

    this.metrics = {
      currentFPS: 60,
      frameDrops: 0,
      memoryUsage: 0,
      activeAnimations: 0,
      lastFrameTime: performance.now(),
    };

    this.initializeOptimizations();
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize CSS and browser optimizations
   */
  private initializeOptimizations(): void {
    // Add CSS optimizations for better performance
    const style = document.createElement('style');
    style.textContent = `
      /* GPU Acceleration for animations */
      .optimized-animation {
        will-change: transform, opacity;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        .respect-reduced-motion {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* Performance optimized transitions */
      .smooth-transition {
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 0.3s;
      }

      /* Memory efficient animations */
      .memory-efficient {
        contain: layout style paint;
        content-visibility: auto;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Optimize element for animation performance
   */
  optimizeElement(element: HTMLElement, animationType: 'transform' | 'opacity' | 'complex' = 'transform'): void {
    // Add performance classes
    element.classList.add('optimized-animation');
    
    if (this.config.reduceMotionRespect) {
      element.classList.add('respect-reduced-motion');
    }

    // Set appropriate CSS properties for GPU acceleration
    const style = element.style;
    
    switch (animationType) {
      case 'transform':
        style.willChange = 'transform';
        break;
      case 'opacity':
        style.willChange = 'opacity';
        break;
      case 'complex':
        style.willChange = 'transform, opacity, filter';
        break;
    }

    // Enable hardware acceleration
    if (this.config.enableGPUAcceleration) {
      style.transform = style.transform || 'translateZ(0)';
    }

    // Add memory efficiency
    element.classList.add('memory-efficient');
  }

  /**
   * Create optimized animation with performance monitoring
   */
  createOptimizedAnimation(
    element: HTMLElement,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions & { id?: string } = {}
  ): Animation {
    const animationId = options.id || `anim_${Date.now()}_${Math.random()}`;
    
    // Check if we're at the concurrent animation limit
    if (this.animationRegistry.size >= this.config.maxConcurrentAnimations) {
      this.cleanupOldAnimations();
    }

    // Optimize element before animation
    this.optimizeElement(element, 'complex');

    // Create animation with performance optimizations
    const optimizedOptions: KeyframeAnimationOptions = {
      ...options,
      // Ensure smooth timing
      easing: options.easing || 'cubic-bezier(0.4, 0, 0.2, 1)',
      // Set reasonable duration if not specified
      duration: options.duration || 300,
    };

    const animation = element.animate(keyframes, optimizedOptions);
    
    // Register animation for monitoring
    this.animationRegistry.set(animationId, animation);
    this.metrics.activeAnimations = this.animationRegistry.size;

    // Clean up when animation finishes
    animation.addEventListener('finish', () => {
      this.cleanupAnimation(animationId, element);
    });

    animation.addEventListener('cancel', () => {
      this.cleanupAnimation(animationId, element);
    });

    return animation;
  }

  /**
   * Create optimized Lottie animation
   */
  createOptimizedLottie(
    container: HTMLElement,
    animationData: any,
    options: {
      loop?: boolean;
      autoplay?: boolean;
      renderer?: 'svg' | 'canvas' | 'html';
      id?: string;
    } = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Optimize container
      this.optimizeElement(container, 'complex');

      // Choose optimal renderer based on performance
      const renderer = options.renderer || this.getOptimalRenderer();

      const lottieOptions = {
        container,
        animationData,
        renderer,
        loop: options.loop ?? false,
        autoplay: options.autoplay ?? true,
        // Performance optimizations
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
          clearCanvas: true,
          progressiveLoad: true,
          hideOnTransparent: true,
        },
      };

      // Dynamically import Lottie to avoid bundle bloat
      import('lottie-web').then((lottie) => {
        try {
          const animation = lottie.default.loadAnimation(lottieOptions);
          
          const animationId = options.id || `lottie_${Date.now()}`;
          
          // Monitor Lottie performance
          animation.addEventListener('DOMLoaded', () => {
            this.animationRegistry.set(animationId, animation as any);
            this.metrics.activeAnimations = this.animationRegistry.size;
          });

          animation.addEventListener('complete', () => {
            this.cleanupAnimation(animationId, container);
          });

          resolve(animation);
        } catch (error) {
          reject(error);
        }
      }).catch(reject);
    });
  }

  /**
   * Get optimal renderer based on device capabilities
   */
  private getOptimalRenderer(): 'svg' | 'canvas' | 'html' {
    // Check device capabilities
    const canvas = document.createElement('canvas');
    const hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    
    // Check if device prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return 'svg'; // SVG is more predictable for reduced motion
    }
    
    if (hasWebGL && this.config.enableGPUAcceleration) {
      return 'canvas'; // Canvas with WebGL acceleration
    }
    
    return 'svg'; // Fallback to SVG
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    const monitorFrame = (timestamp: number) => {
      // Calculate FPS
      const deltaTime = timestamp - this.metrics.lastFrameTime;
      this.metrics.lastFrameTime = timestamp;
      
      if (deltaTime > 0) {
        const currentFPS = 1000 / deltaTime;
        this.frameTimeHistory.push(currentFPS);
        
        // Keep only last 60 frames for average
        if (this.frameTimeHistory.length > 60) {
          this.frameTimeHistory.shift();
        }
        
        // Calculate average FPS
        this.metrics.currentFPS = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        
        // Detect frame drops
        if (currentFPS < this.config.targetFPS * 0.8) {
          this.metrics.frameDrops++;
          this.handlePerformanceIssue();
        }
      }
      
      this.rafId = requestAnimationFrame(monitorFrame);
    };
    
    this.rafId = requestAnimationFrame(monitorFrame);
  }

  /**
   * Handle performance issues by reducing animation quality
   */
  private handlePerformanceIssue(): void {
    // If we have too many frame drops, reduce animation quality
    if (this.metrics.frameDrops > 10) {
      this.reduceAnimationQuality();
      this.metrics.frameDrops = 0; // Reset counter
    }
  }

  /**
   * Reduce animation quality to improve performance
   */
  private reduceAnimationQuality(): void {
    console.warn('Performance issue detected, reducing animation quality');
    
    // Pause non-essential animations
    let pausedCount = 0;
    for (const [id, animation] of this.animationRegistry.entries()) {
      if (pausedCount >= 2) break; // Pause up to 2 animations
      
      if (animation.playState === 'running') {
        animation.pause();
        pausedCount++;
      }
    }
    
    // Disable GPU acceleration temporarily if performance is still poor
    if (this.metrics.currentFPS < 30) {
      this.config.enableGPUAcceleration = false;
      setTimeout(() => {
        this.config.enableGPUAcceleration = true;
      }, 5000); // Re-enable after 5 seconds
    }
  }

  /**
   * Clean up animation and restore element
   */
  private cleanupAnimation(animationId: string, element: HTMLElement): void {
    this.animationRegistry.delete(animationId);
    this.metrics.activeAnimations = this.animationRegistry.size;
    
    // Clean up element styles
    const style = element.style;
    style.willChange = 'auto';
    
    // Remove optimization classes if no other animations are running
    if (this.metrics.activeAnimations === 0) {
      element.classList.remove('optimized-animation');
    }
  }

  /**
   * Clean up old or finished animations
   */
  private cleanupOldAnimations(): void {
    for (const [id, animation] of this.animationRegistry.entries()) {
      if (animation.playState === 'finished' || animation.playState === 'idle') {
        this.animationRegistry.delete(id);
      }
    }
    this.metrics.activeAnimations = this.animationRegistry.size;
  }

  /**
   * Pause all animations (useful for performance or accessibility)
   */
  pauseAllAnimations(): void {
    for (const animation of this.animationRegistry.values()) {
      if (animation.playState === 'running') {
        animation.pause();
      }
    }
  }

  /**
   * Resume all paused animations
   */
  resumeAllAnimations(): void {
    for (const animation of this.animationRegistry.values()) {
      if (animation.playState === 'paused') {
        animation.play();
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if device supports smooth animations
   */
  canHandleSmoothAnimations(): boolean {
    return this.metrics.currentFPS >= this.config.targetFPS * 0.9 &&
           this.metrics.frameDrops < 5;
  }

  /**
   * Dispose of the optimizer
   */
  dispose(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.isMonitoring = false;
    this.pauseAllAnimations();
    this.animationRegistry.clear();
  }
}

// Export singleton instance
export const animationOptimizer = new AnimationOptimizer();
export default animationOptimizer;

// Utility functions for common animation patterns
export const createFadeIn = (element: HTMLElement, duration = 300) => {
  return animationOptimizer.createOptimizedAnimation(
    element,
    [
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ],
    { duration, easing: 'ease-out' }
  );
};

export const createSlideIn = (element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'left', duration = 300) => {
  const transforms = {
    left: ['translateX(-100%)', 'translateX(0)'],
    right: ['translateX(100%)', 'translateX(0)'],
    up: ['translateY(-100%)', 'translateY(0)'],
    down: ['translateY(100%)', 'translateY(0)']
  };

  return animationOptimizer.createOptimizedAnimation(
    element,
    [
      { transform: transforms[direction][0], opacity: 0 },
      { transform: transforms[direction][1], opacity: 1 }
    ],
    { duration, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
  );
};

export const createBounce = (element: HTMLElement, scale = 1.1, duration = 200) => {
  return animationOptimizer.createOptimizedAnimation(
    element,
    [
      { transform: 'scale(1)' },
      { transform: `scale(${scale})` },
      { transform: 'scale(1)' }
    ],
    { duration, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
  );
};