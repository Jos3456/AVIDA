import React, { useState } from "react";
import { Send, Sparkles, Terminal, Code2, ShieldAlert } from "lucide-react";

export const AssistantView: React.FC = () => {
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // In Phase 1: show notice that Cloud AI Orchestration is hooked up in Phase 2
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40">
      {/* Messages / Welcome Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center text-center">
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Avida Personal Desktop Assistant</h2>
            <p className="text-xs text-slate-400 mt-1">
              Phase 1 Desktop Foundation is active. Local SQLite persistence, system tray, and hotkeys are running.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-left pt-2">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-medium mb-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>Hotkey Toggle</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Super+Shift+A</kbd> or click tray to show/hide.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-medium mb-1">
                <Code2 className="w-3.5 h-3.5" />
                <span>Coding Workspaces</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Register authorized folders in the <strong>Workspaces</strong> tab.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-center justify-center space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>Phase 2 (Cloud AI Engine & Streaming) will connect chat prompts to Gemini / Anthropic.</span>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command or instruction... (Esc to hide window)"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 pr-12 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

