pub mod connection;
pub mod migrations;

pub use connection::{DatabaseManager, DatabaseError, DatabaseResult, PoolStats};
pub use migrations::{Migration, MigrationManager};

use std::path::Path;
use std::sync::Arc;

/// Main database service that combines connection management and migrations
pub struct DatabaseService {
    manager: Arc<DatabaseManager>,
    migration_manager: MigrationManager,
}

impl DatabaseService {
    /// Create a new database service with the given database path
    pub fn new<P: AsRef<Path>>(database_path: P) -> DatabaseResult<Self> {
        let manager = Arc::new(DatabaseManager::new(database_path)?);
        let migration_manager = MigrationManager::new();
        
        Ok(Self {
            manager,
            migration_manager,
        })
    }

    /// Initialize the database by running all pending migrations
    pub fn initialize(&self) -> DatabaseResult<()> {
        self.manager.execute(|conn| {
            self.migration_manager.migrate_to_latest(conn)
                .map_err(|e| rusqlite::Error::SqliteFailure(
                    rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
                    Some(format!("Migration failed: {}", e))
                ))
        })?;
        
        Ok(())
    }

    /// Get the database manager for executing queries
    pub fn manager(&self) -> Arc<DatabaseManager> {
        Arc::clone(&self.manager)
    }

    /// Get current database version
    pub fn get_version(&self) -> DatabaseResult<u32> {
        self.manager.execute(|conn| {
            self.migration_manager.get_current_version(conn)
        })
    }

    /// Get database statistics
    pub fn get_stats(&self) -> DatabaseResult<PoolStats> {
        self.manager.get_pool_stats()
    }

    /// Close all database connections
    pub fn close(&self) -> DatabaseResult<()> {
        self.manager.close()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_database_service_initialization() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let service = DatabaseService::new(&db_path).unwrap();
        service.initialize().unwrap();
        
        // Verify that tables were created
        let manager = service.manager();
        let result = manager.execute(|conn| {
            let count: i32 = conn.query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='profiles'",
                [],
                |row| row.get(0)
            )?;
            Ok(count)
        }).unwrap();
        
        assert_eq!(result, 1);
    }

    #[test]
    fn test_database_version() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let service = DatabaseService::new(&db_path).unwrap();
        service.initialize().unwrap();
        
        let version = service.get_version().unwrap();
        assert!(version > 0);
    }
}