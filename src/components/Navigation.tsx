import React from "react";
import { MessageSquare, FolderGit2, Activity, Settings } from "lucide-react";

export type TabType = "assistant" | "workspaces" | "activity" | "settings";

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: "assistant" as TabType, label: "Assistant", icon: MessageSquare },
    { id: "workspaces" as TabType, label: "Workspaces", icon: FolderGit2 },
    { id: "activity" as TabType, label: "Activity", icon: Activity },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 pt-1 space-x-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-all duration-150 ${
              isActive
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

