// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use quizdd::{
    DatabaseService, 
    services::{
        QuizEngine, ProfileManager, ContentManager, ContentSeeder, SecurityService, CustomMixManager,
        UpdateService, UpdateInfo, UpdateConfig,
        ProfileUpdateRequest, QuizResult, QuizConfig, QuizSession, Score, 
        ContentPack, ContentStatistics, AnswerResult, ParentalChallenge, QuizProgress
    }
};
use std::sync::{Arc, Mutex};
use tauri::{State, Manager};
use serde::{Deserialize, Serialize};
use serde_json::Value;

// Import models and types
use quizdd::models::{
    Question, Answer, Profile, CreateProfileRequest, Progress, Subject,
    KeyStage, CustomMix, CreateMixRequest, UpdateMixRequest, MixConfig
};
use quizdd::errors::AppResult;

// Application state that will be managed by Tauri
pub struct AppState {
    pub database: Arc<DatabaseService>,
    pub quiz_engine: Arc<Mutex<QuizEngine>>,
    pub profile_manager: Arc<ProfileManager>,
    pub content_manager: Arc<ContentManager>,
    pub content_seeder: Arc<ContentSeeder>,
    pub security_service: Arc<SecurityService>,
    pub custom_mix_manager: Arc<CustomMixManager>,
    pub update_service: Arc<UpdateService>,
}

impl AppState {
    pub fn new(
        database_service: DatabaseService,
        content_directory: std::path::PathBuf,
        app_data_dir: std::path::PathBuf,
    ) -> AppResult<Self> {
        println!("🏗️ AppState::new - Getting database manager...");
        let db_manager = database_service.manager();
        
        println!("🔒 AppState::new - Creating security service...");
        let security_service = Arc::new(SecurityService::new()?);
        
        println!("👤 AppState::new - Creating profile manager...");
        let profile_manager = Arc::new(ProfileManager::new(
            db_manager.clone(),
            SecurityService::new()?,
        ));
        
        println!("📚 AppState::new - Creating content manager...");
        let content_manager = Arc::new(ContentManager::new(
            db_manager.clone(),
            SecurityService::new()?,
            content_directory,
        ));
        
        println!("🎯 AppState::new - Creating quiz engine...");
        let quiz_engine = Arc::new(Mutex::new(QuizEngine::new(
            db_manager.clone(),
            content_manager.clone(),
        )));

        println!("🎨 AppState::new - Creating custom mix manager...");
        let custom_mix_manager = Arc::new(CustomMixManager::new(db_manager.clone()));
        
        println!("🔄 AppState::new - Creating update service...");
        // Create update service with default configuration
        let update_config = UpdateConfig {
            repository_urls: vec![
                "https://updates.educationalquizapp.com".to_string(),
                "https://content.educationalquizapp.com".to_string(),
            ],
            auto_check: false,
            check_interval_hours: 24,
            backup_retention_days: 7,
        };
        
        let update_service = Arc::new(UpdateService::new(
            SecurityService::new()?,
            update_config,
            app_data_dir,
        )?);
        
        println!("🌱 AppState::new - Creating content seeder...");
        let content_seeder = Arc::new(ContentSeeder::new(db_manager.clone()));

        println!("✅ AppState::new - All services created, assembling state...");
        Ok(Self {
            database: Arc::new(database_service),
            quiz_engine,
            profile_manager,
            content_manager,
            content_seeder,
            security_service,
            custom_mix_manager,
            update_service,
        })
    }
}

// ============================================================================
// QUIZ ENGINE COMMANDS
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct GetQuestionsRequest {
    pub subject: String,
    pub key_stage: KeyStage,
    pub count: usize,
    pub difficulty_range: Option<(u8, u8)>,
}

#[tauri::command]
async fn get_questions(
    state: State<'_, AppState>,
    request: GetQuestionsRequest,
) -> Result<Vec<Question>, String> {
    let quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.get_questions(
        &request.subject,
        request.key_stage,
        request.count,
        request.difficulty_range,
    ).map_err(|e| e.to_string())
}

#[tauri::command]
async fn validate_answer(
    state: State<'_, AppState>,
    question_id: u32,
    submitted_answer: Answer,
) -> Result<AnswerResult, String> {
    let quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.validate_answer(question_id, submitted_answer)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn start_quiz_session(
    state: State<'_, AppState>,
    profile_id: u32,
    config: QuizConfig,
) -> Result<QuizSession, String> {
    let quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.start_quiz_session(profile_id, config)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn submit_answer(
    state: State<'_, AppState>,
    session_id: u32,
    answer: Answer,
    time_taken_seconds: u32,
) -> Result<AnswerResult, String> {
    let mut quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.submit_answer(session_id, answer, time_taken_seconds)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_current_question(
    state: State<'_, AppState>,
    session_id: u32,
) -> Result<Option<Question>, String> {
    let quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.get_current_question(session_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn calculate_score(
    state: State<'_, AppState>,
    quiz_session: QuizSession,
) -> Result<Score, String> {
    let quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.calculate_score(&quiz_session)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn pause_quiz(
    state: State<'_, AppState>,
    session_id: u32,
) -> Result<(), String> {
    let mut quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.pause_quiz(session_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn resume_quiz(
    state: State<'_, AppState>,
    session_id: u32,
) -> Result<(), String> {
    let mut quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.resume_quiz(session_id)
        .map_err(|e| e.to_string())
}

// ============================================================================
// PROFILE MANAGEMENT COMMANDS
// ============================================================================

#[tauri::command]
async fn create_profile(
    state: State<'_, AppState>,
    request: CreateProfileRequest,
) -> Result<Profile, String> {
    println!("🔍 create_profile command called with name: {}", request.name);
    match state.profile_manager.create_profile(request) {
        Ok(profile) => {
            println!("✅ Successfully created profile: {} (ID: {:?})", profile.name, profile.id);
            Ok(profile)
        }
        Err(e) => {
            println!("❌ Failed to create profile in Rust backend: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn get_profile_by_id(
    state: State<'_, AppState>,
    profile_id: u32,
) -> Result<Profile, String> {
    state.profile_manager.get_profile_by_id(profile_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_all_profiles(
    state: State<'_, AppState>,
) -> Result<Vec<Profile>, String> {
    println!("🔍 get_all_profiles command called");
    match state.profile_manager.get_all_profiles() {
        Ok(profiles) => {
            println!("✅ Successfully retrieved {} profiles from Rust backend", profiles.len());
            for (i, profile) in profiles.iter().enumerate() {
                println!("  Profile {}: {} (ID: {:?})", i + 1, profile.name, profile.id);
            }
            Ok(profiles)
        }
        Err(e) => {
            println!("❌ Failed to retrieve profiles in Rust backend: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn update_profile(
    state: State<'_, AppState>,
    profile_id: u32,
    updates: ProfileUpdateRequest,
) -> Result<Profile, String> {
    state.profile_manager.update_profile(profile_id, updates)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_profile(
    state: State<'_, AppState>,
    profile_id: u32,
) -> Result<(), String> {
    state.profile_manager.delete_profile(profile_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_progress(
    state: State<'_, AppState>,
    profile_id: u32,
) -> Result<Progress, String> {
    state.profile_manager.get_progress(profile_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_progress(
    state: State<'_, AppState>,
    profile_id: u32,
    quiz_result: QuizResult,
) -> Result<(), String> {
    state.profile_manager.update_progress(profile_id, quiz_result)
        .map_err(|e| e.to_string())
}

// ============================================================================
// CONTENT MANAGEMENT COMMANDS
// ============================================================================

#[tauri::command]
async fn get_subjects(
    state: State<'_, AppState>,
) -> Result<Vec<Subject>, String> {
    state.content_manager.get_subjects()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_questions_by_subject(
    state: State<'_, AppState>,
    subject_name: String,
    key_stage: Option<KeyStage>,
    difficulty_range: Option<(u8, u8)>,
    limit: Option<usize>,
) -> Result<Vec<Question>, String> {
    state.content_manager.get_questions_by_subject(
        &subject_name,
        key_stage,
        difficulty_range,
        limit,
    ).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_question_by_id(
    state: State<'_, AppState>,
    question_id: u32,
) -> Result<Question, String> {
    state.content_manager.get_question_by_id(question_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_question(
    state: State<'_, AppState>,
    question: Question,
) -> Result<u32, String> {
    state.content_manager.add_question(question)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_question(
    state: State<'_, AppState>,
    question_id: u32,
    question: Question,
) -> Result<(), String> {
    state.content_manager.update_question(question_id, question)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_question(
    state: State<'_, AppState>,
    question_id: u32,
) -> Result<(), String> {
    state.content_manager.delete_question(question_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_content_statistics(
    state: State<'_, AppState>,
) -> Result<ContentStatistics, String> {
    state.content_manager.get_content_statistics()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_content_pack(
    state: State<'_, AppState>,
    pack_path: String,
) -> Result<(), String> {
    let path = std::path::Path::new(&pack_path);
    state.content_manager.load_content_pack(path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn verify_content_signature(
    state: State<'_, AppState>,
    pack: ContentPack,
) -> Result<bool, String> {
    state.content_manager.verify_content_signature(&pack)
        .map_err(|e| e.to_string())
}

// ============================================================================
// CONTENT SEEDING COMMANDS
// ============================================================================

#[tauri::command]
async fn seed_all_content(
    state: State<'_, AppState>,
) -> Result<(), String> {
    state.content_seeder.seed_all_content()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn is_content_seeded(
    state: State<'_, AppState>,
) -> Result<bool, String> {
    state.content_seeder.is_content_seeded()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn seed_if_empty(
    state: State<'_, AppState>,
) -> Result<(), String> {
    state.content_seeder.seed_if_empty()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn reset_and_reseed_database(
    state: State<'_, AppState>,
) -> Result<(), String> {
    // Clear all questions by deleting them from the database
    state.database.manager().execute(|conn| {
        conn.execute("DELETE FROM questions", [])?;
        Ok(())
    }).map_err(|e| e.to_string())?;
    
    // Reseed with correct format
    state.content_seeder.seed_all_content()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_seeder_statistics(
    state: State<'_, AppState>,
) -> Result<ContentStatistics, String> {
    state.content_manager.get_content_statistics()
        .map_err(|e| e.to_string())
}

// ============================================================================
// CUSTOM MIX COMMANDS
// ============================================================================

#[tauri::command]
async fn create_custom_mix(
    state: State<'_, AppState>,
    request: CreateMixRequest,
) -> Result<CustomMix, String> {
    state.custom_mix_manager.create_custom_mix(request)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_custom_mix_by_id(
    state: State<'_, AppState>,
    mix_id: u32,
) -> Result<CustomMix, String> {
    state.custom_mix_manager.get_custom_mix_by_id(mix_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_all_custom_mixes(
    state: State<'_, AppState>,
) -> Result<Vec<CustomMix>, String> {
    state.custom_mix_manager.get_all_custom_mixes()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_custom_mixes_by_profile(
    state: State<'_, AppState>,
    profile_id: u32,
) -> Result<Vec<CustomMix>, String> {
    state.custom_mix_manager.get_custom_mixes_by_profile(profile_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_custom_mix(
    state: State<'_, AppState>,
    mix_id: u32,
    updates: UpdateMixRequest,
) -> Result<CustomMix, String> {
    state.custom_mix_manager.update_custom_mix(mix_id, updates)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_custom_mix(
    state: State<'_, AppState>,
    mix_id: u32,
) -> Result<(), String> {
    state.custom_mix_manager.delete_custom_mix(mix_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_available_question_count(
    state: State<'_, AppState>,
    config: MixConfig,
) -> Result<u32, String> {
    state.custom_mix_manager.get_available_question_count(&config)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn validate_mix_feasibility(
    state: State<'_, AppState>,
    config: MixConfig,
) -> Result<(), String> {
    state.custom_mix_manager.validate_mix_feasibility(&config)
        .map_err(|e| e.to_string())
}

// ============================================================================
// SECURITY COMMANDS
// ============================================================================

#[tauri::command]
async fn validate_parental_access(
    state: State<'_, AppState>,
    challenge: String,
    input: String,
) -> Result<bool, String> {
    state.security_service.validate_parental_access(&challenge, &input)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn generate_parental_challenge(
    state: State<'_, AppState>,
) -> Result<ParentalChallenge, String> {
    state.security_service.generate_parental_challenge()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn validate_parental_feature_access(
    state: State<'_, AppState>,
    feature: String,
    session_token: String,
) -> Result<bool, String> {
    state.security_service.validate_parental_feature_access(&feature, &session_token)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn generate_parental_session_token(
    state: State<'_, AppState>,
) -> Result<String, String> {
    state.security_service.generate_parental_session_token()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_quiz_progress(
    state: State<'_, AppState>,
    session_id: u32,
) -> Result<QuizProgress, String> {
    let quiz_engine = state.quiz_engine.lock().map_err(|e| format!("Lock error: {}", e))?;
    
    quiz_engine.get_quiz_progress(session_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn verify_update_signature(
    state: State<'_, AppState>,
    update_data: Vec<u8>,
    signature: Vec<u8>,
) -> Result<bool, String> {
    state.security_service.verify_update_signature(&update_data, &signature)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn encrypt_sensitive_data(
    state: State<'_, AppState>,
    data: Vec<u8>,
) -> Result<Vec<u8>, String> {
    state.security_service.encrypt_sensitive_data(&data)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn decrypt_sensitive_data(
    state: State<'_, AppState>,
    encrypted_data: Vec<u8>,
) -> Result<Vec<u8>, String> {
    state.security_service.decrypt_sensitive_data(&encrypted_data)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn verify_content_package(
    state: State<'_, AppState>,
    package_data: Vec<u8>,
    expected_hash: String,
) -> Result<bool, String> {
    state.security_service.verify_content_package(&package_data, &expected_hash)
        .map_err(|e| e.to_string())
}

// ============================================================================
// UPDATE SERVICE COMMANDS
// ============================================================================

#[tauri::command]
async fn check_for_updates(
    state: State<'_, AppState>,
) -> Result<Vec<UpdateInfo>, String> {
    state.update_service.check_for_updates().await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn download_and_install_update(
    state: State<'_, AppState>,
    update_info: UpdateInfo,
) -> Result<(), String> {
    state.update_service.download_and_install_update(&update_info).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn rollback_to_backup(
    state: State<'_, AppState>,
) -> Result<(), String> {
    state.update_service.rollback_to_backup().await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_current_version(
    state: State<'_, AppState>,
) -> Result<String, String> {
    state.update_service.get_current_version().await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_backups(
    state: State<'_, AppState>,
) -> Result<Vec<String>, String> {
    state.update_service.list_backups().await
        .map_err(|e| e.to_string())
}

// ============================================================================
// SETTINGS COMMANDS
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    pub font_size: String,
    pub sound_enabled: bool,
    pub animations_enabled: bool,
    pub high_contrast_mode: bool,
    pub reduced_motion: bool,
    pub auto_save: bool,
    pub parental_controls_enabled: bool,
}

#[tauri::command]
async fn save_settings(
    settings: AppSettings,
) -> Result<(), String> {
    // Save settings to a local file in the app data directory
    let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app data directory")?;
    
    let settings_path = app_data_dir.join("settings.json");
    
    // Ensure the directory exists
    if let Some(parent) = settings_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    }
    
    let settings_json = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    std::fs::write(&settings_path, settings_json)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn load_settings() -> Result<AppSettings, String> {
    let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app data directory")?;
    
    let settings_path = app_data_dir.join("settings.json");
    
    if !settings_path.exists() {
        // Return default settings if file doesn't exist
        return Ok(AppSettings {
            theme: "default".to_string(),
            font_size: "medium".to_string(),
            sound_enabled: true,
            animations_enabled: true,
            high_contrast_mode: false,
            reduced_motion: false,
            auto_save: true,
            parental_controls_enabled: true,
        });
    }
    
    let settings_content = std::fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings file: {}", e))?;
    
    let settings: AppSettings = serde_json::from_str(&settings_content)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;
    
    Ok(settings)
}

#[tauri::command]
async fn reset_settings() -> Result<AppSettings, String> {
    let default_settings = AppSettings {
        theme: "default".to_string(),
        font_size: "medium".to_string(),
        sound_enabled: true,
        animations_enabled: true,
        high_contrast_mode: false,
        reduced_motion: false,
        auto_save: true,
        parental_controls_enabled: true,
    };
    
    // Save the default settings
    save_settings(default_settings.clone()).await?;
    
    Ok(default_settings)
}

#[tauri::command]
async fn update_setting(
    key: String,
    value: Value,
) -> Result<AppSettings, String> {
    // Load current settings
    let mut settings = load_settings().await?;
    
    // Update the specific setting
    match key.as_str() {
        "theme" => {
            if let Some(theme_str) = value.as_str() {
                settings.theme = theme_str.to_string();
            }
        }
        "fontSize" => {
            if let Some(size_str) = value.as_str() {
                settings.font_size = size_str.to_string();
            }
        }
        "soundEnabled" => {
            if let Some(enabled) = value.as_bool() {
                settings.sound_enabled = enabled;
            }
        }
        "animationsEnabled" => {
            if let Some(enabled) = value.as_bool() {
                settings.animations_enabled = enabled;
            }
        }
        "highContrastMode" => {
            if let Some(enabled) = value.as_bool() {
                settings.high_contrast_mode = enabled;
            }
        }
        "reducedMotion" => {
            if let Some(enabled) = value.as_bool() {
                settings.reduced_motion = enabled;
            }
        }
        "autoSave" => {
            if let Some(enabled) = value.as_bool() {
                settings.auto_save = enabled;
            }
        }
        "parentalControlsEnabled" => {
            if let Some(enabled) = value.as_bool() {
                settings.parental_controls_enabled = enabled;
            }
        }
        _ => return Err(format!("Unknown setting key: {}", key)),
    }
    
    // Save the updated settings
    save_settings(settings.clone()).await?;
    
    Ok(settings)
}

// ============================================================================
// LEGACY DATABASE COMMANDS (for debugging/monitoring)
// ============================================================================

#[tauri::command]
async fn get_database_stats(state: State<'_, AppState>) -> Result<String, String> {
    match state.database.get_stats() {
        Ok(stats) => Ok(format!(
            "Active connections: {}/{}, Max lifetime: {}s, Max idle: {}s",
            stats.active_connections,
            stats.max_connections,
            stats.max_lifetime_seconds,
            stats.max_idle_seconds
        )),
        Err(e) => Err(format!("Failed to get database stats: {}", e)),
    }
}

#[tauri::command]
async fn get_database_version(state: State<'_, AppState>) -> Result<u32, String> {
    state.database.get_version()
        .map_err(|e| format!("Failed to get database version: {}", e))
}

fn main() {
    println!("🚀 Starting QuiZDD application...");
    
    // Initialize database
    println!("📁 Getting app data directory...");
    let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .expect("Failed to get app data directory");
    
    // Ensure app data directory exists
    println!("📁 Creating app data directory...");
    std::fs::create_dir_all(&app_data_dir)
        .expect("Failed to create app data directory");
    
    let app_specific_dir = app_data_dir.join("Educational Quiz App");
    std::fs::create_dir_all(&app_specific_dir)
        .expect("Failed to create app-specific directory");
    
    let db_path = app_specific_dir.join("educational_quiz_app.db");
    let content_dir = app_specific_dir.join("content");
    
    println!("App data directory: {:?}", app_specific_dir);
    println!("Database path: {:?}", db_path);
    
    // Ensure content directory exists
    println!("📁 Creating content directory...");
    std::fs::create_dir_all(&content_dir)
        .expect("Failed to create content directory");
    
    println!("🗄️ Creating database service...");
    let database_service = DatabaseService::new(&db_path)
        .expect("Failed to create database service");
    
    println!("🗄️ Initializing database...");
    database_service.initialize()
        .expect("Failed to initialize database");

    // Ensure database is seeded with content
    println!("🌱 Creating content seeder...");
    let content_seeder = quizdd::services::ContentSeeder::new(database_service.manager());
    
    println!("🌱 Checking if seeding is needed...");
    if let Err(e) = content_seeder.seed_if_empty() {
        eprintln!("Warning: Failed to seed database content: {}", e);
    }
    println!("✅ Database seeding completed");

    println!("🏗️ Creating application state...");
    let app_state = match AppState::new(database_service, content_dir, app_data_dir) {
        Ok(state) => {
            println!("✅ Application state created successfully");
            state
        }
        Err(e) => {
            eprintln!("❌ Failed to create application state: {}", e);
            panic!("Failed to create application state: {}", e);
        }
    };

    println!("🚀 Building Tauri application...");
    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            // Quiz Engine Commands
            get_questions,
            validate_answer,
            start_quiz_session,
            submit_answer,
            get_current_question,
            calculate_score,
            pause_quiz,
            resume_quiz,
            
            // Profile Management Commands
            create_profile,
            get_profile_by_id,
            get_all_profiles,
            update_profile,
            delete_profile,
            get_progress,
            update_progress,
            
            // Content Management Commands
            get_subjects,
            get_questions_by_subject,
            get_question_by_id,
            add_question,
            update_question,
            delete_question,
            get_content_statistics,
            load_content_pack,
            verify_content_signature,
            
            // Content Seeding Commands
            seed_all_content,
            is_content_seeded,
            seed_if_empty,
            reset_and_reseed_database,
            get_seeder_statistics,
            
            // Custom Mix Commands
            create_custom_mix,
            get_custom_mix_by_id,
            get_all_custom_mixes,
            get_custom_mixes_by_profile,
            update_custom_mix,
            delete_custom_mix,
            get_available_question_count,
            validate_mix_feasibility,
            
            // Security Commands
            validate_parental_access,
            generate_parental_challenge,
            validate_parental_feature_access,
            generate_parental_session_token,
            get_quiz_progress,
            verify_update_signature,
            encrypt_sensitive_data,
            decrypt_sensitive_data,
            verify_content_package,
            
            // Update Service Commands
            check_for_updates,
            download_and_install_update,
            rollback_to_backup,
            get_current_version,
            list_backups,
            
            // Settings Commands
            save_settings,
            load_settings,
            reset_settings,
            update_setting,
            
            // Legacy Database Commands
            get_database_stats,
            get_database_version
        ])
        .setup(|app| {
            println!("🎉 Tauri setup complete - Application is ready!");
            
            // Get the main window and ensure it's visible
            if let Some(window) = app.get_window("main") {
                println!("🪟 Found main window, ensuring it's visible...");
                if let Err(e) = window.show() {
                    println!("❌ Failed to show window: {}", e);
                } else {
                    println!("✅ Window shown successfully");
                }
                
                if let Err(e) = window.set_focus() {
                    println!("❌ Failed to focus window: {}", e);
                } else {
                    println!("✅ Window focused successfully");
                }
            } else {
                println!("❌ Main window not found!");
                // List all available windows
                let windows = app.windows();
                println!("Available windows: {:?}", windows.keys().collect::<Vec<_>>());
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
    println!("🏁 Application has exited");
}