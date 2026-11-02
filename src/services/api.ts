export interface SettingItem {
  key: string;
  value: string;
  updated_at: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  path: string;
  permissions: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogItem {
  id?: number;
  action_type: string;
  description: string;
  status: string;
  timestamp: string;
}

// Safe invoke wrapper that falls back gracefully if running in a web browser without Tauri native runtime
async function safeInvoke<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
  if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<T>(command, args);
  }

  console.warn(`[Tauri Mock] Invoke '${command}' called outside native container:`, args);

  // In-memory fallbacks for development preview
  if (command === "get_settings") {
    return [
      { key: "global_shortcut", value: "Super+Shift+A", updated_at: new Date().toISOString() },
      { key: "active_provider", value: "gemini", updated_at: new Date().toISOString() },
      { key: "theme", value: "dark", updated_at: new Date().toISOString() },
    ] as unknown as T;
  }
  if (command === "get_workspaces") {
    return [
      {
        id: "demo-ws",
        name: "Avida Core",
        path: "/home/jo/avida",
        permissions: "read_write",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as unknown as T;
  }
  if (command === "get_activity_logs") {
    return [
      {
        id: 1,
        action_type: "system_init",
        description: "Avida Desktop Foundation initialized",
        status: "success",
        timestamp: new Date().toISOString(),
      },
    ] as unknown as T;
  }
  if (command === "add_workspace") {
    return {
      id: `ws_${Date.now()}`,
      name: args.name as string,
      path: args.path as string,
      permissions: (args.permissions as string) || "read_write",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as T;
  }
  return null as unknown as T;
}

export const api = {
  getSettings: () => safeInvoke<SettingItem[]>("get_settings"),
  setSetting: (key: string, value: string) => safeInvoke<void>("set_setting", { key, value }),
  getWorkspaces: () => safeInvoke<WorkspaceItem[]>("get_workspaces"),
  addWorkspace: (name: string, path: string, permissions?: string) =>
    safeInvoke<WorkspaceItem>("add_workspace", { name, path, permissions }),
  removeWorkspace: (id: string) => safeInvoke<void>("remove_workspace", { id }),
  getActivityLogs: (limit = 50) => safeInvoke<ActivityLogItem[]>("get_activity_logs", { limit }),
  logActivity: (actionType: string, description: string, status: string) =>
    safeInvoke<void>("log_activity", { actionType, description, status }),
  toggleWindow: () => safeInvoke<void>("toggle_window"),
};

