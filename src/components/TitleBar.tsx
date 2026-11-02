import React, { useEffect, useState } from "react";
import { Minus, Square, X, Wifi, WifiOff } from "lucide-react";

export const TitleBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleMinimize = async () => {
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      getCurrentWebviewWindow().minimize();
    }
  };

  const handleMaximize = async () => {
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      getCurrentWebviewWindow().toggleMaximize();
    }
  };

  const handleClose = async () => {
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      // Phase 1 spec: Close hides window so tray keeps running
      getCurrentWebviewWindow().hide();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-slate-900/80 backdrop-blur border-b border-slate-800/80 flex items-center justify-between px-3 select-none flex-shrink-0"
    >
      {/* Brand / Logo */}
      <div className="flex items-center space-x-2.5 pointer-events-none">
        <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
          A
        </div>
        <span className="font-semibold text-sm tracking-wide text-slate-200">Avida</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-400 font-medium border border-indigo-800/50">
          v0.1
        </span>
      </div>

      {/* Center Status indicator */}
      <div className="flex items-center space-x-2 pointer-events-none">
        <div
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
            isOnline
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
              : "bg-amber-950/40 text-amber-400 border-amber-800/40"
          }`}
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="text-[11px]">{isOnline ? "Online (Cloud AI Ready)" : "Offline Mode"}</span>
        </div>
      </div>

      {/* Window Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleMinimize}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
          title="Hide to Tray"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

