import React, { useEffect, useState } from "react";
import { TitleBar } from "./components/TitleBar";
import { Navigation, TabType } from "./components/Navigation";
import { AssistantView } from "./components/views/AssistantView";
import { WorkspacesView } from "./components/views/WorkspacesView";
import { ActivityView } from "./components/views/ActivityView";
import { SettingsView } from "./components/views/SettingsView";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>("assistant");

  useEffect(() => {
    // Listen for tray navigation events
    let unlistenFn: (() => void) | undefined;

    const setupTrayListener = async () => {
      if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
        try {
          const { listen } = await import("@tauri-apps/api/event");
          const unlisten = await listen<string>("navigate-to", (event) => {
            if (event.payload === "assistant" || event.payload === "settings") {
              setCurrentTab(event.payload as TabType);
            }
          });
          unlistenFn = unlisten;
        } catch (err) {
          console.warn("Could not register Tauri event listener:", err);
        }
      }
    };

    setupTrayListener();

    // Listen for Escape key to quickly hide window back to tray
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
          const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
          getCurrentWebviewWindow().hide();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (unlistenFn) unlistenFn();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden border border-slate-800/80 rounded-xl shadow-2xl">
      <TitleBar />
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="flex-1 overflow-hidden flex flex-col">
        {currentTab === "assistant" && <AssistantView />}
        {currentTab === "workspaces" && <WorkspacesView />}
        {currentTab === "activity" && <ActivityView />}
        {currentTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
};

export default App;

