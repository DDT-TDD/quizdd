#!/usr/bin/env node

/**
 * Build and Package Script for Educational Quiz App
 * Handles cross-platform building, optimization, and distribution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Configuration
const config = {
  appName: 'Educational Quiz App',
  version: '1.0.0',
  platforms: ['windows', 'macos', 'linux'],
  outputDir: 'dist-packages',
  optimizations: {
    minify: true,
    treeshake: true,
    compress: true,
    stripDebug: true,
  },
  signing: {
    enabled: false, // Set to true when certificates are available
    windowsCert: process.env.WINDOWS_CERT_PATH,
    macOSCert: process.env.MACOS_CERT_PATH,
  },
};

class BuildPackager {
  constructor() {
    this.startTime = Date.now();
    this.platform = os.platform();
    this.arch = os.arch();
  }

  /**
   * Main build and package process
   */
  async run() {
    console.log('🚀 Starting Educational Quiz App build and packaging...');
    console.log(`Platform: ${this.platform}, Architecture: ${this.arch}`);
    
    try {
      // Pre-build checks
      await this.preBuildChecks();
      
      // Clean previous builds
      await this.cleanPreviousBuilds();
      
      // Install dependencies
      await this.installDependencies();
      
      // Run tests
      await this.runTests();
      
      // Build frontend
      await this.buildFrontend();
      
      // Build Tauri app
      await this.buildTauriApp();
      
      // Package for distribution
      await this.packageForDistribution();
      
      // Generate checksums
      await this.generateChecksums();
      
      // Create installer (if applicable)
      await this.createInstaller();
      
      console.log('✅ Build and packaging completed successfully!');
      console.log(`Total time: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);
      
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Pre-build environment checks
   */
  async preBuildChecks() {
    console.log('🔍 Running pre-build checks...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`Node.js version: ${nodeVersion}`);
    
    // Check if Rust is installed
    try {
      const rustVersion = execSync('rustc --version', { encoding: 'utf8' });
      console.log(`Rust version: ${rustVersion.trim()}`);
    } catch (error) {
      throw new Error('Rust is not installed. Please install Rust from https://rustup.rs/');
    }
    
    // Check if Tauri CLI is installed
    try {
      execSync('cargo tauri --version', { encoding: 'utf8' });
    } catch (error) {
      console.log('Installing Tauri CLI...');
      execSync('cargo install tauri-cli', { stdio: 'inherit' });
    }
    
    // Check package.json exists
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json not found');
    }
    
    // Check Cargo.toml exists
    if (!fs.existsSync('src-tauri/Cargo.toml')) {
      throw new Error('src-tauri/Cargo.toml not found');
    }
    
    console.log('✅ Pre-build checks passed');
  }

  /**
   * Clean previous build artifacts
   */
  async cleanPreviousBuilds() {
    console.log('🧹 Cleaning previous builds...');
    
    const dirsToClean = [
      'dist',
      'src-tauri/target',
      config.outputDir,
      'node_modules/.vite',
    ];
    
    for (const dir of dirsToClean) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`Cleaned: ${dir}`);
      }
    }
  }

  /**
   * Install and update dependencies
   */
  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    // Install Node.js dependencies
    execSync('npm ci', { stdio: 'inherit' });
    
    // Update Rust dependencies
    execSync('cargo update', { 
      cwd: 'src-tauri',
      stdio: 'inherit' 
    });
  }

  /**
   * Run tests before building
   */
  async runTests() {
    console.log('🧪 Running tests...');
    
    try {
      // Run frontend tests
      execSync('npm run test:run', { stdio: 'inherit' });
      
      // Run Rust tests
      execSync('cargo test', { 
        cwd: 'src-tauri',
        stdio: 'inherit' 
      });
      
      console.log('✅ All tests passed');
    } catch (error) {
      throw new Error('Tests failed. Please fix failing tests before building.');
    }
  }

  /**
   * Build optimized frontend
   */
  async buildFrontend() {
    console.log('🏗️ Building frontend...');
    
    // Set production environment
    process.env.NODE_ENV = 'production';
    
    // Build with optimizations
    const buildCommand = config.optimizations.minify 
      ? 'npm run build'
      : 'npm run build:dev';
    
    execSync(buildCommand, { stdio: 'inherit' });
    
    // Verify build output
    if (!fs.existsSync('dist/index.html')) {
      throw new Error('Frontend build failed - no index.html found');
    }
    
    console.log('✅ Frontend build completed');
  }

  /**
   * Build Tauri application
   */
  async buildTauriApp() {
    console.log('🦀 Building Tauri application...');
    
    // Prepare build command
    let buildCmd = 'cargo tauri build';
    
    // Add optimization flags
    if (config.optimizations.stripDebug) {
      buildCmd += ' --config "{\\"tauri\\": {\\"bundle\\": {\\"resources\\": []}}}"';
    }
    
    // Build for current platform
    execSync(buildCmd, { 
      cwd: '.',
      stdio: 'inherit',
      env: {
        ...process.env,
        TAURI_PRIVATE_KEY: process.env.TAURI_PRIVATE_KEY,
        TAURI_KEY_PASSWORD: process.env.TAURI_KEY_PASSWORD,
      }
    });
    
    console.log('✅ Tauri build completed');
  }

  /**
   * Package application for distribution
   */
  async packageForDistribution() {
    console.log('📦 Packaging for distribution...');
    
    // Create output directory
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Find built files
    const tauriTargetDir = 'src-tauri/target/release';
    const bundleDir = path.join(tauriTargetDir, 'bundle');
    
    if (!fs.existsSync(bundleDir)) {
      throw new Error('No bundle directory found. Build may have failed.');
    }
    
    // Copy built files to distribution directory
    await this.copyBuildArtifacts(bundleDir);
    
    // Create portable version if applicable
    await this.createPortableVersion(tauriTargetDir);
    
    console.log('✅ Packaging completed');
  }

  /**
   * Copy build artifacts to distribution directory
   */
  async copyBuildArtifacts(bundleDir) {
    const artifacts = [];
    
    // Platform-specific file patterns
    const patterns = {
      win32: ['*.exe', '*.msi'],
      darwin: ['*.app', '*.dmg'],
      linux: ['*.deb', '*.rpm', '*.AppImage'],
    };
    
    const platformPatterns = patterns[this.platform] || ['*'];
    
    // Find and copy artifacts
    for (const pattern of platformPatterns) {
      const files = this.findFiles(bundleDir, pattern);
      for (const file of files) {
        const destPath = path.join(config.outputDir, path.basename(file));
        fs.copyFileSync(file, destPath);
        artifacts.push(destPath);
        console.log(`Copied: ${path.basename(file)}`);
      }
    }
    
    if (artifacts.length === 0) {
      console.warn('⚠️ No build artifacts found');
    }
    
    return artifacts;
  }

  /**
   * Create portable version (executable only)
   */
  async createPortableVersion(targetDir) {
    const executableName = this.platform === 'win32' 
      ? 'educational-quiz-app.exe'
      : 'educational-quiz-app';
    
    const executablePath = path.join(targetDir, executableName);
    
    if (fs.existsSync(executablePath)) {
      const portablePath = path.join(config.outputDir, `portable-${executableName}`);
      fs.copyFileSync(executablePath, portablePath);
      console.log(`Created portable version: ${path.basename(portablePath)}`);
    }
  }

  /**
   * Generate checksums for verification
   */
  async generateChecksums() {
    console.log('🔐 Generating checksums...');
    
    const crypto = require('crypto');
    const checksums = [];
    
    // Get all files in output directory
    const files = fs.readdirSync(config.outputDir);
    
    for (const file of files) {
      const filePath = path.join(config.outputDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        const data = fs.readFileSync(filePath);
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        checksums.push(`${hash}  ${file}`);
      }
    }
    
    // Write checksums file
    const checksumPath = path.join(config.outputDir, 'checksums.txt');
    fs.writeFileSync(checksumPath, checksums.join('\n'));
    
    console.log(`✅ Generated checksums for ${checksums.length} files`);
  }

  /**
   * Create installer (Windows only for now)
   */
  async createInstaller() {
    if (this.platform !== 'win32') {
      console.log('ℹ️ Installer creation only supported on Windows');
      return;
    }
    
    console.log('📦 Creating Windows installer...');
    
    // Check if NSIS is available
    try {
      execSync('makensis /VERSION', { stdio: 'pipe' });
    } catch (error) {
      console.log('⚠️ NSIS not found, skipping installer creation');
      return;
    }
    
    // Create NSIS script
    const nsisScript = this.generateNSISScript();
    const scriptPath = path.join(config.outputDir, 'installer.nsi');
    fs.writeFileSync(scriptPath, nsisScript);
    
    // Build installer
    try {
      execSync(`makensis "${scriptPath}"`, { stdio: 'inherit' });
      console.log('✅ Windows installer created');
    } catch (error) {
      console.warn('⚠️ Failed to create installer:', error.message);
    }
  }

  /**
   * Generate NSIS installer script
   */
  generateNSISScript() {
    return `
!define APP_NAME "${config.appName}"
!define APP_VERSION "${config.version}"
!define APP_PUBLISHER "Educational Quiz App Team"
!define APP_URL "https://github.com/your-repo/educational-quiz-app"
!define APP_EXECUTABLE "educational-quiz-app.exe"

Name "\${APP_NAME}"
OutFile "Educational-Quiz-App-Setup-\${APP_VERSION}.exe"
InstallDir "$PROGRAMFILES\\\${APP_NAME}"
RequestExecutionLevel admin

Section "Main Application" SecMain
  SetOutPath "$INSTDIR"
  File "educational-quiz-app.exe"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\\\${APP_NAME}"
  CreateShortCut "$SMPROGRAMS\\\${APP_NAME}\\\${APP_NAME}.lnk" "$INSTDIR\\\${APP_EXECUTABLE}"
  CreateShortCut "$DESKTOP\\\${APP_NAME}.lnk" "$INSTDIR\\\${APP_EXECUTABLE}"
  
  ; Write uninstaller
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  
  ; Registry entries
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APP_NAME}" "DisplayName" "\${APP_NAME}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APP_NAME}" "UninstallString" "$INSTDIR\\Uninstall.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\\\${APP_EXECUTABLE}"
  Delete "$INSTDIR\\Uninstall.exe"
  RMDir "$INSTDIR"
  
  Delete "$SMPROGRAMS\\\${APP_NAME}\\\${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\\\${APP_NAME}"
  Delete "$DESKTOP\\\${APP_NAME}.lnk"
  
  DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APP_NAME}"
SectionEnd
`;
  }

  /**
   * Find files matching pattern
   */
  findFiles(dir, pattern) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.findFiles(fullPath, pattern));
      } else if (entry.isFile()) {
        if (pattern === '*' || entry.name.includes(pattern.replace('*', ''))) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }
}

// Run the build process
if (require.main === module) {
  const packager = new BuildPackager();
  packager.run().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
  });
}

module.exports = BuildPackager;