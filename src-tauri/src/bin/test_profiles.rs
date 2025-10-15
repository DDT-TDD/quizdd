use std::path::PathBuf;
use quizdd::database::DatabaseService;
use quizdd::services::{ProfileManager, SecurityService};
use quizdd::models::CreateProfileRequest;

/// Profile testing utility
/// 
/// This binary tests profile creation and retrieval to debug the initialization issue.
fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🔍 Testing Profile System...");
    
    // Use the same path as the main app
    let app_data_dir = std::env::var("APPDATA")
        .or_else(|_| std::env::var("HOME").map(|h| format!("{}/.local/share", h)))
        .unwrap_or_else(|_| ".".to_string());
    let app_data_path = PathBuf::from(app_data_dir).join("Educational Quiz App");
    
    // Ensure directory exists
    std::fs::create_dir_all(&app_data_path)?;
    
    let db_path = app_data_path.join("educational_quiz_app.db");
    
    println!("📁 Database path: {:?}", db_path);
    println!("📁 Database exists: {}", db_path.exists());
    
    if !db_path.exists() {
        println!("❌ Database file does not exist! Run seed_database first.");
        return Ok(());
    }

    // Initialize database service
    let db_service = DatabaseService::new(&db_path)?;
    db_service.initialize()?;
    println!("✅ Database service initialized");

    // Create profile manager
    let security_service = SecurityService::new()?;
    let profile_manager = ProfileManager::new(db_service.manager(), security_service);
    println!("✅ Profile manager created");

    // Test getting all profiles
    println!("\n🔍 Testing profile retrieval...");
    match profile_manager.get_all_profiles() {
        Ok(profiles) => {
            println!("✅ Successfully retrieved {} profiles", profiles.len());
            for (i, profile) in profiles.iter().enumerate() {
                println!("  Profile {}: {} (ID: {:?}, Avatar: {})", 
                    i + 1, profile.name, profile.id, profile.avatar);
            }
            
            if profiles.is_empty() {
                println!("\n🆕 No profiles found. Creating a test profile...");
                
                let test_profile_request = CreateProfileRequest {
                    name: "Test Child".to_string(),
                    avatar: "😊".to_string(),
                    theme_preference: Some("default".to_string()),
                };
                
                match profile_manager.create_profile(test_profile_request) {
                    Ok(new_profile) => {
                        println!("✅ Test profile created successfully!");
                        println!("  Name: {}", new_profile.name);
                        println!("  ID: {:?}", new_profile.id);
                        println!("  Avatar: {}", new_profile.avatar);
                        
                        // Test retrieval again
                        match profile_manager.get_all_profiles() {
                            Ok(updated_profiles) => {
                                println!("✅ Profile retrieval after creation: {} profiles", updated_profiles.len());
                            }
                            Err(e) => {
                                println!("❌ Failed to retrieve profiles after creation: {}", e);
                            }
                        }
                    }
                    Err(e) => {
                        println!("❌ Failed to create test profile: {}", e);
                    }
                }
            }
        }
        Err(e) => {
            println!("❌ Failed to retrieve profiles: {}", e);
            println!("   Error details: {:?}", e);
            
            // Try to get database stats for debugging
            match db_service.get_stats() {
                Ok(stats) => {
                    println!("📊 Database stats: Active connections: {}/{}", 
                        stats.active_connections, stats.max_connections);
                }
                Err(db_err) => {
                    println!("❌ Failed to get database stats: {}", db_err);
                }
            }
        }
    }

    println!("\n🎯 Profile system test completed!");
    Ok(())
}