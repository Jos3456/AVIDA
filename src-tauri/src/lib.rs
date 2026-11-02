mod commands;
mod db;
mod tray;

use db::Database;
use std::str::FromStr;
use tauri::{Manager, WebviewWindow};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

fn toggle_window(window: &WebviewWindow) {
    if window.is_visible().unwrap_or(false) {
        window.hide().ok();
    } else {
        window.show().ok();
        window.set_focus().ok();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // 1. Initialize SQLite Database
            let db = Database::new().expect("Failed to initialize SQLite database");
            app.manage(db);

            // 2. Initialize System Tray
            if let Err(e) = tray::setup_tray(app.handle()) {
                eprintln!("Warning: Failed to setup system tray: {}", e);
            }

            // 3. Register Global Shortcut (Super+Shift+A, fallback Ctrl+Shift+A)
            let app_handle = app.handle().clone();
            let primary_shortcut = "Super+Shift+A";
            let fallback_shortcut = "Ctrl+Shift+A";

            let shortcut_result = Shortcut::from_str(primary_shortcut)
                .or_else(|_| Shortcut::from_str(fallback_shortcut));

            if let Ok(shortcut) = shortcut_result {
                let handler_app = app_handle.clone();
                let reg_res = app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Some(win) = handler_app.get_webview_window("main") {
                            toggle_window(&win);
                        }
                    }
                });

                if let Err(e) = reg_res {
                    eprintln!("Notice: Could not bind global shortcut ({}): {}", primary_shortcut, e);
                } else {
                    println!("Registered global shortcut: {}", primary_shortcut);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_settings,
            commands::set_setting,
            commands::get_workspaces,
            commands::add_workspace,
            commands::remove_workspace,
            commands::get_activity_logs,
            commands::log_activity,
            commands::toggle_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running avida application");
}

