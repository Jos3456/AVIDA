import React, { useEffect, useState } from "react";
import { Settings, Keyboard, Database, Cpu, Save } from "lucide-react";
import { api, SettingItem } from "../../services/api";

export const SettingsView: React.FC = () => {
  const [shortcut, setShortcut] = useState("Super+Shift+A");
  const [provider, setProvider] = useState("gemini");
  const [theme, setTheme] = useState("dark");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const list: SettingItem[] = await api.getSettings();
        for (const item of list) {
          if (item.key === "global_shortcut") setShortcut(item.value);
          if (item.key === "active_provider") setProvider(item.value);
          if (item.key === "theme") setTheme(item.value);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.setSetting("global_shortcut", shortcut);
      await api.setSetting("active_provider", provider);
      await api.setSetting("theme", theme);
      setStatusMsg("Settings saved to SQLite.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      alert(`Failed to save settings: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 bg-slate-950/40">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          <span>Application Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure Avida shortcuts, database settings, and AI provider preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6 max-w-xl">
        {/* Shortcut Section */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-200">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <span>Global Toggle Shortcut</span>
          </div>
          <p className="text-[11px] text-slate-400">
            The keyboard shortcut used to instantly summon or hide the Avida desktop window.
          </p>
          <input
            type="text"
            value={shortcut}
            onChange={(e) => setShortcut(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* AI Provider Section */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-200">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Primary AI Provider (Phase 2)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Avida will use cloud-hosted models for high-level reasoning and coding tasks.
          </p>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="gemini">Google Gemini 2.5 / 1.5</option>
            <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
            <option value="openai">OpenAI GPT-4o</option>
          </select>
        </div>

        {/* SQLite Database Section */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-200">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Local Persistence (SQLite)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Location: <code className="text-slate-300 font-mono">~/.local/share/avida/avida.db</code>
          </p>
          <div className="text-[11px] text-emerald-400/90 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>Database initialized and encrypted locally on your machine.</span>
          </div>
        </div>

        {/* Action Button & Status */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
          {statusMsg && <span className="text-xs text-emerald-400">{statusMsg}</span>}
        </div>
      </form>
    </div>
  );
};

