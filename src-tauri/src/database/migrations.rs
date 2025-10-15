use rusqlite::{Connection, Result as SqlResult};
use std::collections::HashMap;

pub struct Migration {
    pub version: u32,
    pub description: String,
    pub up_sql: String,
    pub down_sql: Option<String>,
}

pub struct MigrationManager {
    migrations: HashMap<u32, Migration>,
}

impl MigrationManager {
    pub fn new() -> Self {
        let mut manager = Self {
            migrations: HashMap::new(),
        };
        manager.register_migrations();
        manager
    }

    fn register_migrations(&mut self) {
        // Migration 1: Initial schema
        self.add_migration(Migration {
            version: 1,
            description: "Initial database schema".to_string(),
            up_sql: include_str!("schema.sql").to_string(),
            down_sql: Some(self.get_drop_all_tables_sql()),
        });

        // Migration 2: Add new subjects (Times Tables and Flags & Capitals)
        self.add_migration(Migration {
            version: 2,
            description: "Add Times Tables and Flags & Capitals subjects".to_string(),
            up_sql: "INSERT OR IGNORE INTO subjects (name, display_name, icon_path, color_scheme, description) VALUES
                ('times_tables', 'Times Tables', 'icons/times-tables.svg', '#E91E63', 'Multiplication tables and mental arithmetic practice'),
                ('flags_capitals', 'Flags & Capitals', 'icons/flags.svg', '#00BCD4', 'World flags, capital cities, and country knowledge');".to_string(),
            down_sql: Some("DELETE FROM subjects WHERE name IN ('times_tables', 'flags_capitals');".to_string()),
        });
    }

    fn add_migration(&mut self, migration: Migration) {
        self.migrations.insert(migration.version, migration);
    }

    pub fn initialize_database(&self, conn: &Connection) -> SqlResult<()> {
        // Create migrations table if it doesn't exist
        conn.execute(
            "CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                description TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        Ok(())
    }

    pub fn get_current_version(&self, conn: &Connection) -> SqlResult<u32> {
        let version: Result<u32, _> = conn.query_row(
            "SELECT MAX(version) FROM schema_migrations",
            [],
            |row| row.get(0),
        );

        match version {
            Ok(v) => Ok(v),
            Err(_) => Ok(0), // No migrations applied yet
        }
    }

    pub fn migrate_to_latest(&self, conn: &Connection) -> SqlResult<()> {
        self.initialize_database(conn)?;
        let current_version = self.get_current_version(conn)?;
        let latest_version = self.get_latest_version();

        if current_version >= latest_version {
            return Ok(()); // Already up to date
        }

        // Apply migrations in order
        for version in (current_version + 1)..=latest_version {
            if let Some(migration) = self.migrations.get(&version) {
                self.apply_migration(conn, migration)?;
            }
        }

        Ok(())
    }

    pub fn migrate_to_version(&self, conn: &Connection, target_version: u32) -> SqlResult<()> {
        self.initialize_database(conn)?;
        let current_version = self.get_current_version(conn)?;

        if current_version == target_version {
            return Ok(()); // Already at target version
        }

        if current_version < target_version {
            // Migrate up
            for version in (current_version + 1)..=target_version {
                if let Some(migration) = self.migrations.get(&version) {
                    self.apply_migration(conn, migration)?;
                }
            }
        } else {
            // Migrate down
            for version in ((target_version + 1)..=current_version).rev() {
                if let Some(migration) = self.migrations.get(&version) {
                    self.rollback_migration(conn, migration)?;
                }
            }
        }

        Ok(())
    }

    fn apply_migration(&self, conn: &Connection, migration: &Migration) -> SqlResult<()> {
        let tx = conn.unchecked_transaction()?;

        // Execute the migration SQL
        tx.execute_batch(&migration.up_sql)?;

        // Record the migration
        tx.execute(
            "INSERT INTO schema_migrations (version, description) VALUES (?1, ?2)",
            [&migration.version.to_string(), &migration.description],
        )?;

        tx.commit()?;
        Ok(())
    }

    fn rollback_migration(&self, conn: &Connection, migration: &Migration) -> SqlResult<()> {
        if let Some(down_sql) = &migration.down_sql {
            let tx = conn.unchecked_transaction()?;

            // Execute the rollback SQL
            tx.execute_batch(down_sql)?;

            // Remove the migration record
            tx.execute(
                "DELETE FROM schema_migrations WHERE version = ?1",
                [&migration.version.to_string()],
            )?;

            tx.commit()?;
        }
        Ok(())
    }

    fn get_latest_version(&self) -> u32 {
        self.migrations.keys().max().copied().unwrap_or(0)
    }

    pub fn get_applied_migrations(&self, conn: &Connection) -> SqlResult<Vec<(u32, String)>> {
        let mut stmt = conn.prepare(
            "SELECT version, description FROM schema_migrations ORDER BY version"
        )?;

        let migration_iter = stmt.query_map([], |row| {
            Ok((row.get::<_, u32>(0)?, row.get::<_, String>(1)?))
        })?;

        let mut migrations = Vec::new();
        for migration in migration_iter {
            migrations.push(migration?);
        }

        Ok(migrations)
    }

    pub fn get_pending_migrations(&self, conn: &Connection) -> SqlResult<Vec<u32>> {
        let current_version = self.get_current_version(conn)?;
        let latest_version = self.get_latest_version();

        let pending: Vec<u32> = ((current_version + 1)..=latest_version).collect();
        Ok(pending)
    }

    fn get_drop_all_tables_sql(&self) -> String {
        "
        DROP TABLE IF EXISTS question_attempts;
        DROP TABLE IF EXISTS quiz_sessions;
        DROP TABLE IF EXISTS custom_mixes;
        DROP TABLE IF EXISTS assets;
        DROP TABLE IF EXISTS questions;
        DROP TABLE IF EXISTS subjects;
        DROP TABLE IF EXISTS progress;
        DROP TABLE IF EXISTS profiles;
        ".to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;

    #[test]
    fn test_migration_manager_creation() {
        let manager = MigrationManager::new();
        assert!(!manager.migrations.is_empty());
    }

    #[test]
    fn test_database_initialization() {
        let conn = Connection::open_in_memory().unwrap();
        let manager = MigrationManager::new();
        
        manager.initialize_database(&conn).unwrap();
        
        // Check that migrations table exists
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='schema_migrations'",
            [],
            |row| row.get(0)
        ).unwrap();
        
        assert_eq!(count, 1);
    }

    #[test]
    fn test_migration_to_latest() {
        let conn = Connection::open_in_memory().unwrap();
        let manager = MigrationManager::new();
        
        manager.migrate_to_latest(&conn).unwrap();
        
        // Check that all tables exist
        let tables = ["profiles", "progress", "subjects", "questions", "assets", "custom_mixes", "quiz_sessions"];
        for table in &tables {
            let count: i32 = conn.query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?1",
                [table],
                |row| row.get(0)
            ).unwrap();
            assert_eq!(count, 1, "Table {} should exist", table);
        }
    }
}