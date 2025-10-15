use crate::errors::AppError;
use crate::services::security::SecurityService;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tokio::fs as async_fs;
use url::Url;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub version: String,
    pub description: String,
    pub download_url: String,
    pub signature: String,
    pub size: u64,
    pub checksum: String,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentPackage {
    pub version: String,
    pub content: Vec<u8>,
    pub signature: Vec<u8>,
    pub metadata: PackageMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageMetadata {
    pub subjects: Vec<String>,
    pub key_stages: Vec<String>,
    pub question_count: u32,
    pub created_at: String,
    pub author: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateConfig {
    pub repository_urls: Vec<String>,
    pub auto_check: bool,
    pub check_interval_hours: u32,
    pub backup_retention_days: u32,
}

pub struct UpdateService {
    security_service: SecurityService,
    config: UpdateConfig,
    client: reqwest::Client,
    backup_dir: PathBuf,
    content_dir: PathBuf,
}

// Ensure UpdateService is Send + Sync
unsafe impl Send for UpdateService {}
unsafe impl Sync for UpdateService {}

impl UpdateService {
    pub fn new(
        security_service: SecurityService,
        config: UpdateConfig,
        app_data_dir: PathBuf,
    ) -> Result<Self, AppError> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .user_agent("EducationalQuizApp/1.0")
            .build()
            .map_err(|e| AppError::UpdateFailed(format!("Failed to create HTTP client: {}", e)))?;

        let backup_dir = app_data_dir.join("backups");
        let content_dir = app_data_dir.join("content");

        // Ensure directories exist
        fs::create_dir_all(&backup_dir)
            .map_err(|e| AppError::UpdateFailed(format!("Failed to create backup directory: {}", e)))?;
        fs::create_dir_all(&content_dir)
            .map_err(|e| AppError::UpdateFailed(format!("Failed to create content directory: {}", e)))?;

        Ok(Self {
            security_service,
            config,
            client,
            backup_dir,
            content_dir,
        })
    }

    /// Check for available updates from authorized repositories
    pub async fn check_for_updates(&self) -> Result<Vec<UpdateInfo>, AppError> {
        let mut all_updates = Vec::new();

        for repo_url in &self.config.repository_urls {
            if let Ok(updates) = self.check_repository_updates(repo_url).await {
                all_updates.extend(updates);
            }
        }

        // Sort by version and remove duplicates
        all_updates.sort_by(|a, b| a.version.cmp(&b.version));
        all_updates.dedup_by(|a, b| a.version == b.version);

        Ok(all_updates)
    }

    /// Check updates from a specific repository
    async fn check_repository_updates(&self, repo_url: &str) -> Result<Vec<UpdateInfo>, AppError> {
        // Validate repository URL
        self.validate_repository_url(repo_url)?;

        let update_manifest_url = format!("{}/manifest.json", repo_url.trim_end_matches('/'));
        
        let response = self.client
            .get(&update_manifest_url)
            .send()
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to fetch update manifest: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::UpdateFailed(format!(
                "Update manifest request failed with status: {}",
                response.status()
            )));
        }

        let manifest_text = response
            .text()
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to read manifest response: {}", e)))?;

        let updates: Vec<UpdateInfo> = serde_json::from_str(&manifest_text)
            .map_err(|e| AppError::UpdateFailed(format!("Invalid manifest format: {}", e)))?;

        Ok(updates)
    }

    /// Validate that repository URL is authorized
    fn validate_repository_url(&self, url: &str) -> Result<(), AppError> {
        let parsed_url = Url::parse(url)
            .map_err(|e| AppError::UpdateFailed(format!("Invalid repository URL: {}", e)))?;

        // Ensure HTTPS
        if parsed_url.scheme() != "https" {
            return Err(AppError::UpdateFailed(
                "Repository URL must use HTTPS".to_string(),
            ));
        }

        // Check against authorized domains (this would be configurable in production)
        let authorized_domains = vec![
            "updates.educationalquizapp.com",
            "content.educationalquizapp.com",
        ];

        if let Some(host) = parsed_url.host_str() {
            if !authorized_domains.contains(&host) {
                return Err(AppError::UpdateFailed(format!(
                    "Unauthorized repository domain: {}",
                    host
                )));
            }
        } else {
            return Err(AppError::UpdateFailed("Invalid repository URL host".to_string()));
        }

        Ok(())
    }

    /// Download and install a content update
    pub async fn download_and_install_update(&self, update_info: &UpdateInfo) -> Result<(), AppError> {
        // Create backup before installing
        self.create_backup().await?;

        // Download the update package
        let package = self.download_update_package(update_info).await?;

        // Verify the package signature
        self.verify_package_signature(&package)?;

        // Install the package
        match self.install_package(&package).await {
            Ok(_) => {
                log::info!("Successfully installed update version {}", package.version);
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to install update: {}", e);
                // Attempt rollback
                self.rollback_to_backup().await?;
                Err(e)
            }
        }
    }

    /// Download update package from URL
    async fn download_update_package(&self, update_info: &UpdateInfo) -> Result<ContentPackage, AppError> {
        self.validate_repository_url(&update_info.download_url)?;

        let response = self.client
            .get(&update_info.download_url)
            .send()
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to download update: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::UpdateFailed(format!(
                "Download failed with status: {}",
                response.status()
            )));
        }

        let content = response
            .bytes()
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to read update content: {}", e)))?
            .to_vec();

        // Verify checksum
        let calculated_checksum = self.security_service.calculate_checksum(&content)?;
        if calculated_checksum != update_info.checksum {
            return Err(AppError::UpdateFailed(
                "Update package checksum verification failed".to_string(),
            ));
        }

        // Parse signature
        let signature = hex::decode(&update_info.signature)
            .map_err(|e| AppError::UpdateFailed(format!("Invalid signature format: {}", e)))?;

        // Extract metadata (this would be embedded in the package in a real implementation)
        let metadata = PackageMetadata {
            subjects: vec!["Mathematics".to_string(), "Geography".to_string()],
            key_stages: vec!["KS1".to_string(), "KS2".to_string()],
            question_count: 100,
            created_at: chrono::Utc::now().to_rfc3339(),
            author: "Educational Content Team".to_string(),
        };

        Ok(ContentPackage {
            version: update_info.version.clone(),
            content,
            signature,
            metadata,
        })
    }

    /// Verify package cryptographic signature
    fn verify_package_signature(&self, package: &ContentPackage) -> Result<(), AppError> {
        let is_valid = self.security_service
            .verify_update_signature(&package.content, &package.signature)
            .map_err(|e| AppError::UpdateFailed(format!("Signature verification failed: {}", e)))?;
        
        if is_valid {
            Ok(())
        } else {
            Err(AppError::UpdateFailed("Invalid package signature".to_string()))
        }
    }

    /// Install content package
    async fn install_package(&self, package: &ContentPackage) -> Result<(), AppError> {
        // Create temporary installation directory
        let temp_dir = self.content_dir.join(format!("temp_{}", package.version));
        async_fs::create_dir_all(&temp_dir)
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to create temp directory: {}", e)))?;

        // Extract and install content (simplified - would involve SQLite operations in reality)
        let package_file = temp_dir.join("content.json");
        async_fs::write(&package_file, &package.content)
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to write package content: {}", e)))?;

        // Move to final location
        let final_dir = self.content_dir.join(&package.version);
        if final_dir.exists() {
            async_fs::remove_dir_all(&final_dir)
                .await
                .map_err(|e| AppError::UpdateFailed(format!("Failed to remove existing content: {}", e)))?;
        }

        async_fs::rename(&temp_dir, &final_dir)
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to install content: {}", e)))?;

        // Update current version marker
        let version_file = self.content_dir.join("current_version.txt");
        async_fs::write(&version_file, &package.version)
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to update version marker: {}", e)))?;

        Ok(())
    }

    /// Create backup of current content
    async fn create_backup(&self) -> Result<(), AppError> {
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
        let backup_path = self.backup_dir.join(format!("backup_{}", timestamp));

        if self.content_dir.exists() {
            self.copy_dir_recursive(&self.content_dir, &backup_path).await?;
        }

        // Clean old backups
        self.cleanup_old_backups().await?;

        Ok(())
    }

    /// Rollback to most recent backup
    pub async fn rollback_to_backup(&self) -> Result<(), AppError> {
        let mut backups = Vec::new();
        
        let mut entries = async_fs::read_dir(&self.backup_dir)
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to read backup directory: {}", e)))?;

        while let Some(entry) = entries.next_entry().await.map_err(|e| {
            AppError::UpdateFailed(format!("Failed to read backup entry: {}", e))
        })? {
            if entry.file_type().await.map_err(|e| {
                AppError::UpdateFailed(format!("Failed to get file type: {}", e))
            })?.is_dir() {
                if let Some(name) = entry.file_name().to_str() {
                    if name.starts_with("backup_") {
                        backups.push(entry.path());
                    }
                }
            }
        }

        if backups.is_empty() {
            return Err(AppError::UpdateFailed("No backups available for rollback".to_string()));
        }

        // Sort by name (timestamp) and get the most recent
        backups.sort();
        let latest_backup = backups.last().unwrap();

        // Remove current content
        if self.content_dir.exists() {
            async_fs::remove_dir_all(&self.content_dir)
                .await
                .map_err(|e| AppError::UpdateFailed(format!("Failed to remove current content: {}", e)))?;
        }

        // Restore from backup
        self.copy_dir_recursive(latest_backup, &self.content_dir).await?;

        log::info!("Successfully rolled back to backup: {:?}", latest_backup);
        Ok(())
    }

    /// Copy directory recursively using a stack-based approach
    async fn copy_dir_recursive(&self, src: &Path, dst: &Path) -> Result<(), AppError> {
        use std::collections::VecDeque;
        
        let mut queue = VecDeque::new();
        queue.push_back((src.to_path_buf(), dst.to_path_buf()));
        
        while let Some((current_src, current_dst)) = queue.pop_front() {
            std::fs::create_dir_all(&current_dst)
                .map_err(|e| AppError::UpdateFailed(format!("Failed to create directory: {}", e)))?;

            let entries = std::fs::read_dir(&current_src)
                .map_err(|e| AppError::UpdateFailed(format!("Failed to read source directory: {}", e)))?;

            for entry in entries {
                let entry = entry.map_err(|e| {
                    AppError::UpdateFailed(format!("Failed to read directory entry: {}", e))
                })?;
                
                let src_path = entry.path();
                let dst_path = current_dst.join(entry.file_name());

                if entry.file_type().map_err(|e| {
                    AppError::UpdateFailed(format!("Failed to get file type: {}", e))
                })?.is_dir() {
                    queue.push_back((src_path, dst_path));
                } else {
                    std::fs::copy(&src_path, &dst_path)
                        .map_err(|e| AppError::UpdateFailed(format!("Failed to copy file: {}", e)))?;
                }
            }
        }

        Ok(())
    }

    /// Clean up old backups based on retention policy
    async fn cleanup_old_backups(&self) -> Result<(), AppError> {
        let retention_duration = chrono::Duration::days(self.config.backup_retention_days as i64);
        let cutoff_time = chrono::Utc::now() - retention_duration;

        let mut entries = async_fs::read_dir(&self.backup_dir)
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to read backup directory: {}", e)))?;

        while let Some(entry) = entries.next_entry().await.map_err(|e| {
            AppError::UpdateFailed(format!("Failed to read backup entry: {}", e))
        })? {
            if let Some(name) = entry.file_name().to_str() {
                if name.starts_with("backup_") {
                    // Extract timestamp from backup name
                    if let Some(timestamp_str) = name.strip_prefix("backup_") {
                        if let Ok(backup_time) = chrono::DateTime::parse_from_str(
                            &format!("{}+00:00", timestamp_str),
                            "%Y%m%d_%H%M%S%z"
                        ) {
                            if backup_time.with_timezone(&chrono::Utc) < cutoff_time {
                                async_fs::remove_dir_all(entry.path())
                                    .await
                                    .map_err(|e| AppError::UpdateFailed(format!("Failed to remove old backup: {}", e)))?;
                                log::info!("Removed old backup: {}", name);
                            }
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// Get current content version
    pub async fn get_current_version(&self) -> Result<String, AppError> {
        let version_file = self.content_dir.join("current_version.txt");
        
        if !version_file.exists() {
            return Ok("1.0.0".to_string()); // Default version
        }

        let version = async_fs::read_to_string(&version_file)
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to read version file: {}", e)))?;

        Ok(version.trim().to_string())
    }

    /// List available backups
    pub async fn list_backups(&self) -> Result<Vec<String>, AppError> {
        let mut backups = Vec::new();
        
        let mut entries = async_fs::read_dir(&self.backup_dir)
            .await
            .map_err(|e| AppError::UpdateFailed(format!("Failed to read backup directory: {}", e)))?;

        while let Some(entry) = entries.next_entry().await.map_err(|e| {
            AppError::UpdateFailed(format!("Failed to read backup entry: {}", e))
        })? {
            if entry.file_type().await.map_err(|e| {
                AppError::UpdateFailed(format!("Failed to get file type: {}", e))
            })?.is_dir() {
                if let Some(name) = entry.file_name().to_str() {
                    if name.starts_with("backup_") {
                        backups.push(name.to_string());
                    }
                }
            }
        }

        backups.sort();
        Ok(backups)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_config() -> UpdateConfig {
        UpdateConfig {
            repository_urls: vec!["https://updates.educationalquizapp.com".to_string()],
            auto_check: false,
            check_interval_hours: 24,
            backup_retention_days: 7,
        }
    }

    #[test]
    fn test_repository_url_validation() {
        let temp_dir = TempDir::new().unwrap();
        let security_service = SecurityService::new().unwrap();
        let config = create_test_config();
        
        let update_service = UpdateService::new(
            security_service,
            config,
            temp_dir.path().to_path_buf(),
        ).unwrap();

        // Valid HTTPS URL
        assert!(update_service.validate_repository_url("https://updates.educationalquizapp.com").is_ok());
        
        // Invalid HTTP URL
        assert!(update_service.validate_repository_url("http://updates.educationalquizapp.com").is_err());
        
        // Unauthorized domain
        assert!(update_service.validate_repository_url("https://malicious.com").is_err());
        
        // Invalid URL
        assert!(update_service.validate_repository_url("not-a-url").is_err());
    }

    #[tokio::test]
    async fn test_backup_creation_and_rollback() {
        let temp_dir = TempDir::new().unwrap();
        let security_service = SecurityService::new().unwrap();
        let config = create_test_config();
        
        let update_service = UpdateService::new(
            security_service,
            config,
            temp_dir.path().to_path_buf(),
        ).unwrap();

        // Create some test content
        let content_file = update_service.content_dir.join("test.txt");
        async_fs::create_dir_all(&update_service.content_dir).await.unwrap();
        async_fs::write(&content_file, "test content").await.unwrap();

        // Create backup
        update_service.create_backup().await.unwrap();

        // Verify backup exists
        let backups = update_service.list_backups().await.unwrap();
        assert!(!backups.is_empty());

        // Modify content
        async_fs::write(&content_file, "modified content").await.unwrap();

        // Rollback
        update_service.rollback_to_backup().await.unwrap();

        // Verify content is restored
        let restored_content = async_fs::read_to_string(&content_file).await.unwrap();
        assert_eq!(restored_content, "test content");
    }
}