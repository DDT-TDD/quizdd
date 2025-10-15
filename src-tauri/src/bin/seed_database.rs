use std::path::PathBuf;
use quizdd::database::DatabaseService;
use quizdd::services::ContentSeeder;

/// Database seeding utility
/// 
/// This binary can be run to populate the database with initial educational content.
/// Usage: cargo run --bin seed_database [database_path]
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Get database path from command line argument or use default
    let args: Vec<String> = std::env::args().collect();
    let db_path = if args.len() > 1 {
        PathBuf::from(&args[1])
    } else {
        // Use the same path as the main app
        let app_data_dir = std::env::var("APPDATA")
            .or_else(|_| std::env::var("HOME").map(|h| format!("{}/.local/share", h)))
            .unwrap_or_else(|_| ".".to_string());
        let app_data_path = PathBuf::from(app_data_dir).join("Educational Quiz App");
        
        // Ensure directory exists
        std::fs::create_dir_all(&app_data_path)?;
        
        app_data_path.join("educational_quiz_app.db")
    };

    println!("Initializing database at: {:?}", db_path);

    // Initialize database service
    let db_service = DatabaseService::new(&db_path)?;
    db_service.initialize()?;

    println!("Database initialized successfully!");

    // Create content seeder
    let seeder = ContentSeeder::new(db_service.manager());

    // Seed content (will check for missing subjects if content exists)
    println!("Seeding database with educational content...");
    seeder.seed_if_empty()?;

    // Display final statistics
    let stats = seeder.get_content_statistics()?;
    println!("\n✅ Database seeding completed successfully!");
    println!("Final content statistics:");
    println!("  Total questions: {}", stats.total_questions);
    println!("  Total subjects: {}", stats.total_subjects);
    println!("  Total assets: {}", stats.total_assets);
    
    println!("\nQuestions by subject:");
    for (subject, count) in &stats.questions_by_subject {
        println!("  {}: {} questions", subject, count);
    }

    println!("\n🎉 Your educational quiz database is ready to use!");

    Ok(())
}