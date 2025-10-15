use thiserror::Error;

/// Main application error type that encompasses all possible errors
#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    
    #[error("Database connection error: {0}")]
    DatabaseConnection(#[from] crate::database::DatabaseError),
    
    #[error("Content verification failed: {0}")]
    ContentVerification(String),
    
    #[error("Profile not found: {id}")]
    ProfileNotFound { id: u32 },
    
    #[error("Invalid question format: {0}")]
    InvalidQuestion(String),
    
    #[error("Update download failed: {0}")]
    UpdateFailed(String),
    
    #[error("Security operation failed: {0}")]
    Security(String),
    
    #[error("Quiz engine error: {0}")]
    QuizEngine(String),
    
    #[error("Content management error: {0}")]
    ContentManagement(String),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Authentication failed: {0}")]
    Authentication(String),
    
    #[error("Resource not found: {0}")]
    NotFound(String),
    
    #[error("Operation not permitted: {0}")]
    PermissionDenied(String),
    
    #[error("Internal error: {0}")]
    Internal(String),
}

/// Result type alias for application operations
pub type AppResult<T> = Result<T, AppError>;

impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}

/// Error recovery strategies for different error types
impl AppError {
    /// Determines if the error is recoverable and suggests retry
    pub fn is_recoverable(&self) -> bool {
        match self {
            AppError::Database(_) => false, // Database errors usually need intervention
            AppError::ContentVerification(_) => false, // Security errors are not recoverable
            AppError::ProfileNotFound { .. } => false, // Missing data is not recoverable
            AppError::InvalidQuestion(_) => false, // Invalid data format is not recoverable
            AppError::UpdateFailed(_) => true, // Network/update errors can be retried
            AppError::Security(_) => false, // Security errors are not recoverable
            AppError::QuizEngine(_) => true, // Quiz engine errors might be transient
            AppError::ContentManagement(_) => true, // Content errors might be transient
            AppError::Serialization(_) => false, // Serialization errors indicate data issues
            AppError::Io(_) => true, // IO errors can often be retried
            AppError::InvalidInput(_) => false, // Invalid input needs correction
            AppError::Authentication(_) => false, // Auth errors need user intervention
            AppError::NotFound(_) => false, // Missing resources are not recoverable
            AppError::PermissionDenied(_) => false, // Permission errors need intervention
            AppError::Internal(_) => false, // Internal errors usually indicate bugs
            AppError::DatabaseConnection(_) => false, // Database connection errors need intervention
        }
    }
    
    /// Gets the error category for logging and monitoring
    pub fn category(&self) -> &'static str {
        match self {
            AppError::Database(_) => "database",
            AppError::ContentVerification(_) => "security",
            AppError::ProfileNotFound { .. } => "data",
            AppError::InvalidQuestion(_) => "data",
            AppError::UpdateFailed(_) => "network",
            AppError::Security(_) => "security",
            AppError::QuizEngine(_) => "business_logic",
            AppError::ContentManagement(_) => "content",
            AppError::Serialization(_) => "serialization",
            AppError::Io(_) => "io",
            AppError::InvalidInput(_) => "validation",
            AppError::Authentication(_) => "auth",
            AppError::NotFound(_) => "data",
            AppError::PermissionDenied(_) => "auth",
            AppError::Internal(_) => "internal",
            AppError::DatabaseConnection(_) => "database_connection",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_recoverability() {
        let recoverable_error = AppError::UpdateFailed("Network timeout".to_string());
        assert!(recoverable_error.is_recoverable());
        
        let non_recoverable_error = AppError::ProfileNotFound { id: 1 };
        assert!(!non_recoverable_error.is_recoverable());
    }

    #[test]
    fn test_error_categories() {
        let db_error = AppError::Database(rusqlite::Error::InvalidPath("test".into()));
        assert_eq!(db_error.category(), "database");
        
        let security_error = AppError::Security("Invalid signature".to_string());
        assert_eq!(security_error.category(), "security");
    }

    #[test]
    fn test_error_conversion_to_string() {
        let error = AppError::ProfileNotFound { id: 42 };
        let error_string: String = error.into();
        assert!(error_string.contains("Profile not found: 42"));
    }
}