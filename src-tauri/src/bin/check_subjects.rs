use std::path::Path;
use rusqlite::{Connection, Result};

fn main() -> Result<()> {
    let db_path = Path::new("quiz_app.db");
    
    if !db_path.exists() {
        println!("Database file does not exist");
        return Ok(());
    }
    
    let conn = Connection::open(db_path)?;
    
    println!("Subjects in database:");
    let mut stmt = conn.prepare("SELECT name, display_name FROM subjects ORDER BY name")?;
    let subject_iter = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;
    
    for subject in subject_iter {
        let (name, display_name) = subject?;
        println!("  {} -> {}", name, display_name);
    }
    
    Ok(())
}