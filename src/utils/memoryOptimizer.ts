/**
 * Memory Usage Optimizer for Long Quiz Sessions
 * Prevents memory leaks and manages resource usage during extended sessions
 */

interface MemoryConfig {
  maxMemoryMB: number;
  cleanupInterval: number; // milliseconds
  warningThreshold: number; // percentage of max memory
  aggressiveCleanupThreshold: number; // percentage of max memory
  enableAutoCleanup: boolean;
}

interface MemoryMetrics {
  estimatedUsageMB: number;
  domNodeCount: number;
  eventListenerCount: number;
  imageCount: number;
  lastCleanupTime: number;
  cleanupCount: number;
}

interface ResourceTracker {
  images: Set<HTMLImageElement>;
  eventListeners: Map<EventTarget, Set<{ type: string; listener: EventListener }>>;
  intervals: Set<number>;
  timeouts: Set<number>;
  observers: Set<IntersectionObserver | MutationObserver | ResizeObserver>;
  blobUrls: Set<string>;
}

class MemoryOptimizer {
  private config: MemoryConfig;
  private metrics: MemoryMetrics;
  private resources: ResourceTracker;
  private cleanupTimer: number | null = null;
  private isMonitoring: boolean = false;

  constructor() {
    this.config = {
      maxMemoryMB: 100, // 100MB limit for quiz sessions
      cleanupInterval: 30000, // Clean up every 30 seconds
      warningThreshold: 70, // Warn at 70% memory usage
      aggressiveCleanupThreshold: 85, // Aggressive cleanup at 85%
      enableAutoCleanup: true,
    };

    this.metrics = {
      estimatedUsageMB: 0,
      domNodeCount: 0,
      eventListenerCount: 0,
      imageCount: 0,
      lastCleanupTime: Date.now(),
      cleanupCount: 0,
    };

    this.resources = {
      images: new Set(),
      eventListeners: new Map(),
      intervals: new Set(),
      timeouts: new Set(),
      observers: new Set(),
      blobUrls: new Set(),
    };

    this.startMemoryMonitoring();
    this.patchGlobalMethods();
  }

  /**
   * Start memory monitoring and automatic cleanup
   */
  private startMemoryMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    const monitor = () => {
      this.updateMemoryMetrics();
      
      if (this.config.enableAutoCleanup) {
        const usagePercentage = (this.metrics.estimatedUsageMB / this.config.maxMemoryMB) * 100;
        
        if (usagePercentage >= this.config.aggressiveCleanupThreshold) {
          this.performAggressiveCleanup();
        } else if (usagePercentage >= this.config.warningThreshold) {
          this.performGentleCleanup();
        }
      }
    };

    // Initial monitoring
    monitor();
    
    // Set up periodic monitoring
    this.cleanupTimer = window.setInterval(monitor, this.config.cleanupInterval);
  }

  /**
   * Patch global methods to track resource usage
   */
  private patchGlobalMethods(): void {
    // Track setTimeout calls
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = (callback: Function, delay?: number, ...args: any[]) => {
      const id = originalSetTimeout(callback, delay, ...args);
      this.resources.timeouts.add(id);
      return id;
    };

    // Track clearTimeout calls
    const originalClearTimeout = window.clearTimeout;
    window.clearTimeout = (id?: number) => {
      if (id !== undefined) {
        this.resources.timeouts.delete(id);
        originalClearTimeout(id);
      }
    };

    // Track setInterval calls
    const originalSetInterval = window.setInterval;
    window.setInterval = (callback: Function, delay?: number, ...args: any[]) => {
      const id = originalSetInterval(callback, delay, ...args);
      this.resources.intervals.add(id);
      return id;
    };

    // Track clearInterval calls
    const originalClearInterval = window.clearInterval;
    window.clearInterval = (id?: number) => {
      if (id !== undefined) {
        this.resources.intervals.delete(id);
        originalClearInterval(id);
      }
    };

    // Track URL.createObjectURL calls
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = (object: File | MediaSource | Blob) => {
      const url = originalCreateObjectURL(object);
      this.resources.blobUrls.add(url);
      return url;
    };

    // Track URL.revokeObjectURL calls
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.revokeObjectURL = (url: string) => {
      this.resources.blobUrls.delete(url);
      originalRevokeObjectURL(url);
    };
  }

  /**
   * Track image resources
   */
  trackImage(img: HTMLImageElement): void {
    this.resources.images.add(img);
    
    // Auto-remove when image is removed from DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === img) {
            this.resources.images.delete(img);
            observer.disconnect();
          }
        });
      });
    });
    
    if (img.parentNode) {
      observer.observe(img.parentNode, { childList: true });
      this.resources.observers.add(observer);
    }
  }

  /**
   * Track event listeners
   */
  trackEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    // Add the event listener
    target.addEventListener(type, listener, options);
    
    // Track it for cleanup
    if (!this.resources.eventListeners.has(target)) {
      this.resources.eventListeners.set(target, new Set());
    }
    
    this.resources.eventListeners.get(target)!.add({ type, listener });
  }

  /**
   * Track observers
   */
  trackObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver): void {
    this.resources.observers.add(observer);
  }

  /**
   * Update memory usage metrics
   */
  private updateMemoryMetrics(): void {
    // Count DOM nodes
    this.metrics.domNodeCount = document.querySelectorAll('*').length;
    
    // Count images
    this.metrics.imageCount = this.resources.images.size;
    
    // Count event listeners
    let totalListeners = 0;
    for (const listeners of this.resources.eventListeners.values()) {
      totalListeners += listeners.size;
    }
    this.metrics.eventListenerCount = totalListeners;
    
    // Estimate memory usage (rough calculation)
    this.metrics.estimatedUsageMB = this.estimateMemoryUsage();
  }

  /**
   * Estimate memory usage based on tracked resources
   */
  private estimateMemoryUsage(): number {
    let estimatedMB = 0;
    
    // DOM nodes (rough estimate: 1KB per node)
    estimatedMB += (this.metrics.domNodeCount * 1024) / (1024 * 1024);
    
    // Images (estimate based on typical sizes)
    estimatedMB += this.metrics.imageCount * 0.5; // 500KB per image average
    
    // Event listeners (small but can add up)
    estimatedMB += (this.metrics.eventListenerCount * 100) / (1024 * 1024);
    
    // Blob URLs (estimate)
    estimatedMB += this.resources.blobUrls.size * 0.1; // 100KB per blob average
    
    // Base application memory
    estimatedMB += 10; // 10MB base
    
    return estimatedMB;
  }

  /**
   * Perform gentle cleanup to free some memory
   */
  private performGentleCleanup(): void {
    console.log('Performing gentle memory cleanup...');
    
    // Clean up unused images
    this.cleanupUnusedImages();
    
    // Clean up old blob URLs
    this.cleanupOldBlobUrls();
    
    // Force garbage collection if available
    this.forceGarbageCollection();
    
    this.metrics.lastCleanupTime = Date.now();
    this.metrics.cleanupCount++;
  }

  /**
   * Perform aggressive cleanup to free significant memory
   */
  private performAggressiveCleanup(): void {
    console.warn('Performing aggressive memory cleanup due to high usage!');
    
    // All gentle cleanup actions
    this.performGentleCleanup();
    
    // Clean up all observers
    this.cleanupObservers();
    
    // Clean up old timeouts and intervals
    this.cleanupTimers();
    
    // Clear caches in other services
    this.clearExternalCaches();
    
    // Trigger browser garbage collection
    this.forceGarbageCollection();
  }

  /**
   * Clean up unused images
   */
  private cleanupUnusedImages(): void {
    const imagesToRemove: HTMLImageElement[] = [];
    
    for (const img of this.resources.images) {
      // Remove images that are no longer in the DOM
      if (!document.contains(img)) {
        imagesToRemove.push(img);
      }
      // Remove images that are not visible and have been loaded for a while
      else if (img.complete && !this.isElementVisible(img)) {
        const loadTime = img.dataset.loadTime;
        if (loadTime && Date.now() - parseInt(loadTime) > 60000) { // 1 minute old
          imagesToRemove.push(img);
        }
      }
    }
    
    imagesToRemove.forEach(img => {
      this.resources.images.delete(img);
      // Clear the image source to free memory
      img.src = '';
      img.srcset = '';
    });
    
    if (imagesToRemove.length > 0) {
      console.log(`Cleaned up ${imagesToRemove.length} unused images`);
    }
  }

  /**
   * Clean up old blob URLs
   */
  private cleanupOldBlobUrls(): void {
    // Note: We can't easily track blob URL age without additional metadata
    // This is a placeholder for more sophisticated blob URL management
    const urlsToRevoke: string[] = [];
    
    for (const url of this.resources.blobUrls) {
      // Check if URL is still being used
      const isUsed = document.querySelector(`[src="${url}"], [href="${url}"]`);
      if (!isUsed) {
        urlsToRevoke.push(url);
      }
    }
    
    urlsToRevoke.forEach(url => {
      URL.revokeObjectURL(url);
      this.resources.blobUrls.delete(url);
    });
    
    if (urlsToRevoke.length > 0) {
      console.log(`Revoked ${urlsToRevoke.length} unused blob URLs`);
    }
  }

  /**
   * Clean up observers
   */
  private cleanupObservers(): void {
    let cleanedCount = 0;
    
    for (const observer of this.resources.observers) {
      try {
        observer.disconnect();
        this.resources.observers.delete(observer);
        cleanedCount++;
      } catch (error) {
        // Observer might already be disconnected
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} observers`);
    }
  }

  /**
   * Clean up old timers
   */
  private cleanupTimers(): void {
    // Clear old timeouts (they should have already executed)
    const timeoutsCleared = this.resources.timeouts.size;
    this.resources.timeouts.forEach(id => {
      clearTimeout(id);
    });
    this.resources.timeouts.clear();
    
    if (timeoutsCleared > 0) {
      console.log(`Cleared ${timeoutsCleared} old timeouts`);
    }
  }

  /**
   * Clear caches in external services
   */
  private clearExternalCaches(): void {
    // Clear lazy loading cache
    try {
      const lazyLoadingService = (window as any).lazyLoadingService;
      if (lazyLoadingService && typeof lazyLoadingService.clearCache === 'function') {
        lazyLoadingService.clearCache();
      }
    } catch (error) {
      // Service might not be available
    }
    
    // Clear animation optimizer cache
    try {
      const animationOptimizer = (window as any).animationOptimizer;
      if (animationOptimizer && typeof animationOptimizer.pauseAllAnimations === 'function') {
        animationOptimizer.pauseAllAnimations();
      }
    } catch (error) {
      // Service might not be available
    }
  }

  /**
   * Force garbage collection if available
   */
  private forceGarbageCollection(): void {
    // Force garbage collection in development (Chrome DevTools)
    if ((window as any).gc && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    // Alternative method for forcing GC
    if ('memory' in performance) {
      // Create and immediately discard large objects to trigger GC
      for (let i = 0; i < 10; i++) {
        const largeArray = new Array(100000).fill(0);
        largeArray.length = 0;
      }
    }
  }

  /**
   * Check if element is visible in viewport
   */
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Manual cleanup trigger
   */
  cleanup(): void {
    this.performGentleCleanup();
  }

  /**
   * Aggressive cleanup trigger
   */
  aggressiveCleanup(): void {
    this.performAggressiveCleanup();
  }

  /**
   * Get current memory metrics
   */
  getMemoryMetrics(): MemoryMetrics {
    this.updateMemoryMetrics();
    return { ...this.metrics };
  }

  /**
   * Get memory usage percentage
   */
  getMemoryUsagePercentage(): number {
    return (this.metrics.estimatedUsageMB / this.config.maxMemoryMB) * 100;
  }

  /**
   * Check if memory usage is critical
   */
  isMemoryUsageCritical(): boolean {
    return this.getMemoryUsagePercentage() >= this.config.aggressiveCleanupThreshold;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Dispose of the optimizer and clean up all resources
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.isMonitoring = false;
    this.performAggressiveCleanup();
    
    // Clear all tracked resources
    this.resources.images.clear();
    this.resources.eventListeners.clear();
    this.resources.intervals.clear();
    this.resources.timeouts.clear();
    this.resources.observers.clear();
    this.resources.blobUrls.clear();
  }
}

// Export singleton instance
export const memoryOptimizer = new MemoryOptimizer();
export default memoryOptimizer;

// Utility functions for common memory management tasks
export const trackImageLoad = (img: HTMLImageElement) => {
  img.dataset.loadTime = Date.now().toString();
  memoryOptimizer.trackImage(img);
};

export const addTrackedEventListener = (
  target: EventTarget,
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
) => {
  memoryOptimizer.trackEventListener(target, type, listener, options);
};

export const createTrackedObserver = <T extends IntersectionObserver | MutationObserver | ResizeObserver>(
  observer: T
): T => {
  memoryOptimizer.trackObserver(observer);
  return observer;
};