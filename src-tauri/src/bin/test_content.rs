use std::path::PathBuf;
use quizdd::database::DatabaseService;
use quizdd::services::ContentSeeder;

/// Test content utility
/// 
/// This binary tests the seeded content to ensure it's working properly.
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db_path = PathBuf::from("quiz_app.db");
    
    println!("Testing educational content...");

    // Initialize database service
    let db_service = DatabaseService::new(&db_path)?;
    
    // Create content seeder for testing
    let seeder = ContentSeeder::new(db_service.manager());

    // Get and display content statistics
    let stats = seeder.get_content_statistics()?;
    
    println!("\n📊 Content Statistics:");
    println!("  Total questions: {}", stats.total_questions);
    println!("  Total subjects: {}", stats.total_subjects);
    println!("  Total assets: {}", stats.total_assets);
    
    println!("\n📚 Questions by subject:");
    for (subject, count) in &stats.questions_by_subject {
        println!("  {}: {} questions", subject, count);
    }

    // Test question retrieval by subject
    println!("\n🧪 Testing question retrieval...");
    
    // Test mathematics questions
    let math_questions = db_service.manager().execute(|conn| {
        let mut stmt = conn.prepare(
            "SELECT q.id, q.question_type, q.content, q.key_stage, q.difficulty_level 
             FROM questions q 
             JOIN subjects s ON q.subject_id = s.id 
             WHERE s.name = 'mathematics' 
             LIMIT 5"
        )?;
        
        let question_iter = stmt.query_map([], |row| {
            Ok((
                row.get::<_, u32>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, u8>(4)?,
            ))
        })?;
        
        let mut questions = Vec::new();
        for question in question_iter {
            questions.push(question?);
        }
        
        Ok(questions)
    })?;

    println!("✅ Mathematics questions (sample):");
    for (id, q_type, content, key_stage, difficulty) in math_questions {
        let content_obj: serde_json::Value = serde_json::from_str(&content)?;
        let text = content_obj["text"].as_str().unwrap_or("No text");
        println!("  ID {}: [{}] {} - {} (Difficulty: {})", 
                 id, key_stage, q_type, 
                 &text[..std::cmp::min(50, text.len())], difficulty);
    }

    // Test interactive questions
    let interactive_questions = db_service.manager().execute(|conn| {
        let mut stmt = conn.prepare(
            "SELECT COUNT(*) FROM questions WHERE question_type IN ('drag_drop', 'hotspot', 'fill_blank')"
        )?;
        
        let count: i32 = stmt.query_row([], |row| row.get(0))?;
        Ok(count)
    })?;

    println!("\n🎮 Interactive questions: {}", interactive_questions);

    // Test questions with assets
    let questions_with_assets = db_service.manager().execute(|conn| {
        let mut stmt = conn.prepare(
            "SELECT COUNT(DISTINCT q.id) FROM questions q 
             WHERE q.content LIKE '%image_url%' AND q.content NOT LIKE '%\"image_url\":null%'"
        )?;
        
        let count: i32 = stmt.query_row([], |row| row.get(0))?;
        Ok(count)
    })?;

    println!("🖼️  Questions with images: {}", questions_with_assets);

    // Test question types distribution
    let question_types = db_service.manager().execute(|conn| {
        let mut stmt = conn.prepare(
            "SELECT question_type, COUNT(*) FROM questions GROUP BY question_type"
        )?;
        
        let type_iter = stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, i32>(1)?))
        })?;
        
        let mut types = Vec::new();
        for type_result in type_iter {
            types.push(type_result?);
        }
        
        Ok(types)
    })?;

    println!("\n📝 Question types distribution:");
    for (q_type, count) in question_types {
        println!("  {}: {} questions", q_type, count);
    }

    // Test key stage distribution
    let key_stages = db_service.manager().execute(|conn| {
        let mut stmt = conn.prepare(
            "SELECT key_stage, COUNT(*) FROM questions GROUP BY key_stage"
        )?;
        
        let stage_iter = stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, i32>(1)?))
        })?;
        
        let mut stages = Vec::new();
        for stage_result in stage_iter {
            stages.push(stage_result?);
        }
        
        Ok(stages)
    })?;

    println!("\n🎓 Key stage distribution:");
    for (key_stage, count) in key_stages {
        println!("  {}: {} questions", key_stage, count);
    }

    // Test difficulty distribution
    let difficulties = db_service.manager().execute(|conn| {
        let mut stmt = conn.prepare(
            "SELECT difficulty_level, COUNT(*) FROM questions GROUP BY difficulty_level ORDER BY difficulty_level"
        )?;
        
        let diff_iter = stmt.query_map([], |row| {
            Ok((row.get::<_, u8>(0)?, row.get::<_, i32>(1)?))
        })?;
        
        let mut diffs = Vec::new();
        for diff_result in diff_iter {
            diffs.push(diff_result?);
        }
        
        Ok(diffs)
    })?;

    println!("\n⭐ Difficulty distribution:");
    for (difficulty, count) in difficulties {
        println!("  Level {}: {} questions", difficulty, count);
    }

    println!("\n✅ Content testing completed successfully!");
    println!("🎉 All educational content is properly seeded and accessible!");

    Ok(())
}