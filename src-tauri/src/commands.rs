use crate::db::{ActivityLogItem, Database, SettingItem, WorkspaceItem};
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn get_settings(db: State<'_, Database>) -> Result<Vec<SettingItem>, String> {
    db.get_settings().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_setting(key: String, value: String, db: State<'_, Database>) -> Result<(), String> {
    db.set_setting(&key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_workspaces(db: State<'_, Database>) -> Result<Vec<WorkspaceItem>, String> {
    db.get_workspaces().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_workspace(
    name: String,
    path: String,
    permissions: Option<String>,
    db: State<'_, Database>,
) -> Result<WorkspaceItem, String> {
    let perms = permissions.unwrap_or_else(|| "read_write".to_string());
    let ws = db.add_workspace(&name, &path, &perms).map_err(|e| e.to_string())?;
    db.log_activity("workspace_added", &format!("Registered workspace: {}", name), "success").ok();
    Ok(ws)
}

#[tauri::command]
pub fn remove_workspace(id: String, db: State<'_, Database>) -> Result<(), String> {
    db.remove_workspace(&id).map_err(|e| e.to_string())?;
    db.log_activity("workspace_removed", &format!("Removed workspace ID: {}", id), "success").ok();
    Ok(())
}

#[tauri::command]
pub fn get_activity_logs(
    limit: Option<i64>,
    db: State<'_, Database>,
) -> Result<Vec<ActivityLogItem>, String> {
    let lim = limit.unwrap_or(50);
    db.get_activity_logs(lim).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn log_activity(
    action_type: String,
    description: String,
    status: String,
    db: State<'_, Database>,
) -> Result<(), String> {
    db.log_activity(&action_type, &description, &status)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn toggle_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().map_err(|e| e.to_string())?;
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

