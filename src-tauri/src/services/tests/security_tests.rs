#[cfg(test)]
mod tests {
    use super::super::security::*;
    use crate::database::connection::DatabaseConnection;
    use tempfile::tempdir;
    use tokio_test;

    fn create_test_db() -> DatabaseConnection {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        DatabaseConnection::new(db_path.to_str().unwrap()).unwrap()
    }

    #[tokio::test]
    async fn test_security_service_creation() {
        let db = create_test_db();
        let security_service = SecurityService::new(db);
        
        assert!(security_service.is_ok());
    }

    #[tokio::test]
    async fn test_generate_parental_challenge() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let challenge = security_service.generate_parental_challenge().await;
        
        assert!(challenge.is_ok());
        let challenge = challenge.unwrap();
        assert!(!challenge.id.is_empty());
        assert!(!challenge.question.is_empty());
        assert!(challenge.expected_answer > 0);
        assert!(challenge.expires_at > 0);
    }

    #[tokio::test]
    async fn test_validate_parental_access_correct() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let challenge = security_service.generate_parental_challenge().await.unwrap();
        let result = security_service.validate_parental_access(
            &challenge.id,
            challenge.expected_answer.to_string()
        ).await;
        
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[tokio::test]
    async fn test_validate_parental_access_incorrect() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let challenge = security_service.generate_parental_challenge().await.unwrap();
        let result = security_service.validate_parental_access(
            &challenge.id,
            "wrong_answer".to_string()
        ).await;
        
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[tokio::test]
    async fn test_validate_parental_access_expired() {
        let db = create_test_db();
        let mut security_service = SecurityService::new(db).unwrap();
        
        // Create an expired challenge
        let mut challenge = security_service.generate_parental_challenge().await.unwrap();
        challenge.expires_at = 1; // Set to past timestamp
        
        let result = security_service.validate_parental_access(
            &challenge.id,
            challenge.expected_answer.to_string()
        ).await;
        
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("expired"));
    }

    #[tokio::test]
    async fn test_generate_session_token() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let token = security_service.generate_session_token().await;
        
        assert!(token.is_ok());
        let token = token.unwrap();
        assert!(!token.is_empty());
        assert!(token.len() >= 32); // Should be sufficiently long
    }

    #[tokio::test]
    async fn test_validate_session_token() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let token = security_service.generate_session_token().await.unwrap();
        let result = security_service.validate_session_token(&token).await;
        
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[tokio::test]
    async fn test_validate_invalid_session_token() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let result = security_service.validate_session_token("invalid_token").await;
        
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[tokio::test]
    async fn test_encrypt_decrypt_data() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let original_data = b"sensitive user data";
        
        // Encrypt
        let encrypted = security_service.encrypt_data(original_data).await;
        assert!(encrypted.is_ok());
        let encrypted_data = encrypted.unwrap();
        assert_ne!(encrypted_data, original_data.to_vec());
        
        // Decrypt
        let decrypted = security_service.decrypt_data(&encrypted_data).await;
        assert!(decrypted.is_ok());
        let decrypted_data = decrypted.unwrap();
        assert_eq!(decrypted_data, original_data.to_vec());
    }

    #[tokio::test]
    async fn test_verify_content_signature_valid() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let content = b"test content for signature verification";
        let signature = security_service.sign_content(content).await.unwrap();
        
        let result = security_service.verify_content_signature(content, &signature).await;
        
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[tokio::test]
    async fn test_verify_content_signature_invalid() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let content = b"test content";
        let invalid_signature = b"invalid_signature";
        
        let result = security_service.verify_content_signature(content, invalid_signature).await;
        
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[tokio::test]
    async fn test_verify_content_signature_tampered() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let original_content = b"original content";
        let signature = security_service.sign_content(original_content).await.unwrap();
        
        let tampered_content = b"tampered content";
        let result = security_service.verify_content_signature(tampered_content, &signature).await;
        
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[tokio::test]
    async fn test_hash_password() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let password = "test_password";
        let hash1 = security_service.hash_password(password).await.unwrap();
        let hash2 = security_service.hash_password(password).await.unwrap();
        
        // Hashes should be different due to salt
        assert_ne!(hash1, hash2);
        assert!(hash1.len() > password.len());
    }

    #[tokio::test]
    async fn test_verify_password() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let password = "test_password";
        let hash = security_service.hash_password(password).await.unwrap();
        
        // Correct password
        let result = security_service.verify_password(password, &hash).await;
        assert!(result.is_ok());
        assert!(result.unwrap());
        
        // Incorrect password
        let result = security_service.verify_password("wrong_password", &hash).await;
        assert!(result.is_ok());
        assert!(!result.unwrap());
    }

    #[tokio::test]
    async fn test_generate_secure_random() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let random1 = security_service.generate_secure_random(32).await.unwrap();
        let random2 = security_service.generate_secure_random(32).await.unwrap();
        
        assert_eq!(random1.len(), 32);
        assert_eq!(random2.len(), 32);
        assert_ne!(random1, random2); // Should be different
    }

    #[tokio::test]
    async fn test_rate_limiting() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let client_id = "test_client";
        
        // First few attempts should succeed
        for _ in 0..5 {
            let result = security_service.check_rate_limit(client_id).await;
            assert!(result.is_ok());
            assert!(result.unwrap());
        }
        
        // Subsequent attempts should be rate limited
        let result = security_service.check_rate_limit(client_id).await;
        assert!(result.is_ok());
        assert!(!result.unwrap()); // Should be rate limited
    }

    #[tokio::test]
    async fn test_audit_log() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let event = AuditEvent {
            event_type: "parental_access".to_string(),
            user_id: Some(1),
            details: "Parental gate accessed".to_string(),
            timestamp: chrono::Utc::now(),
            ip_address: Some("127.0.0.1".to_string()),
        };
        
        let result = security_service.log_audit_event(event).await;
        assert!(result.is_ok());
        
        // Retrieve audit logs
        let logs = security_service.get_audit_logs(None, None).await.unwrap();
        assert!(!logs.is_empty());
        assert_eq!(logs[0].event_type, "parental_access");
    }

    #[tokio::test]
    async fn test_security_policy_validation() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        // Test password policy
        let weak_password = "123";
        let result = security_service.validate_password_policy(weak_password).await;
        assert!(result.is_err());
        
        let strong_password = "StrongPassword123!";
        let result = security_service.validate_password_policy(strong_password).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_content_sanitization() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let malicious_input = "<script>alert('xss')</script>Hello World";
        let sanitized = security_service.sanitize_input(malicious_input).await.unwrap();
        
        assert!(!sanitized.contains("<script>"));
        assert!(sanitized.contains("Hello World"));
    }

    #[tokio::test]
    async fn test_session_cleanup() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        // Generate some tokens
        let _token1 = security_service.generate_session_token().await.unwrap();
        let _token2 = security_service.generate_session_token().await.unwrap();
        
        // Clean up expired sessions
        let result = security_service.cleanup_expired_sessions().await;
        assert!(result.is_ok());
        
        let cleaned_count = result.unwrap();
        assert!(cleaned_count >= 0); // Should not error
    }

    #[tokio::test]
    async fn test_key_rotation() {
        let db = create_test_db();
        let mut security_service = SecurityService::new(db).unwrap();
        
        let original_key = security_service.get_current_encryption_key().await.unwrap();
        
        // Rotate key
        let result = security_service.rotate_encryption_key().await;
        assert!(result.is_ok());
        
        let new_key = security_service.get_current_encryption_key().await.unwrap();
        assert_ne!(original_key, new_key);
    }

    #[tokio::test]
    async fn test_backup_encryption() {
        let db = create_test_db();
        let security_service = SecurityService::new(db).unwrap();
        
        let backup_data = b"sensitive backup data";
        
        // Encrypt backup
        let encrypted_backup = security_service.encrypt_backup(backup_data).await;
        assert!(encrypted_backup.is_ok());
        let encrypted = encrypted_backup.unwrap();
        
        // Decrypt backup
        let decrypted_backup = security_service.decrypt_backup(&encrypted).await;
        assert!(decrypted_backup.is_ok());
        let decrypted = decrypted_backup.unwrap();
        
        assert_eq!(decrypted, backup_data.to_vec());
    }
}