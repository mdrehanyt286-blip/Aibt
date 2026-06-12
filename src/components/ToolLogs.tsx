import React, { useState } from "react";
import { Sparkles, Terminal, FileCode, CheckCircle2, ChevronDown, ChevronUp, Play, Image, Search } from "lucide-react";

export interface ToolExecution {
  id: string;
  toolName: "view_file" | "edit_file" | "compile_applet" | "search_web" | "generate_image";
  args: Record<string, any>;
  status: "success" | "running" | "error";
  duration: string;
  outputSummary: string;
  timestamp: string;
}

interface ToolLogsProps {
  logs: ToolExecution[];
}

export default function ToolLogs({ logs }: ToolLogsProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getToolIcon = (name: string) => {
    switch (name) {
      case "view_file":
        return <FileCode className="w-4 h-4 text-cyan-400" />;
      case "edit_file":
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case "compile_applet":
        return <Play className="w-3.5 h-3.5 text-pink-400" />;
      case "search_web":
        return <Search className="w-3.5 h-3.5 text-indigo-400" />;
      case "generate_image":
        return <Image className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <span className="text-xs font-bold font-mono text-cyan-400 tracking-wider flex items-center gap-1.5 uppercase">
          <Terminal className="w-4 h-4" /> AGENTIC TOOLBOX & CALL TRACE
        </span>
        <span className="text-[10px] text-slate-500 font-mono font-semibold">
          Total Calls: {logs.length}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">
          No tool calls executed in the current session. Ask AI to edit, translate or create code!
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="rounded-xl border border-white/5 bg-[#090b14] overflow-hidden transition-all duration-200"
              >
                {/* Accordion Trigger Header */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      {getToolIcon(log.toolName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {log.toolName}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold font-mono ${
                            log.status === "success"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : log.status === "running"
                              ? "bg-amber-500/10 text-amber-400 animate-pulse"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {log.timestamp} · {log.duration}
                      </span>
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details body */}
                {isExpanded && (
                  <div className="p-3 border-t border-white/5 bg-[#07090f]/80 space-y-3">
                    {/* Tool Input Arguments */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Call Arguments
                      </div>
                      <pre className="p-2.5 rounded-lg bg-slate-950 font-mono text-[10px] text-cyan-400 overflow-x-auto">
                        {JSON.stringify(log.args, null, 2)}
                      </pre>
                    </div>

                    {/* Tool Return Output Summary */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Result Payload
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/70 text-[10px] text-slate-300 font-mono max-h-32 overflow-y-auto leading-relaxed border border-white/5">
                        {log.outputSummary}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
