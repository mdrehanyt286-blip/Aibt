export const INITIAL_FILES: Record<string, string> = {
  "/src/App.tsx": `import React, { useState } from "react";
import { Sparkles, Code, Play, Terminal, Cpu, Zap, Github, MessageSquare } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [clicks, setClicks] = useState(0);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Dynamic Header */}
      <header className="border-b border-slate-800 bg-[#0d1222]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              Sandbox Live <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">v1.0.0</span>
            </h1>
            <p className="text-xs text-slate-500">Live Browser React Sandbox Preview</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live & Synced
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-4 text-center">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Developed via DevCraft AI
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Welcome to your Live App Preview!
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
            This is the real-time compiled container representing files in your virtual explorer. Prompt DevCraft to build something awesome, like a game, drawing canvas, or stats dashboard!
          </p>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-[#0e1629] border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant Hot-Reloading</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Write JSX, standard TypeScript, functions, or layout styles in App.tsx. Any updates save, transpile, and reload instantly.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setClicks(c => c + 1)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium text-xs transition shadow-lg shadow-cyan-600/20 flex items-center gap-1.5"
              >
                Interactive Test Button
              </button>
              <span className="text-xs font-mono text-slate-500">Clicks: <span className="text-cyan-400">{clicks}</span></span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1629] border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Beautiful Tailwind Styling</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All utility definitions are fully pre-loaded. Simply draft clean responsive interfaces inside your CSS and JSX layouts directly.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">#flex</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">#grid</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">#gradients</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">#transitions</span>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="bg-[#0f1930] rounded-xl border border-blue-500/10 p-4 flex gap-3 text-xs text-slate-400">
          <Terminal className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="leading-relaxed">
            <span className="text-slate-100 font-semibold">Ready to test?</span> Give DevCraft AI directions, e.g. <span className="text-indigo-400 font-mono">"make a dark cyberpunk typing test game"</span> or <span className="text-cyan-400 font-mono">"design an animated weather map widget"</span> to see code generation in action!
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 bg-[#080c14] py-4 px-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2 mt-auto">
        <span>DevCraft Virtual Container Inc.</span>
        <span className="font-mono">Port 3000 Running inside Sandbox</span>
      </footer>
    </div>
  );
}`,
  "/src/index.css": `@import "tailwindcss";

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #0c0f1d;
  color: #f1f5f9;
}
`,
  "/README.md": `# DevCraft Sandbox UI Workspace

This is an interactive local file sandbox configured with a React, Tailwind, and Lucide Stack.

## AI Assistant features
Ask the AI model in the chat panel to:
- Generate complete functional UIs or widgets
- Re-design styles, buttons, cards or headers
- Formulate interactive data dashboards or charts
- Repair compilation bugs instantly!
`,
  "/package.json": `{
  "name": "sandbox-app",
  "private": true,
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}`
};
