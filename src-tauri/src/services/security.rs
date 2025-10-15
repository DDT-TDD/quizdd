use crate::errors::{AppError, AppResult};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

/// Parental access challenge
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParentalChallenge {
    pub id: String,
    pub question: String,
    pub expected_answer: u32,
    pub expires_at: u64,
}

/// Security service for cryptographic operations and content verification
pub struct SecurityService {
    key_store: KeyStore,
    signature_verifier: SignatureVerifier,
}

impl SecurityService {
    /// Create a new security service with default configuration
    pub fn new() -> AppResult<Self> {
        let key_store = KeyStore::new()?;
        let signature_verifier = SignatureVerifier::new()?;
        
        Ok(Self {
            key_store,
            signature_verifier,
        })
    }
    
    /// Verify the signature of an update package
    pub fn verify_update_signature(&self, update_data: &[u8], signature: &[u8]) -> AppResult<bool> {
        self.signature_verifier.verify(update_data, signature)
            .map_err(|e| AppError::Security(format!("Signature verification failed: {}", e)))
    }
    
    /// Encrypt sensitive data using local encryption key
    pub fn encrypt_sensitive_data(&self, data: &[u8]) -> AppResult<Vec<u8>> {
        self.key_store.encrypt(data)
            .map_err(|e| AppError::Security(format!("Encryption failed: {}", e)))
    }
    
    /// Decrypt sensitive data using local encryption key
    pub fn decrypt_sensitive_data(&self, encrypted_data: &[u8]) -> AppResult<Vec<u8>> {
        self.key_store.decrypt(encrypted_data)
            .map_err(|e| AppError::Security(format!("Decryption failed: {}", e)))
    }
    
    /// Validate parental access with math challenge
    pub fn validate_parental_access(&self, challenge: &str, input: &str) -> AppResult<bool> {
        let expected_answer = self.solve_math_challenge(challenge)?;
        let user_answer = input.trim().parse::<u32>()
            .map_err(|_| AppError::Security("Invalid answer format".to_string()))?;
        
        Ok(user_answer == expected_answer)
    }
    
    /// Generate a new parental access challenge
    pub fn generate_parental_challenge(&self) -> AppResult<ParentalChallenge> {
        use std::time::{SystemTime, UNIX_EPOCH};
        
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| AppError::Security(format!("Time error: {}", e)))?
            .as_secs();
        
        // Generate different types of math problems
        let problem_type = timestamp % 4;
        let (question, answer) = match problem_type {
            0 => {
                // Addition
                let a = ((timestamp % 20) + 5) as u32;
                let b = ((timestamp / 10 % 15) + 3) as u32;
                (format!("What is {} + {}?", a, b), a + b)
            },
            1 => {
                // Subtraction
                let a = ((timestamp % 15) + 15) as u32;
                let b = ((timestamp / 10 % 10) + 3) as u32;
                (format!("What is {} - {}?", a, b), a - b)
            },
            2 => {
                // Multiplication (simple)
                let a = ((timestamp % 8) + 2) as u32;
                let b = ((timestamp / 10 % 8) + 2) as u32;
                (format!("What is {} × {}?", a, b), a * b)
            },
            _ => {
                // Division
                let b = ((timestamp % 8) + 2) as u32;
                let answer = ((timestamp / 10 % 10) + 3) as u32;
                let a = b * answer;
                (format!("What is {} ÷ {}?", a, b), answer)
            }
        };
        
        Ok(ParentalChallenge {
            id: format!("{}", timestamp),
            question,
            expected_answer: answer,
            expires_at: timestamp + 300, // 5 minutes expiry
        })
    }
    
    /// Validate parental access for sensitive features
    pub fn validate_parental_feature_access(&self, feature: &str, session_token: &str) -> AppResult<bool> {
        // Check if the session token is valid for accessing sensitive features
        match feature {
            "custom_mix_creation" | "settings" | "content_updates" | "profile_management" => {
                self.validate_session_token(session_token)
            },
            _ => Ok(false), // Unknown feature, deny access
        }
    }
    
    /// Generate a session token for parental access
    pub fn generate_parental_session_token(&self) -> AppResult<String> {
        use std::time::{SystemTime, UNIX_EPOCH};
        
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| AppError::Security(format!("Time error: {}", e)))?
            .as_secs();
        
        // Simple token generation (in production, use proper JWT or similar)
        let token_data = format!("parental_access_{}", timestamp);
        let encrypted_token = self.encrypt_sensitive_data(token_data.as_bytes())?;
        
        // Encode as hex string
        Ok(self.encode_hex(&encrypted_token))
    }
    
    /// Validate a parental session token
    fn validate_session_token(&self, token: &str) -> AppResult<bool> {
        use std::time::{SystemTime, UNIX_EPOCH};
        
        // Decode hex token
        let encrypted_data = self.decode_hex(token)
            .map_err(|_| AppError::Security("Invalid token format".to_string()))?;
        
        // Decrypt token
        let decrypted_data = self.decrypt_sensitive_data(&encrypted_data)?;
        let token_string = String::from_utf8(decrypted_data)
            .map_err(|_| AppError::Security("Invalid token data".to_string()))?;
        
        // Parse timestamp from token
        if let Some(timestamp_str) = token_string.strip_prefix("parental_access_") {
            let token_timestamp = timestamp_str.parse::<u64>()
                .map_err(|_| AppError::Security("Invalid token timestamp".to_string()))?;
            
            let current_timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map_err(|e| AppError::Security(format!("Time error: {}", e)))?
                .as_secs();
            
            // Token valid for 1 hour
            Ok(current_timestamp - token_timestamp < 3600)
        } else {
            Ok(false)
        }
    }
    
    /// Solve math challenge to get expected answer
    fn solve_math_challenge(&self, challenge: &str) -> AppResult<u32> {
        // Parse the challenge string to extract the math problem
        if challenge.contains(" + ") {
            let parts: Vec<&str> = challenge.split(" + ").collect();
            if parts.len() == 2 {
                let a = parts[0].split_whitespace().last().unwrap_or("0").parse::<u32>()
                    .map_err(|_| AppError::Security("Invalid challenge format".to_string()))?;
                let b = parts[1].split('?').next().unwrap_or("0").parse::<u32>()
                    .map_err(|_| AppError::Security("Invalid challenge format".to_string()))?;
                return Ok(a + b);
            }
        } else if challenge.contains(" - ") {
            let parts: Vec<&str> = challenge.split(" - ").collect();
            if parts.len() == 2 {
                let a = parts[0].split_whitespace().last().unwrap_or("0").parse::<u32>()
                    .map_err(|_| AppError::Security("Invalid challenge format".to_string()))?;
                let b = parts[1].split('?').next().unwrap_or("0").parse::<u32>()
                    .map_err(|_| AppError::Security("Invalid challenge format".to_string()))?;
                return Ok(a - b);
            }
        } else if let Some((a, b)) = self.parse_multiplication_operands(challenge) {
            return Ok(a * b);
        } else if challenge.contains(" ÷ ") {
            let parts: Vec<&str> = challenge.split(" ÷ ").collect();
            if parts.len() == 2 {
                let a = parts[0].split_whitespace().last().unwrap_or("0").parse::<u32>()
                    .map_err(|_| AppError::Security("Invalid challenge format".to_string()))?;
                let b = parts[1].split('?').next().unwrap_or("0").parse::<u32>()
                    .map_err(|_| AppError::Security("Invalid challenge format".to_string()))?;
                if b != 0 {
                    return Ok(a / b);
                }
            }
        }
        
        Err(AppError::Security("Unsupported challenge format".to_string()))
    }

    fn parse_multiplication_operands(&self, challenge: &str) -> Option<(u32, u32)> {
        // Support multiple multiplication symbols to ensure parity with frontend formatting
        let normalized = challenge
            .replace(" × ", " x ")
            .replace(" X ", " x ")
            .replace(" * ", " x ");

        if !normalized.contains(" x ") {
            return None;
        }

        let parts: Vec<&str> = normalized.split(" x ").collect();
        if parts.len() != 2 {
            return None;
        }

        let left = parts[0].split_whitespace().last()?.trim();
        let right = parts[1].split('?').next()?.trim();

        let a = left.parse::<u32>().ok()?;
        let b = right.parse::<u32>().ok()?;

        Some((a, b))
    }
    
    /// Encode bytes as hex string
    fn encode_hex(&self, data: &[u8]) -> String {
        data.iter()
            .map(|b| format!("{:02x}", b))
            .collect()
    }
    
    /// Decode hex string to bytes
    fn decode_hex(&self, hex_str: &str) -> Result<Vec<u8>, String> {
        if hex_str.len() % 2 != 0 {
            return Err("Invalid hex string length".to_string());
        }
        
        let mut result = Vec::new();
        for chunk in hex_str.as_bytes().chunks(2) {
            let hex_byte = std::str::from_utf8(chunk)
                .map_err(|_| "Invalid UTF-8 in hex string")?;
            let byte = u8::from_str_radix(hex_byte, 16)
                .map_err(|_| "Invalid hex character")?;
            result.push(byte);
        }
        
        Ok(result)
    }
    
    /// Verify content package integrity
    pub fn verify_content_package(&self, package_data: &[u8], expected_hash: &str) -> AppResult<bool> {
        let computed_hash = self.compute_sha256_hash(package_data)?;
        Ok(computed_hash == expected_hash)
    }
    
    /// Compute SHA256 hash of data
    fn compute_sha256_hash(&self, data: &[u8]) -> AppResult<String> {
        // In a real implementation, this would use a proper crypto library like ring or sha2
        // For now, we'll use a simple checksum as a placeholder
        let checksum: u64 = data.iter().map(|&b| b as u64).sum();
        Ok(format!("{:016x}", checksum))
    }
    
    /// Calculate checksum for update packages
    pub fn calculate_checksum(&self, data: &[u8]) -> AppResult<String> {
        self.compute_sha256_hash(data)
    }
    
    /// Legacy method for backward compatibility
    fn evaluate_math_challenge(&self, input: &str) -> AppResult<bool> {
        // Parse the input as a number and check if it's reasonable
        match input.trim().parse::<u32>() {
            Ok(answer) => Ok(answer > 0 && answer < 1000), // Expanded range for more complex math
            Err(_) => Ok(false),
        }
    }
}

impl Default for SecurityService {
    fn default() -> Self {
        Self::new().expect("Failed to create default SecurityService")
    }
}

/// Key store for managing encryption keys
struct KeyStore {
    encryption_key: Vec<u8>,
}

impl KeyStore {
    fn new() -> AppResult<Self> {
        // In a real implementation, this would derive keys from system entropy
        // or load from secure storage
        let encryption_key = vec![
            0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
            0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c,
            0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
            0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c,
        ];
        
        Ok(Self { encryption_key })
    }
    
    fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>, String> {
        // Simple XOR encryption for demonstration
        // In production, use proper encryption like AES
        let mut encrypted = Vec::with_capacity(data.len());
        for (i, &byte) in data.iter().enumerate() {
            let key_byte = self.encryption_key[i % self.encryption_key.len()];
            encrypted.push(byte ^ key_byte);
        }
        Ok(encrypted)
    }
    
    fn decrypt(&self, encrypted_data: &[u8]) -> Result<Vec<u8>, String> {
        // XOR decryption (same as encryption for XOR)
        self.encrypt(encrypted_data)
    }
}

/// Signature verifier for content packages
struct SignatureVerifier {
    public_keys: HashMap<String, Vec<u8>>,
}

impl SignatureVerifier {
    fn new() -> AppResult<Self> {
        let mut public_keys = HashMap::new();
        
        // Add default public key for content verification
        // In production, these would be proper cryptographic keys
        public_keys.insert(
            "default".to_string(),
            vec![
                0x04, 0x8b, 0x9d, 0x5a, 0x63, 0x05, 0x42, 0x96,
                0x85, 0x3a, 0x0d, 0x1c, 0x42, 0x02, 0x76, 0x3a,
                0x04, 0x8b, 0x9d, 0x5a, 0x63, 0x05, 0x42, 0x96,
                0x85, 0x3a, 0x0d, 0x1c, 0x42, 0x02, 0x76, 0x3a,
            ]
        );
        
        Ok(Self { public_keys })
    }
    
    fn verify(&self, _data: &[u8], signature: &[u8]) -> Result<bool, String> {
        // Simple signature verification placeholder
        // In production, use proper cryptographic signature verification
        if signature.len() < 32 {
            return Ok(false);
        }
        
        // Check if signature has expected format
        let expected_prefix = &[0x30, 0x45, 0x02, 0x21];
        Ok(signature.starts_with(expected_prefix) || signature.len() == 64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_security_service_creation() {
        let service = SecurityService::new();
        assert!(service.is_ok());
    }

    #[test]
    fn test_encryption_decryption() {
        let service = SecurityService::new().unwrap();
        let original_data = b"Hello, World!";
        
        let encrypted = service.encrypt_sensitive_data(original_data).unwrap();
        let decrypted = service.decrypt_sensitive_data(&encrypted).unwrap();
        
        assert_eq!(original_data, decrypted.as_slice());
    }

    #[test]
    fn test_parental_challenge_generation() {
        let service = SecurityService::new().unwrap();
        let challenge = service.generate_parental_challenge().unwrap();
        
        assert!(challenge.question.contains("What is"));
        assert!(challenge.question.contains("?"));
        assert!(challenge.expected_answer > 0);
        assert!(challenge.expires_at > 0);
    }

    #[test]
    fn test_parental_access_validation() {
        let service = SecurityService::new().unwrap();
        
        // Test with simple addition challenge
        let challenge = "What is 5 + 3?";
        assert!(service.validate_parental_access(challenge, "8").unwrap());
        assert!(!service.validate_parental_access(challenge, "7").unwrap());
        
        // Test with subtraction challenge
        let challenge2 = "What is 10 - 4?";
        assert!(service.validate_parental_access(challenge2, "6").unwrap());
        assert!(!service.validate_parental_access(challenge2, "5").unwrap());
        
        // Invalid inputs
        assert!(!service.validate_parental_access(challenge, "abc").unwrap());
        assert!(!service.validate_parental_access(challenge, "").unwrap());
    }

    #[test]
    fn test_content_package_verification() {
        let service = SecurityService::new().unwrap();
        let test_data = b"test content package";
        
        // Compute hash for the test data
        let hash = service.compute_sha256_hash(test_data).unwrap();
        
        // Verify with correct hash
        assert!(service.verify_content_package(test_data, &hash).unwrap());
        
        // Verify with incorrect hash
        assert!(!service.verify_content_package(test_data, "wrong_hash").unwrap());
    }

    #[test]
    fn test_signature_verification() {
        let service = SecurityService::new().unwrap();
        let test_data = b"test data to sign";
        
        // Valid signature format
        let mut valid_signature = vec![0x30, 0x45, 0x02, 0x21];
        valid_signature.extend(vec![0x00; 28]);
        assert!(service.verify_update_signature(test_data, &valid_signature).unwrap());
        
        // Invalid signature
        let invalid_signature = vec![0x00; 16];
        assert!(!service.verify_update_signature(test_data, &invalid_signature).unwrap());
    }
}