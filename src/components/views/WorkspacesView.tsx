import React, { useEffect, useState } from "react";
import { FolderGit2, Plus, Trash2, Folder, ShieldCheck } from "lucide-react";
import { api, WorkspaceItem } from "../../services/api";

export const WorkspacesView: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [permissions, setPermissions] = useState("read_write");
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = async () => {
    try {
      const list = await api.getWorkspaces();
      setWorkspaces(list);
    } catch (err) {
      console.error("Failed to load workspaces", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;

    try {
      const added = await api.addWorkspace(name.trim(), path.trim(), permissions);
      setWorkspaces([added, ...workspaces]);
      setName("");
      setPath("");
      setIsAdding(false);
    } catch (err) {
      alert(`Error registering workspace: ${err}`);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this workspace?")) return;
    try {
      await api.removeWorkspace(id);
      setWorkspaces(workspaces.filter((w) => w.id !== id));
    } catch (err) {
      alert(`Error removing workspace: ${err}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 bg-slate-950/40">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Authorized Workspaces</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Avida will only inspect, edit, or execute development commands within registered directories.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? "Cancel" : "Add Workspace"}</span>
        </button>
      </div>

      {/* Add Workspace Modal / Inline Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="text-xs font-medium text-slate-200">Register New Development Workspace</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Avida Project"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Permissions</label>
              <select
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="read_write">Read & Write (Recommended)</option>
                <option value="read_only">Read Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Absolute Directory Path</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g. /home/jo/avida"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
            >
              Save to Database
            </button>
          </div>
        </form>
      )}

      {/* Workspace List */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-2">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">Loading workspaces from SQLite...</div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Folder className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No workspaces registered yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Register a directory to let Avida assist with coding.</p>
          </div>
        ) : (
          workspaces.map((ws) => (
            <div
              key={ws.id}
              className="flex items-center justify-between p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 mt-0.5">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-200 flex items-center space-x-2">
                    <span>{ws.name}</span>
                    <span className="flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{ws.permissions}</span>
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">{ws.path}</div>
                </div>
              </div>
              <button
                onClick={() => handleRemove(ws.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Remove Workspace"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

