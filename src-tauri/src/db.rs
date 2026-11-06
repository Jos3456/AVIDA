use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SettingItem {
    pub key: String,
    pub value: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkspaceItem {
    pub id: String,
    pub name: String,
    pub path: String,
    pub permissions: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActivityLogItem {
    pub id: Option<i64>,
    pub action_type: String,
    pub description: String,
    pub status: String,
    pub timestamp: String,
}

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new() -> Result<Self> {
        let db_path = get_database_path();
        if let Some(parent) = db_path.parent() {
            fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.init_tables()?;
        Ok(db)
    }

    #[cfg(test)]
    pub fn new_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                path TEXT NOT NULL UNIQUE,
                permissions TEXT NOT NULL DEFAULT 'read_write',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                provider TEXT NOT NULL DEFAULT 'gemini',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_type TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );
            ",
        )?;

        // Seed default settings if not exists
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)",
            params!["global_shortcut", "Super+Shift+A", &now],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)",
            params!["active_provider", "gemini", &now],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)",
            params!["theme", "dark", &now],
        )?;

        Ok(())
    }

    pub fn get_settings(&self) -> Result<Vec<SettingItem>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT key, value, updated_at FROM settings")?;
        let rows = stmt.query_map([], |row| {
            Ok(SettingItem {
                key: row.get(0)?,
                value: row.get(1)?,
                updated_at: row.get(2)?,
            })
        })?;

        let mut settings = Vec::new();
        for item in rows {
            settings.push(item?);
        }
        Ok(settings)
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3",
            params![key, value, now],
        )?;
        Ok(())
    }

    pub fn get_workspaces(&self) -> Result<Vec<WorkspaceItem>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, path, permissions, created_at, updated_at FROM workspaces ORDER BY created_at DESC",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(WorkspaceItem {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                permissions: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })?;

        let mut list = Vec::new();
        for item in rows {
            list.push(item?);
        }
        Ok(list)
    }

    pub fn add_workspace(
        &self,
        name: &str,
        path: &str,
        permissions: &str,
    ) -> Result<WorkspaceItem> {
        let conn = self.conn.lock().unwrap();
        let id = format!("ws_{}", chrono::Utc::now().timestamp_millis());
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO workspaces (id, name, path, permissions, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
            params![id, name, path, permissions, now],
        )?;

        Ok(WorkspaceItem {
            id,
            name: name.to_string(),
            path: path.to_string(),
            permissions: permissions.to_string(),
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub fn remove_workspace(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM workspaces WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn log_activity(
        &self,
        action_type: &str,
        description: &str,
        status: &str,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO activity_logs (action_type, description, status, timestamp)
             VALUES (?1, ?2, ?3, ?4)",
            params![action_type, description, status, now],
        )?;
        Ok(())
    }

    pub fn get_activity_logs(&self, limit: i64) -> Result<Vec<ActivityLogItem>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, action_type, description, status, timestamp FROM activity_logs ORDER BY id DESC LIMIT ?1",
        )?;
        let rows = stmt.query_map(params![limit], |row| {
            Ok(ActivityLogItem {
                id: Some(row.get(0)?),
                action_type: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                timestamp: row.get(4)?,
            })
        })?;

        let mut logs = Vec::new();
        for item in rows {
            logs.push(item?);
        }
        Ok(logs)
    }
}

pub fn get_database_path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("avida")
        .join("avida.db")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_db_init_and_defaults() {
        let db = Database::new_in_memory().expect("failed to init in-memory db");
        let settings = db.get_settings().expect("failed to get settings");
        assert!(settings.iter().any(|s| s.key == "global_shortcut" && s.value == "Super+Shift+A"));
        assert!(settings.iter().any(|s| s.key == "active_provider" && s.value == "gemini"));
    }

    #[test]
    fn test_workspace_crud() {
        let db = Database::new_in_memory().expect("failed to init db");
        let ws = db.add_workspace("Avida Core", "/home/jo/avida", "read_write").expect("failed to add ws");
        assert_eq!(ws.name, "Avida Core");
        assert_eq!(ws.path, "/home/jo/avida");

        let list = db.get_workspaces().expect("failed to list ws");
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, ws.id);

        db.remove_workspace(&ws.id).expect("failed to remove ws");
        let list_after = db.get_workspaces().expect("failed to list ws");
        assert_eq!(list_after.len(), 0);
    }

    #[test]
    fn test_activity_logging() {
        let db = Database::new_in_memory().expect("failed to init db");
        db.log_activity("command_run", "ls -la", "success").expect("failed to log");
        db.log_activity("command_run", "cargo build", "pending").expect("failed to log");

        let logs = db.get_activity_logs(10).expect("failed to get logs");
        assert_eq!(logs.len(), 2);
        assert_eq!(logs[0].description, "cargo build");
        assert_eq!(logs[1].description, "ls -la");
    }
}

