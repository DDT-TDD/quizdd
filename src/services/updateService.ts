import { invoke } from '@tauri-apps/api/core';

export interface UpdateInfo {
  version: string;
  description: string;
  download_url: string;
  signature: string;
  size: number;
  checksum: string;
  required: boolean;
}

export interface ContentPackage {
  version: string;
  content: number[];
  signature: number[];
  metadata: PackageMetadata;
}

export interface PackageMetadata {
  subjects: string[];
  key_stages: string[];
  question_count: number;
  created_at: string;
  author: string;
}

export interface UpdateConfig {
  repository_urls: string[];
  auto_check: boolean;
  check_interval_hours: number;
  backup_retention_days: number;
}

export class UpdateService {
  /**
   * Check for available content updates
   */
  static async checkForUpdates(): Promise<UpdateInfo[]> {
    try {
      return await invoke<UpdateInfo[]>('check_for_updates');
    } catch (error) {
      console.error('Failed to check for updates:', error);
      throw new Error(`Update check failed: ${error}`);
    }
  }

  /**
   * Download and install a content update
   */
  static async downloadAndInstallUpdate(updateInfo: UpdateInfo): Promise<void> {
    try {
      await invoke<void>('download_and_install_update', { updateInfo });
    } catch (error) {
      console.error('Failed to download and install update:', error);
      throw new Error(`Update installation failed: ${error}`);
    }
  }

  /**
   * Rollback to the most recent backup
   */
  static async rollbackToBackup(): Promise<void> {
    try {
      await invoke<void>('rollback_to_backup');
    } catch (error) {
      console.error('Failed to rollback to backup:', error);
      throw new Error(`Rollback failed: ${error}`);
    }
  }

  /**
   * Get the current content version
   */
  static async getCurrentVersion(): Promise<string> {
    try {
      return await invoke<string>('get_current_version');
    } catch (error) {
      console.error('Failed to get current version:', error);
      throw new Error(`Version check failed: ${error}`);
    }
  }

  /**
   * List available backups
   */
  static async listBackups(): Promise<string[]> {
    try {
      return await invoke<string[]>('list_backups');
    } catch (error) {
      console.error('Failed to list backups:', error);
      throw new Error(`Backup listing failed: ${error}`);
    }
  }

  /**
   * Format update size for display
   */
  static formatUpdateSize(sizeInBytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Validate update info before installation
   */
  static validateUpdateInfo(updateInfo: UpdateInfo): boolean {
    return !!(
      updateInfo.version &&
      updateInfo.download_url &&
      updateInfo.signature &&
      updateInfo.checksum &&
      updateInfo.size > 0
    );
  }

  /**
   * Check if an update is critical/required
   */
  static isUpdateRequired(updateInfo: UpdateInfo): boolean {
    return updateInfo.required;
  }

  /**
   * Compare version strings (simple semantic versioning)
   */
  static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  /**
   * Check if a newer version is available
   */
  static async hasNewerVersion(): Promise<boolean> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const updates = await this.checkForUpdates();
      
      if (updates.length === 0) return false;
      
      // Find the latest version
      const latestUpdate = updates.reduce((latest, current) => {
        return this.compareVersions(current.version, latest.version) > 0 ? current : latest;
      });
      
      return this.compareVersions(latestUpdate.version, currentVersion) > 0;
    } catch (error) {
      console.error('Failed to check for newer version:', error);
      return false;
    }
  }

  /**
   * Get update progress (placeholder for future implementation)
   */
  static getUpdateProgress(): { progress: number; status: string } {
    // This would be implemented with proper progress tracking
    return { progress: 0, status: 'idle' };
  }

  /**
   * Cancel ongoing update (placeholder for future implementation)
   */
  static async cancelUpdate(): Promise<void> {
    // This would be implemented with proper cancellation support
    console.log('Update cancellation not yet implemented');
  }
}

export default UpdateService;