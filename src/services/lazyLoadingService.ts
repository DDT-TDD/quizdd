/**
 * Lazy Loading Service for Quiz Content and Assets
 * Optimizes memory usage and loading performance
 */

import { invoke } from '@tauri-apps/api/tauri';
import { Question, Asset } from '../types/api';

interface LazyLoadCache {
  questions: Map<number, Question>;
  assets: Map<string, string>; // asset path -> blob URL
  preloadQueue: Set<string>;
  loadingPromises: Map<string, Promise<any>>;
}

interface LazyLoadConfig {
  maxCacheSize: number;
  preloadDistance: number; // How many questions ahead to preload
  assetCacheSize: number;
  enablePrefetch: boolean;
}

class LazyLoadingService {
  private cache: LazyLoadCache;
  private config: LazyLoadConfig;
  private memoryUsage: number = 0;
  private readonly MAX_MEMORY_MB = 50; // 50MB memory limit

  constructor() {
    this.cache = {
      questions: new Map(),
      assets: new Map(),
      preloadQueue: new Set(),
      loadingPromises: new Map(),
    };

    this.config = {
      maxCacheSize: 100, // Maximum questions in cache
      preloadDistance: 3, // Preload 3 questions ahead
      assetCacheSize: 50, // Maximum assets in cache
      enablePrefetch: true,
    };

    // Monitor memory usage
    this.startMemoryMonitoring();
  }

  /**
   * Get question with lazy loading - OPTIMIZED
   */
  async getQuestion(questionId: number): Promise<Question> {
    // Check cache first
    if (this.cache.questions.has(questionId)) {
      return this.cache.questions.get(questionId)!;
    }

    // Check if already loading
    const loadingKey = `question_${questionId}`;
    if (this.cache.loadingPromises.has(loadingKey)) {
      return await this.cache.loadingPromises.get(loadingKey)!;
    }

    // Load question
    const loadPromise = this.loadQuestion(questionId);
    this.cache.loadingPromises.set(loadingKey, loadPromise);

    try {
      const question = await loadPromise;
      
      // Cache the question
      this.cacheQuestion(question);
      
      // Preload assets if needed
      if (this.config.enablePrefetch) {
        this.preloadQuestionAssets(question);
      }

      return question;
    } finally {
      this.cache.loadingPromises.delete(loadingKey);
    }
  }

  /**
   * Preload questions for better performance
   */
  async preloadQuestions(questionIds: number[], currentIndex: number): Promise<void> {
    const preloadPromises: Promise<void>[] = [];

    // Preload questions within the preload distance
    for (let i = 1; i <= this.config.preloadDistance; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < questionIds.length) {
        const questionId = questionIds[nextIndex];
        if (!this.cache.questions.has(questionId)) {
          preloadPromises.push(
            this.getQuestion(questionId).then(() => {}).catch(() => {})
          );
        }
      }
    }

    // Don't wait for all preloads to complete
    Promise.all(preloadPromises).catch(() => {
      // Ignore preload errors
    });
  }

  /**
   * Get asset with lazy loading and caching
   */
  async getAsset(assetPath: string): Promise<string> {
    // Check cache first
    if (this.cache.assets.has(assetPath)) {
      return this.cache.assets.get(assetPath)!;
    }

    // Check if already loading
    const loadingKey = `asset_${assetPath}`;
    if (this.cache.loadingPromises.has(loadingKey)) {
      return await this.cache.loadingPromises.get(loadingKey)!;
    }

    // Load asset
    const loadPromise = this.loadAsset(assetPath);
    this.cache.loadingPromises.set(loadingKey, loadPromise);

    try {
      const blobUrl = await loadPromise;
      
      // Cache the asset
      this.cacheAsset(assetPath, blobUrl);
      
      return blobUrl;
    } finally {
      this.cache.loadingPromises.delete(loadingKey);
    }
  }

  /**
   * Preload critical assets for immediate use
   */
  async preloadCriticalAssets(assets: string[]): Promise<void> {
    const criticalAssets = assets.slice(0, 5); // Limit to first 5 assets
    
    const preloadPromises = criticalAssets.map(assetPath => 
      this.getAsset(assetPath).catch(() => {
        // Ignore individual asset load failures
      })
    );

    // Wait for critical assets with timeout
    try {
      await Promise.race([
        Promise.all(preloadPromises),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Preload timeout')), 3000)
        )
      ]);
    } catch (error) {
      console.warn('Asset preload timeout or error:', error);
    }
  }

  /**
   * Load question from backend
   */
  private async loadQuestion(questionId: number): Promise<Question> {
    try {
      const question = await invoke<Question>('get_question_by_id', { 
        questionId 
      });
      return question;
    } catch (error) {
      throw new Error(`Failed to load question ${questionId}: ${error}`);
    }
  }

  /**
   * Load asset from backend and create blob URL
   */
  private async loadAsset(assetPath: string): Promise<string> {
    try {
      // Get asset data from backend
      const assetData = await invoke<number[]>('get_asset_data', { 
        assetPath 
      });
      
      // Convert to Uint8Array and create blob
      const uint8Array = new Uint8Array(assetData);
      const blob = new Blob([uint8Array], { 
        type: this.getMimeType(assetPath) 
      });
      
      // Create and return blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Track memory usage
      this.memoryUsage += blob.size;
      
      return blobUrl;
    } catch (error) {
      throw new Error(`Failed to load asset ${assetPath}: ${error}`);
    }
  }

  /**
   * Cache question with memory management
   */
  private cacheQuestion(question: Question): void {
    // Remove oldest questions if cache is full
    if (this.cache.questions.size >= this.config.maxCacheSize) {
      const oldestKey = this.cache.questions.keys().next().value;
      this.cache.questions.delete(oldestKey);
    }

    this.cache.questions.set(question.id!, question);
  }

  /**
   * Cache asset with memory management
   */
  private cacheAsset(assetPath: string, blobUrl: string): void {
    // Remove oldest assets if cache is full
    if (this.cache.assets.size >= this.config.assetCacheSize) {
      const oldestEntry = this.cache.assets.entries().next().value;
      if (oldestEntry) {
        const [oldPath, oldUrl] = oldestEntry;
        URL.revokeObjectURL(oldUrl); // Clean up blob URL
        this.cache.assets.delete(oldPath);
      }
    }

    this.cache.assets.set(assetPath, blobUrl);
  }

  /**
   * Preload assets for a question
   */
  private async preloadQuestionAssets(question: Question): Promise<void> {
    const assetPaths: string[] = [];

    // Collect asset paths from question content
    if (question.content.image_url) {
      assetPaths.push(question.content.image_url);
    }

    // Add other asset types as needed
    if (question.content.additional_data) {
      // Extract asset paths from additional data
      const additionalAssets = this.extractAssetPaths(question.content.additional_data);
      assetPaths.push(...additionalAssets);
    }

    // Preload assets (don't wait for completion)
    assetPaths.forEach(assetPath => {
      if (!this.cache.assets.has(assetPath)) {
        this.getAsset(assetPath).catch(() => {
          // Ignore preload errors
        });
      }
    });
  }

  /**
   * Extract asset paths from additional data
   */
  private extractAssetPaths(additionalData: any): string[] {
    const paths: string[] = [];
    
    if (typeof additionalData === 'object' && additionalData !== null) {
      for (const value of Object.values(additionalData)) {
        if (typeof value === 'string' && this.isAssetPath(value)) {
          paths.push(value);
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'string' && this.isAssetPath(item)) {
              paths.push(item);
            }
          });
        }
      }
    }
    
    return paths;
  }

  /**
   * Check if string is an asset path
   */
  private isAssetPath(str: string): boolean {
    return str.startsWith('assets/') && 
           (str.endsWith('.svg') || str.endsWith('.png') || 
            str.endsWith('.jpg') || str.endsWith('.jpeg') ||
            str.endsWith('.gif') || str.endsWith('.webp'));
  }

  /**
   * Get MIME type for asset
   */
  private getMimeType(assetPath: string): string {
    const extension = assetPath.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'svg': return 'image/svg+xml';
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'webp': return 'image/webp';
      default: return 'application/octet-stream';
    }
  }

  /**
   * Monitor memory usage and clean up if needed
   */
  private startMemoryMonitoring(): void {
    setInterval(() => {
      if (this.memoryUsage > this.MAX_MEMORY_MB * 1024 * 1024) {
        this.cleanupMemory();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Clean up memory by removing old cached items
   */
  private cleanupMemory(): void {
    // Remove half of the cached assets
    const assetsToRemove = Math.floor(this.cache.assets.size / 2);
    let removed = 0;
    
    for (const [assetPath, blobUrl] of this.cache.assets.entries()) {
      if (removed >= assetsToRemove) break;
      
      URL.revokeObjectURL(blobUrl);
      this.cache.assets.delete(assetPath);
      removed++;
    }

    // Remove some cached questions
    const questionsToRemove = Math.floor(this.cache.questions.size / 3);
    removed = 0;
    
    for (const questionId of this.cache.questions.keys()) {
      if (removed >= questionsToRemove) break;
      
      this.cache.questions.delete(questionId);
      removed++;
    }

    // Reset memory usage estimate
    this.memoryUsage = 0;
    
    console.log('Memory cleanup completed');
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    // Revoke all blob URLs
    for (const blobUrl of this.cache.assets.values()) {
      URL.revokeObjectURL(blobUrl);
    }

    // Clear all caches
    this.cache.questions.clear();
    this.cache.assets.clear();
    this.cache.preloadQueue.clear();
    this.cache.loadingPromises.clear();
    
    this.memoryUsage = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    questionsCount: number;
    assetsCount: number;
    memoryUsageMB: number;
    loadingCount: number;
  } {
    return {
      questionsCount: this.cache.questions.size,
      assetsCount: this.cache.assets.size,
      memoryUsageMB: Math.round(this.memoryUsage / (1024 * 1024) * 100) / 100,
      loadingCount: this.cache.loadingPromises.size,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LazyLoadConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const lazyLoadingService = new LazyLoadingService();
export default lazyLoadingService;