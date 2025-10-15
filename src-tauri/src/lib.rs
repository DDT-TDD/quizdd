pub mod database;
pub mod models;
pub mod services;
pub mod errors;

pub use database::{DatabaseService, DatabaseManager, DatabaseError, DatabaseResult};
pub use models::*;
pub use services::*;
pub use errors::{AppError, AppResult};

// Re-export commonly used types
pub use rusqlite;
pub use serde::{Deserialize, Serialize};
pub use chrono::{DateTime, Utc};