import React, { useEffect, useState } from "react";
import { Activity, RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { api, ActivityLogItem } from "../../services/api";

export const ActivityView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getActivityLogs(50);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "failed":
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 bg-slate-950/40">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Activity & Execution Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of desktop actions, workspace changes, and executed commands stored locally.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Logs Table / List */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-2">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">Querying SQLite audit log...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No activity recorded yet.</p>
          </div>
        ) : (
          logs.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-start justify-between p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                <div>
                  <div className="font-medium text-slate-200">{item.description}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{item.action_type}</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 whitespace-nowrap ml-4">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

