use rusqlite::{Connection, Result as SqlResult, OpenFlags};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::collections::VecDeque;
use std::time::{Duration, Instant};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("Connection pool exhausted")]
    PoolExhausted,
    #[error("Connection timeout")]
    Timeout,
    #[error("Database path error: {0}")]
    PathError(String),
    #[error("Migration error: {0}")]
    Migration(String),
}

pub type DatabaseResult<T> = Result<T, DatabaseError>;

#[derive(Clone)]
pub struct PooledConnection {
    connection: Arc<Mutex<Connection>>,
    created_at: Instant,
    last_used: Arc<Mutex<Instant>>,
}

impl PooledConnection {
    fn new(connection: Connection) -> Self {
        let now = Instant::now();
        Self {
            connection: Arc::new(Mutex::new(connection)),
            created_at: now,
            last_used: Arc::new(Mutex::new(now)),
        }
    }

    pub fn execute<F, R>(&self, f: F) -> DatabaseResult<R>
    where
        F: FnOnce(&Connection) -> SqlResult<R>,
    {
        let conn = self.connection.lock().map_err(|_| {
            DatabaseError::Sqlite(rusqlite::Error::SqliteFailure(
                rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_BUSY),
                Some("Connection mutex poisoned".to_string()),
            ))
        })?;

        *self.last_used.lock().unwrap() = Instant::now();
        f(&*conn).map_err(DatabaseError::from)
    }

    pub fn is_expired(&self, max_lifetime: Duration) -> bool {
        self.created_at.elapsed() > max_lifetime
    }

    pub fn is_idle(&self, max_idle: Duration) -> bool {
        self.last_used.lock().unwrap().elapsed() > max_idle
    }
}

pub struct ConnectionPool {
    database_path: PathBuf,
    pool: Arc<Mutex<VecDeque<PooledConnection>>>,
    max_connections: usize,
    max_lifetime: Duration,
    max_idle_time: Duration,
    connection_timeout: Duration,
}

impl ConnectionPool {
    pub fn new<P: AsRef<Path>>(
        database_path: P,
        max_connections: usize,
    ) -> DatabaseResult<Self> {
        let path = database_path.as_ref().to_path_buf();
        
        // Ensure the parent directory exists
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| {
                DatabaseError::PathError(format!("Failed to create database directory: {}", e))
            })?;
        }

        Ok(Self {
            database_path: path,
            pool: Arc::new(Mutex::new(VecDeque::new())),
            max_connections: max_connections.max(1),
            max_lifetime: Duration::from_secs(3600), // 1 hour
            max_idle_time: Duration::from_secs(600), // 10 minutes
            connection_timeout: Duration::from_secs(30),
        })
    }

    pub fn with_timeouts(
        mut self,
        max_lifetime: Duration,
        max_idle_time: Duration,
        connection_timeout: Duration,
    ) -> Self {
        self.max_lifetime = max_lifetime;
        self.max_idle_time = max_idle_time;
        self.connection_timeout = connection_timeout;
        self
    }

    pub fn get_connection(&self) -> DatabaseResult<PooledConnection> {
        let start_time = Instant::now();

        loop {
            // Try to get a connection from the pool
            if let Some(conn) = self.try_get_pooled_connection()? {
                return Ok(conn);
            }

            // Try to create a new connection if under limit
            if let Some(conn) = self.try_create_new_connection()? {
                return Ok(conn);
            }

            // Check timeout
            if start_time.elapsed() > self.connection_timeout {
                return Err(DatabaseError::Timeout);
            }

            // Wait a bit before retrying
            std::thread::sleep(Duration::from_millis(10));
        }
    }

    fn try_get_pooled_connection(&self) -> DatabaseResult<Option<PooledConnection>> {
        let mut pool = self.pool.lock().map_err(|_| DatabaseError::PoolExhausted)?;
        
        // Clean up expired connections
        pool.retain(|conn| !conn.is_expired(self.max_lifetime) && !conn.is_idle(self.max_idle_time));

        // Return the first available connection
        Ok(pool.pop_front())
    }

    fn try_create_new_connection(&self) -> DatabaseResult<Option<PooledConnection>> {
        let pool = self.pool.lock().map_err(|_| DatabaseError::PoolExhausted)?;
        
        if pool.len() >= self.max_connections {
            return Ok(None);
        }

        drop(pool); // Release the lock before creating connection

        let conn = self.create_connection()?;
        Ok(Some(PooledConnection::new(conn)))
    }

    fn create_connection(&self) -> DatabaseResult<Connection> {
        let flags = OpenFlags::SQLITE_OPEN_READ_WRITE 
            | OpenFlags::SQLITE_OPEN_CREATE 
            | OpenFlags::SQLITE_OPEN_NO_MUTEX;

        let conn = Connection::open_with_flags(&self.database_path, flags)?;

        // Configure connection settings for performance and safety
        conn.execute_batch("
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA cache_size = 1000;
            PRAGMA foreign_keys = ON;
            PRAGMA temp_store = MEMORY;
            PRAGMA mmap_size = 268435456;
        ")?;

        Ok(conn)
    }

    pub fn return_connection(&self, connection: PooledConnection) -> DatabaseResult<()> {
        let mut pool = self.pool.lock().map_err(|_| DatabaseError::PoolExhausted)?;
        
        if pool.len() < self.max_connections 
            && !connection.is_expired(self.max_lifetime) 
            && !connection.is_idle(self.max_idle_time) {
            pool.push_back(connection);
        }
        
        Ok(())
    }

    pub fn close_all(&self) -> DatabaseResult<()> {
        let mut pool = self.pool.lock().map_err(|_| DatabaseError::PoolExhausted)?;
        pool.clear();
        Ok(())
    }

    pub fn pool_stats(&self) -> DatabaseResult<PoolStats> {
        let pool = self.pool.lock().map_err(|_| DatabaseError::PoolExhausted)?;
        
        Ok(PoolStats {
            active_connections: pool.len(),
            max_connections: self.max_connections,
            max_lifetime_seconds: self.max_lifetime.as_secs(),
            max_idle_seconds: self.max_idle_time.as_secs(),
        })
    }
}

#[derive(Debug, Clone)]
pub struct PoolStats {
    pub active_connections: usize,
    pub max_connections: usize,
    pub max_lifetime_seconds: u64,
    pub max_idle_seconds: u64,
}

pub struct DatabaseManager {
    pool: ConnectionPool,
}

impl DatabaseManager {
    pub fn new<P: AsRef<Path>>(database_path: P) -> DatabaseResult<Self> {
        let pool = ConnectionPool::new(database_path, 10)?; // Default 10 connections
        Ok(Self { pool })
    }

    pub fn with_pool_config<P: AsRef<Path>>(
        database_path: P,
        max_connections: usize,
        max_lifetime: Duration,
        max_idle_time: Duration,
    ) -> DatabaseResult<Self> {
        let pool = ConnectionPool::new(database_path, max_connections)?
            .with_timeouts(max_lifetime, max_idle_time, Duration::from_secs(30));
        Ok(Self { pool })
    }

    pub fn execute<F, R>(&self, f: F) -> DatabaseResult<R>
    where
        F: FnOnce(&Connection) -> SqlResult<R>,
    {
        let conn = self.pool.get_connection()?;
        let result = conn.execute(f)?;
        self.pool.return_connection(conn)?;
        Ok(result)
    }

    pub fn transaction<F, R>(&self, f: F) -> DatabaseResult<R>
    where
        F: FnOnce(&rusqlite::Transaction) -> SqlResult<R>,
    {
        let conn = self.pool.get_connection()?;
        let result = conn.execute(|connection| {
            let tx = connection.unchecked_transaction()?;
            let result = f(&tx)?;
            tx.commit()?;
            Ok(result)
        })?;
        self.pool.return_connection(conn)?;
        Ok(result)
    }

    pub fn get_pool_stats(&self) -> DatabaseResult<PoolStats> {
        self.pool.pool_stats()
    }

    pub fn close(&self) -> DatabaseResult<()> {
        self.pool.close_all()
    }
}

// Convenience macro for database operations
#[macro_export]
macro_rules! db_execute {
    ($db:expr, $query:expr) => {
        $db.execute(|conn| conn.execute($query, []))
    };
    ($db:expr, $query:expr, $params:expr) => {
        $db.execute(|conn| conn.execute($query, $params))
    };
}

#[macro_export]
macro_rules! db_query_row {
    ($db:expr, $query:expr, $params:expr, $mapper:expr) => {
        $db.execute(|conn| conn.query_row($query, $params, $mapper))
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_connection_pool_creation() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let pool = ConnectionPool::new(&db_path, 5).unwrap();
        assert_eq!(pool.max_connections, 5);
    }

    #[test]
    fn test_database_manager() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let db = DatabaseManager::new(&db_path).unwrap();
        
        // Test basic operation
        let result = db.execute(|conn| {
            conn.execute("CREATE TABLE test (id INTEGER PRIMARY KEY)", [])
        });
        
        assert!(result.is_ok());
    }

    #[test]
    fn test_transaction() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let db = DatabaseManager::new(&db_path).unwrap();
        
        let result = db.transaction(|tx| {
            tx.execute("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)", [])?;
            tx.execute("INSERT INTO test (name) VALUES (?1)", ["test"])?;
            Ok(())
        });
        
        assert!(result.is_ok());
    }
}