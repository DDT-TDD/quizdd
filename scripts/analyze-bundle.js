#!/usr/bin/env node

/**
 * Bundle Analyzer for Educational Quiz App
 * Analyzes bundle size and suggests optimizations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.distPath = 'dist';
    this.reportPath = 'bundle-analysis.json';
  }

  /**
   * Run complete bundle analysis
   */
  async analyze() {
    console.log('📊 Analyzing bundle size and performance...');
    
    try {
      // Check if dist exists
      if (!fs.existsSync(this.distPath)) {
        console.log('Building application first...');
        execSync('npm run build:optimized', { stdio: 'inherit' });
      }
      
      // Analyze bundle
      const analysis = await this.performAnalysis();
      
      // Generate report
      await this.generateReport(analysis);
      
      // Provide recommendations
      this.provideRecommendations(analysis);
      
      console.log('✅ Bundle analysis completed');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Perform detailed bundle analysis
   */
  async performAnalysis() {
    const analysis = {
      timestamp: new Date().toISOString(),
      totalSize: 0,
      gzippedSize: 0,
      files: [],
      assets: [],
      chunks: [],
      recommendations: [],
    };

    // Analyze all files in dist
    await this.analyzeDirectory(this.distPath, analysis);
    
    // Analyze specific file types
    analysis.jsFiles = analysis.files.filter(f => f.name.endsWith('.js'));
    analysis.cssFiles = analysis.files.filter(f => f.name.endsWith('.css'));
    analysis.imageFiles = analysis.files.filter(f => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f.name));
    
    // Calculate totals
    analysis.totalSize = analysis.files.reduce((sum, file) => sum + file.size, 0);
    analysis.jsSize = analysis.jsFiles.reduce((sum, file) => sum + file.size, 0);
    analysis.cssSize = analysis.cssFiles.reduce((sum, file) => sum + file.size, 0);
    analysis.imageSize = analysis.imageFiles.reduce((sum, file) => sum + file.size, 0);
    
    return analysis;
  }

  /**
   * Analyze directory recursively
   */
  async analyzeDirectory(dirPath, analysis, relativePath = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await this.analyzeDirectory(fullPath, analysis, relPath);
      } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        const fileInfo = {
          name: entry.name,
          path: relPath,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          type: this.getFileType(entry.name),
          gzippedSize: await this.getGzippedSize(fullPath),
        };
        
        analysis.files.push(fileInfo);
      }
    }
  }

  /**
   * Get gzipped size of file
   */
  async getGzippedSize(filePath) {
    try {
      const zlib = require('zlib');
      const data = fs.readFileSync(filePath);
      const gzipped = zlib.gzipSync(data);
      return gzipped.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get file type category
   */
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    if (['.js', '.mjs', '.ts'].includes(ext)) return 'javascript';
    if (['.css', '.scss', '.sass'].includes(ext)) return 'stylesheet';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'image';
    if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) return 'font';
    if (['.html', '.htm'].includes(ext)) return 'html';
    if (['.json'].includes(ext)) return 'data';
    
    return 'other';
  }

  /**
   * Generate detailed report
   */
  async generateReport(analysis) {
    console.log('\n📋 Bundle Analysis Report');
    console.log('========================');
    
    // Overall stats
    console.log(`\n📦 Overall Bundle Size:`);
    console.log(`  Total Size: ${this.formatBytes(analysis.totalSize)}`);
    console.log(`  JavaScript: ${this.formatBytes(analysis.jsSize)} (${((analysis.jsSize / analysis.totalSize) * 100).toFixed(1)}%)`);
    console.log(`  CSS: ${this.formatBytes(analysis.cssSize)} (${((analysis.cssSize / analysis.totalSize) * 100).toFixed(1)}%)`);
    console.log(`  Images: ${this.formatBytes(analysis.imageSize)} (${((analysis.imageSize / analysis.totalSize) * 100).toFixed(1)}%)`);
    
    // Largest files
    console.log(`\n📊 Largest Files:`);
    const largestFiles = analysis.files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    largestFiles.forEach((file, index) => {
      const compressionRatio = file.gzippedSize > 0 
        ? ((1 - file.gzippedSize / file.size) * 100).toFixed(1)
        : 0;
      console.log(`  ${index + 1}. ${file.name} - ${file.sizeFormatted} (${compressionRatio}% compression)`);
    });
    
    // File type breakdown
    console.log(`\n📁 File Type Breakdown:`);
    const typeStats = this.getTypeStats(analysis.files);
    Object.entries(typeStats).forEach(([type, stats]) => {
      console.log(`  ${type}: ${stats.count} files, ${this.formatBytes(stats.size)}`);
    });
    
    // Performance recommendations
    console.log(`\n💡 Performance Recommendations:`);
    const recommendations = this.generateRecommendations(analysis);
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    // Save detailed report
    fs.writeFileSync(this.reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n📄 Detailed report saved to: ${this.reportPath}`);
  }

  /**
   * Get statistics by file type
   */
  getTypeStats(files) {
    const stats = {};
    
    files.forEach(file => {
      if (!stats[file.type]) {
        stats[file.type] = { count: 0, size: 0 };
      }
      stats[file.type].count++;
      stats[file.type].size += file.size;
    });
    
    return stats;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Large JavaScript files
    const largeJsFiles = analysis.jsFiles.filter(f => f.size > 500 * 1024); // > 500KB
    if (largeJsFiles.length > 0) {
      recommendations.push(`Consider code splitting for large JS files: ${largeJsFiles.map(f => f.name).join(', ')}`);
    }
    
    // Uncompressed images
    const largeImages = analysis.imageFiles.filter(f => f.size > 100 * 1024); // > 100KB
    if (largeImages.length > 0) {
      recommendations.push(`Optimize large images: ${largeImages.map(f => f.name).join(', ')}`);
    }
    
    // Poor compression ratio
    const poorlyCompressed = analysis.files.filter(f => {
      if (f.gzippedSize === 0) return false;
      const ratio = (1 - f.gzippedSize / f.size);
      return ratio < 0.3 && f.size > 50 * 1024; // < 30% compression and > 50KB
    });
    if (poorlyCompressed.length > 0) {
      recommendations.push(`Files with poor compression: ${poorlyCompressed.map(f => f.name).join(', ')}`);
    }
    
    // Total bundle size warnings
    if (analysis.totalSize > 5 * 1024 * 1024) { // > 5MB
      recommendations.push('Total bundle size is quite large. Consider lazy loading and code splitting.');
    }
    
    // JavaScript size warnings
    if (analysis.jsSize > 2 * 1024 * 1024) { // > 2MB
      recommendations.push('JavaScript bundle is large. Consider tree shaking and removing unused dependencies.');
    }
    
    // Too many files
    if (analysis.files.length > 100) {
      recommendations.push('Large number of files detected. Consider bundling smaller assets.');
    }
    
    // Missing modern formats
    const hasWebP = analysis.imageFiles.some(f => f.name.endsWith('.webp'));
    const hasPNG = analysis.imageFiles.some(f => f.name.endsWith('.png'));
    if (hasPNG && !hasWebP) {
      recommendations.push('Consider using WebP format for better image compression.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Bundle is well optimized! 🎉');
    }
    
    return recommendations;
  }

  /**
   * Provide actionable recommendations
   */
  provideRecommendations(analysis) {
    console.log('\n🔧 Actionable Optimizations:');
    
    // Specific optimization commands
    const optimizations = [];
    
    // Image optimization
    const largeImages = analysis.imageFiles.filter(f => f.size > 100 * 1024);
    if (largeImages.length > 0) {
      optimizations.push('npm install --save-dev imagemin imagemin-webp');
      optimizations.push('# Run image optimization script');
    }
    
    // Bundle analysis
    optimizations.push('npm install --save-dev webpack-bundle-analyzer');
    optimizations.push('# Analyze bundle with: npx webpack-bundle-analyzer dist/assets/*.js');
    
    // Tree shaking
    if (analysis.jsSize > 1024 * 1024) {
      optimizations.push('# Enable tree shaking in vite.config.ts');
      optimizations.push('# Remove unused imports and dependencies');
    }
    
    if (optimizations.length > 0) {
      optimizations.forEach((opt, index) => {
        console.log(`  ${index + 1}. ${opt}`);
      });
    } else {
      console.log('  No immediate optimizations needed! ✅');
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = BundleAnalyzer;