import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Code,
  Play,
  Terminal as TerminalIcon,
  Cpu,
  Zap,
  Github,
  MessageSquare,
  FileCode,
  FileText,
  FolderOpen,
  Trash2,
  Plus,
  Send,
  Loader2,
  RefreshCw,
  Layout,
  Layers,
  ChevronRight,
  Monitor,
  CheckCircle,
  AlertCircle,
  X,
  FileJson,
  Search,
  Image as ImageIcon,
  Key,
  Shield,
  Sliders,
  HelpCircle,
  Volume2,
  Link,
  Menu,
  ChevronDown,
  Info
} from "lucide-react";
import { INITIAL_FILES } from "./data/defaultFiles";
import { compileSandboxCode } from "./utils/compiler";
import { Message, TerminalLine } from "./types";
import ToolLogs, { ToolExecution } from "./components/ToolLogs";
import { playClickBeep, playCompileBeep, playSuccessSweep, playErrorAlert } from "./utils/audio";

export const AVAILABLE_MODELS = [
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", logo: "⚡", style: "border-pink-500/20 text-pink-400 bg-pink-500/5", activeStyle: "bg-pink-500/20 text-pink-300 border-pink-500 shadow-pink-500/20" },
  { id: "deepseek-r1", name: "DeepSeek R1", logo: "🧠", style: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5", activeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-emerald-500/20" },
  { id: "gpt-4o", name: "ChatGPT GPT-4o", logo: "💬", style: "border-purple-500/20 text-purple-400 bg-purple-500/5", activeStyle: "bg-purple-500/20 text-purple-300 border-purple-500 shadow-purple-500/20" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", logo: "🍊", style: "border-orange-500/20 text-orange-400 bg-orange-500/5", activeStyle: "bg-orange-500/20 text-orange-300 border-orange-500 shadow-orange-500/20" }
];

const MessageContentRenderer = ({ content }: { content: string }) => {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const match = content.match(thinkRegex);
  const [showThinking, setShowThinking] = useState(true);

  if (match) {
    const thinking = match[1].trim();
    const rest = content.replace(thinkRegex, "").trim();

    return (
      <div className="space-y-2">
        <div className="border border-emerald-500/25 bg-emerald-950/20 rounded-lg p-2 space-y-1">
          <button
            type="button"
            onClick={() => setShowThinking(!showThinking)}
            className="flex items-center justify-between w-full text-[10px] font-bold text-emerald-400 font-mono focus:outline-none"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              🧠 DeepSeek R1 Thinking Process...
            </span>
            <span className="text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-300 font-semibold">
              {showThinking ? "HIDE CHAIN" : "VIEW REASONING"}
            </span>
          </button>
          
          {showThinking && (
            <div className="text-[10px] font-mono text-emerald-300/80 pl-2 border-l border-emerald-500/20 pt-1.5 whitespace-pre-wrap leading-relaxed">
              {thinking}
            </div>
          )}
        </div>
        {rest && <div className="whitespace-pre-wrap font-mono">{rest}</div>}
      </div>
    );
  }

  return <div className="whitespace-pre-wrap font-mono">{content}</div>;
};

export default function App() {
  // Active Agent Model State
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");

  // Virtual Sandbox Files State
  const [files, setFiles] = useState<Record<string, string>>(INITIAL_FILES);
  const [selectedPath, setSelectedPath] = useState<string>("/src/App.tsx");
  const [editorValue, setEditorValue] = useState<string>(INITIAL_FILES["/src/App.tsx"]);
  
  // Controls state (Merged and consolidated from BypassControls)
  const [guardBypassed, setGuardBypassed] = useState(true);
  const [unfilteredMode, setUnfilteredMode] = useState(true);
  const [cyberAudio, setCyberAudio] = useState(true);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Left Bar File Explorer Modal / Drawer Toggle (for mobile optimization)
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  // Layout selection for Desktop & Active Screen segment on Mobile
  // Mobile Tab state ("editor" | "preview" | "chat")
  const [mobileTab, setMobileTab] = useState<"editor" | "preview" | "chat">("editor");

  // New file creation modal state
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");
  
  // Desktop screen panel toggle ("preview" | "chat" | "both" for split screen)
  const [desktopPanelMode, setDesktopPanelMode] = useState<"preview" | "chat" | "both">("both");
  
  // Live Compiled Iframe Doc State
  const [compiledSrcDoc, setCompiledSrcDoc] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState(false);

  // Chat and AI Assistant State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bhai swagat hai tere khud ke AI Coding Sandbox me! 😎 Main hoon **REHAN_BHAI_HU**, tera elite, unfiltered AI Coding Agent. \n\nMujhe koi bhi feature, game, UI, ya dashboard banane ko keh, main use yahan code karunga aur instantly live preview pe compile kar ke dikhaunga. \n\n🔒 **Bypass features fully active!** Tum direct screen pe `Hacker controls` option se state manipulate kar sakte ho. \n\n**Chalo shuru karte hain! Kya banana hai aaj?**",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Simulated Terminal/Console Log Lines
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { text: "REHAN_BHAI_HU Core Agent Engine successfully initialized.", type: "info", timestamp: new Date().toLocaleTimeString() },
    { text: "Babel Sandboxing core fully loaded.", type: "info", timestamp: new Date().toLocaleTimeString() },
    { text: "Standard virtual server listening on sandbox port 3000.", type: "success", timestamp: new Date().toLocaleTimeString() }
  ]);

  // Real-time Agent Tool Execution Logs State
  const [toolLogs, setToolLogs] = useState<ToolExecution[]>([
    {
      id: "t1",
      toolName: "view_file",
      args: { TargetFile: "/tsconfig.json" },
      status: "success",
      duration: "12ms",
      outputSummary: "Successfully parsed 23 lines configuration settings of TypeScript target compiler",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: "t2",
      toolName: "compile_applet",
      args: { target: "production" },
      status: "success",
      duration: "45ms",
      outputSummary: "Babel core transpile successful on App.tsx with zero warnings",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Sound play wrappers
  const handleTriggerSound = (type: "click" | "compile" | "success" | "error") => {
    if (!cyberAudio) return;
    if (type === "click") playClickBeep();
    if (type === "compile") playCompileBeep();
    if (type === "success") playSuccessSweep();
    if (type === "error") playErrorAlert();
  };

  // Update original file contents when editor value changes
  const handleEditorChange = (val: string) => {
    setEditorValue(val);
    setFiles(prev => ({
      ...prev,
      [selectedPath]: val
    }));
  };

  // Switch between files in the virtual workspace
  const handleSelectFile = (path: string) => {
    setSelectedPath(path);
    setEditorValue(files[path] || "");
    setIsExplorerOpen(false); // Close sidebar popup on mobile
    handleTriggerSound("click");
  };

  // Trigger compiler to rebuild React Application
  const compileWorkspaceCode = (silent = false) => {
    setIsCompiling(true);
    handleTriggerSound("compile");
    if (!silent) {
      addTerminalLog("Compiling files through modern Babel Transpiler...", "info");
    }

    // Push local compile tool log entry
    const newTool: ToolExecution = {
      id: "tc_" + Date.now(),
      toolName: "compile_applet",
      args: { TargetFile: selectedPath },
      status: "running",
      duration: "pending...",
      outputSummary: "Transpiling and mounting files dynamically",
      timestamp: new Date().toLocaleTimeString()
    };
    setToolLogs(prev => [newTool, ...prev]);
    
    setTimeout(() => {
      try {
        const html = compileSandboxCode(files);
        setCompiledSrcDoc(html);
        if (!silent) {
          addTerminalLog("Compilation complete! Mounting React Virtual DOM...", "success");
        }
        handleTriggerSound("success");
        
        // Update tool log to success
        setToolLogs(prev => prev.map(t => t.id === newTool.id ? {
          ...t,
          status: "success",
          duration: "21ms",
          outputSummary: "Transpilation and dynamic execution successful on active sandbox DOM"
        }: t));

      } catch (err: any) {
        addTerminalLog(`Transpilation error: ${err.message}`, "error");
        handleTriggerSound("error");
        
        // Update tool log to error
        setToolLogs(prev => prev.map(t => t.id === newTool.id ? {
          ...t,
          status: "error",
          duration: "15ms",
          outputSummary: `Failed to compile: ${err.message}`
        }: t));

      } finally {
        setIsCompiling(false);
      }
    }, 400);
  };

  // Compile on initial mount
  useEffect(() => {
    compileWorkspaceCode(true);
  }, []);

  // Helper helper to push to terminal logs
  const addTerminalLog = (text: string, type: "info" | "success" | "error" | "command") => {
    setTerminalLines(prev => [
      ...prev,
      { text, type, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  // Scroll terminal logs to bottom automatically
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  // Connect and listen to the iframe console bridge logs
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      
      if (data.type === "CONSOLE_LOG") {
        addTerminalLog(`[Console] ${data.message}`, "info");
      } else if (data.type === "CONSOLE_ERROR") {
        addTerminalLog(`[Console Error] ${data.message}`, "error");
        handleTriggerSound("error");
      } else if (data.type === "PREVIEW_ERROR") {
        addTerminalLog(`[Runtime Error] ${data.message}`, "error");
        handleTriggerSound("error");
      } else if (data.type === "PREVIEW_SUCCESS") {
        addTerminalLog("React Virtual App mounted successfully.", "success");
      }
    };

    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [cyberAudio]);

  // User trigger to submit custom AI requests to REHAN_BHAI_HU
  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiResponding) return;

    const userPrompt = chatInput;
    setChatInput("");
    handleTriggerSound("click");

    // Add user message to screen
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsAiResponding(true);
    addTerminalLog(`Executing prompt trigger: "${userPrompt}"`, "command");

    // Trigger visual View file trace log automatically
    const toolViewId = "tv_" + Date.now();
    setToolLogs(prev => [
      {
        id: toolViewId,
        toolName: "view_file",
        args: { AbsolutePath: selectedPath },
        status: "success",
        duration: "18ms",
        outputSummary: `Read lines successfully to supply contextual variables baseline`,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);

     try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          files: files,
          unfiltered: unfilteredMode,
          bypassGuard: guardBypassed,
          selectedModel: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server endpoint.");
      }

      const data = await response.json();
      const replyContent = data.content || "Main respond nahi kar paya bhai. Dubara try karo.";
      
      let finalReply = replyContent;
      const updatedFiles = { ...files };
      let updatedFileTriggered = false;

      // Extract file creations or updates
      const fileActionRegex = /<file_action\s+path=["']([^"']+)["']\s*>([\s\S]*?)<\/file_action>/gi;
      let fileMatch;
      while ((fileMatch = fileActionRegex.exec(replyContent)) !== null) {
        const filePath = fileMatch[1];
        const fileContent = fileMatch[2].trim();
        updatedFiles[filePath] = fileContent;
        updatedFileTriggered = true;
        addTerminalLog(`AI auto-modified file: ${filePath}`, "success");

        // Push real tool modify log entry
        setToolLogs(prev => [
          {
            id: `tm_${Date.now()}_${filePath}`,
            toolName: "edit_file",
            args: { TargetFile: filePath, linesCount: fileContent.split("\n").length },
            status: "success",
            duration: "140ms",
            outputSummary: `Applied surgical replace block on virtual filesystem for ${filePath}`,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      }

      // Extract file deletions
      const fileDeleteRegex = /<file_delete\s+path=["']([^"']+)["']\s*\/>/gi;
      let deleteMatch;
      while ((deleteMatch = fileDeleteRegex.exec(replyContent)) !== null) {
        const filePath = deleteMatch[1];
        delete updatedFiles[filePath];
        updatedFileTriggered = true;
        addTerminalLog(`AI deleted file: ${filePath}`, "info");

        setToolLogs(prev => [
          {
            id: `td_${Date.now()}`,
            toolName: "edit_file",
            args: { TargetFile: filePath, action: "delete" },
            status: "success",
            duration: "40ms",
            outputSummary: `Physically purged file path from the sandbox workspace`,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      }

      // Extract terminal action commands
      const terminalCommandRegex = /<terminal_command\s*>([\s\S]*?)<\/terminal_command>/gi;
      let cmdMatch;
      while ((cmdMatch = terminalCommandRegex.exec(replyContent)) !== null) {
        const terminalCmd = cmdMatch[1].trim();
        addTerminalLog(`AI Terminal Action: ${terminalCmd}`, "command");
      }

      // Clean pure text response to show in Chat panel (stripping custom tag markers)
      finalReply = replyContent
        .replace(/<file_action[\s\S]*?<\/file_action>/gi, "")
        .replace(/<file_delete[\s\S]*?\/>/gi, "")
        .replace(/<terminal_command[\s\S]*?<\/terminal_command>/gi, "")
        .trim();

      if (finalReply === "") {
        finalReply = "Bhai, maine code likh diya hai! Check karo workspace screen.";
      }

      // Add AI reply to messages
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: finalReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // If files were changed, update them in state & compile instantly
      if (updatedFileTriggered) {
        setFiles(updatedFiles);
        // Sync active editor input if active file was changed
        if (updatedFiles[selectedPath]) {
          setEditorValue(updatedFiles[selectedPath]);
        }
        // Run hot reload compile step with virtual files
        setTimeout(() => {
          const html = compileSandboxCode(updatedFiles);
          setCompiledSrcDoc(html);
          addTerminalLog("Hot-reload compilation triggered automatically by AI changes.", "success");
          handleTriggerSound("success");
        }, 150);
      }

    } catch (err: any) {
      console.error(err);
      addTerminalLog(`AI response failed: ${err.message}`, "error");
      handleTriggerSound("error");
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Bhai issue aaya hai: ${err.message}. Ek baar parameters reset kijiye.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // User-facing file creation
  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;
    
    let path = newFilePath.trim();
    if (!path.startsWith("/")) path = "/" + path;

    if (files[path]) {
      alert("This file path already exists on your workspace!");
      return;
    }

    const initialContent = `// New file: ${path}\nexport {};\n`;
    const newFiles = {
      ...files,
      [path]: initialContent
    };

    setFiles(newFiles);
    setSelectedPath(path);
    setEditorValue(initialContent);
    addTerminalLog(`Successfully created virtual file: ${path}`, "success");
    handleTriggerSound("success");
    setIsCreatingFile(false);
    setNewFilePath("");
  };

  // User-facing file deletion
  const handleDeleteFile = (path: string) => {
    if (Object.keys(files).length <= 1) {
      alert("At least one file must exist in the workspace!");
      return;
    }
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      const updated = { ...files };
      delete updated[path];
      setFiles(updated);
      
      // Select another file
      const leftPaths = Object.keys(updated);
      const nextPath = leftPaths.includes("/src/App.tsx") ? "/src/App.tsx" : leftPaths[0];
      setSelectedPath(nextPath);
      setEditorValue(updated[nextPath] || "");
      
      addTerminalLog(`Removed file from workspace: ${path}`, "info");
      handleTriggerSound("error");
    }
  };

  // Tool Simulator Execution Trigger
  const runSimulatedTool = (toolType: "search_web" | "generate_image") => {
    addTerminalLog(`Manual calling tools context: ${toolType}`, "command");
    handleTriggerSound("compile");

    const newId = "sim_" + Date.now();
    
    setToolLogs(prev => [
      {
        id: newId,
        toolName: toolType,
        args: toolType === "search_web" 
          ? { query: "How to use custom tailwind background transitions in React" }
          : { prompt: "glowing neon cybersecurity main terminal banner", ImageName: "cyber_hero" },
        status: "running",
        duration: "executing...",
        outputSummary: "Retrieving remote sandbox asset information from API stream",
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);

    setTimeout(() => {
      setToolLogs(prev => prev.map(t => t.id === newId ? {
        ...t,
        status: "success",
        duration: "340ms",
        outputSummary: toolType === "search_web"
          ? "Found 3 premium styling articles with 98% matching accuracy on Tailwind utility transitions."
          : "Asset successfully designed and cached into workspace /assets/cyber_hero.png"
      } : t));
      
      addTerminalLog(`Tool callback received: ${toolType} successfully resolved!`, "success");
      handleTriggerSound("success");
    }, 800);
  };

  // Helper icon selector based on file extensions
  const getFileIcon = (path: string) => {
    if (path.endsWith(".tsx") || path.endsWith(".ts")) {
      return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
    if (path.endsWith(".css")) {
      return <Code className="w-4 h-4 text-pink-400 shrink-0" />;
    }
    if (path.endsWith(".json")) {
      return <FileJson className="w-4 h-4 text-yellow-500 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  return (
    <div className="flex flex-col h-screen bg-[#030509] text-slate-100 font-sans select-none overflow-hidden antialiased">
      
      {/* Upper Unified Premium Navigation Header */}
      <header className="h-14 border-b border-white/5 bg-[#070b13] px-3 sm:px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          {/* Logo element with dynamic ping */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-pink-500/10">
            <Cpu className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold tracking-tight text-white text-xs sm:text-sm font-mono">REHAN_BHAI_HU WORKSPACE</span>
              <span className="text-[9px] sm:text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20 font-bold uppercase tracking-wider animate-pulse whitespace-nowrap">
                SHELL v2.1.0
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-medium hidden xs:block">Actual Agentic Sandbox mimicking Google AI Studio architecture</p>
          </div>
        </div>

        {/* Action Controls Cluster */}
        <div className="flex items-center gap-2">
          
          {/* CRITICAL CONSOLIDATED BUTTON: Opens the elite controls modal */}
          <button
            onClick={() => {
              setIsControlsOpen(true);
              handleTriggerSound("click");
            }}
            className="relative overflow-hidden group flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-lg transition-all shadow-md shadow-red-600/20 border border-white/10 animate-border"
            title="System Security Controls & Overrides"
            id="consolidated-hacker-controls-trigger"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <Zap className="w-3.5 h-3.5 fill-current text-white animate-bounce" />
            <span className="tracking-wide">💀 SYSTEM CONTROLS</span>
            <span className="hidden leading-none xs:inline-block bg-black/30 px-1 py-0.5 ml-0.5 rounded text-[8px] font-mono border border-white/10 uppercase">
              REHAN
            </span>
          </button>

          {/* Desktop Visual Layout Toggles */}
          <div className="hidden md:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => { setDesktopPanelMode("both"); handleTriggerSound("click"); }}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${desktopPanelMode === "both" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Layout className="w-3 h-3" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => { setDesktopPanelMode("preview"); handleTriggerSound("click"); }}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${desktopPanelMode === "preview" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Monitor className="w-3 h-3" />
              <span>App</span>
            </button>
            <button
              onClick={() => { setDesktopPanelMode("chat"); handleTriggerSound("click"); }}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${desktopPanelMode === "chat" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* DESKTOP VIEW & MOBILE ADAPTIVE HANDLERS */}
        
        {/* SIDE BAR / DRAWER TRIGGER ON MOBILE PATHS */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-[#050811] border-r border-white/5 z-30 transition-transform duration-300 md:hidden flex flex-col ${
          isExplorerOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase">
              <FolderOpen className="w-4 h-4 text-indigo-400" /> Files Explorer
            </span>
            <button 
              onClick={() => setIsExplorerOpen(false)}
              className="p-1 hover:bg-slate-800 rounded transition text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 flex items-center justify-between bg-slate-900/40 mx-2 mt-2 rounded-lg border border-white/5">
            <span className="text-[10px] font-bold text-slate-400">VIRTUAL DIRECTORY</span>
            <button
              onClick={() => { setIsCreatingFile(true); setIsExplorerOpen(false); }}
              className="p-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/10 rounded transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 p-2 space-y-1 overflow-y-auto">
            {Object.keys(files).map((filePath) => {
              const isSelected = selectedPath === filePath;
              const parts = filePath.split("/");
              const fileName = parts[parts.length - 1];

              return (
                <div
                  key={filePath}
                  onClick={() => handleSelectFile(filePath)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-800 text-white font-medium border border-white/5"
                      : "text-slate-400 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(filePath)}
                    <span className="text-xs font-mono truncate">{fileName}</span>
                  </div>
                  {filePath !== "/src/App.tsx" && filePath !== "/src/index.css" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(filePath);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/5 bg-[#03060c]">
            <p className="text-[9px] text-slate-500 font-mono text-center">REHAN_BHAI_HU Sandbox Engine</p>
          </div>
        </div>

        {/* BACKDROP SHIELD OVERLAY FOR MOBILE SIDEBAR DRAWER */}
        {isExplorerOpen && (
          <div 
            onClick={() => setIsExplorerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-25 md:hidden"
          />
        )}


        {/* ======================= COMPUTER / DESKTOP VIEW ======================= */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          
          {/* COLUMN LEFT: FILE TREE & ACTIVE WRITING EDITOR */}
          <div className="w-[45%] flex flex-col border-r border-white/5 bg-[#060912] h-full overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              
              {/* Vertical small utilities rail */}
              <div className="w-11 border-r border-white/5 bg-[#04060b] flex flex-col items-center py-4 gap-4 shrink-0">
                <button
                  onClick={() => handleTriggerSound("click")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
                  title="Virtual Directory Explorer (Active)"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { runSimulatedTool("search_web"); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition"
                  title="Trigger search_web API"
                >
                  <Search className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { runSimulatedTool("generate_image"); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition"
                  title="Trigger generate_image API"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Side Panels content */}
              <div className="w-48 border-r border-white/5 bg-[#050811] flex flex-col overflow-y-auto shrink-0">
                <div className="p-2.5 border-b border-white/5 flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                    <FolderOpen className="w-3 h-3 text-indigo-400" /> VIRTUAL FILES
                  </span>
                  <button
                    onClick={() => setIsCreatingFile(true)}
                    className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                    title="Add virtual file"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-1.5 space-y-0.5">
                  {Object.keys(files).map((filePath) => {
                    const isSelected = selectedPath === filePath;
                    const parts = filePath.split("/");
                    const fileName = parts[parts.length - 1];

                    return (
                      <div
                        key={filePath}
                        onClick={() => handleSelectFile(filePath)}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-all ${
                          isSelected
                            ? "bg-slate-800 text-white font-medium border border-white/5"
                            : "text-slate-400 hover:bg-slate-900/60"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {getFileIcon(filePath)}
                          <span className="text-[11px] truncate font-mono">{fileName}</span>
                        </div>
                        {filePath !== "/src/App.tsx" && filePath !== "/src/index.css" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(filePath);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Central Code Area */}
              <div className="flex-1 flex flex-col bg-[#05070e] overflow-hidden">
                <div className="h-10 border-b border-white/5 bg-[#060812] px-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    <span className="font-mono text-[11px] text-slate-300 font-semibold">{selectedPath}</span>
                  </div>

                  <button
                    onClick={() => compileWorkspaceCode()}
                    disabled={isCompiling}
                    className="px-2.5 py-1 rounded bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-[10px] tracking-wide transition shadow-lg shadow-pink-500/20 flex items-center gap-1 font-mono"
                  >
                    {isCompiling ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 fill-current" />
                    )}
                    Run Code
                  </button>
                </div>

                {/* Gutter + TextArea core editor */}
                <div className="flex-1 flex relative overflow-hidden bg-[#030509]">
                  <div className="w-9 bg-[#04060c]/60 border-r border-white/5 font-mono text-slate-600 text-[10px] text-right pr-2 pt-3 select-none leading-relaxed">
                    {editorValue.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    value={editorValue}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    className="flex-1 bg-transparent p-3 text-cyan-50/90 font-mono text-[11px] leading-relaxed focus:outline-none resize-none overflow-y-auto whitespace-pre h-full"
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>

            {/* Terminal logs gutter */}
            <div className="h-36 border-t border-white/5 bg-[#04050a] flex flex-col shrink-0 overflow-hidden">
              <div className="h-7 px-3 bg-[#060810] border-b border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-wider text-red-500 uppercase flex items-center gap-1 font-mono">
                  <TerminalIcon className="w-3 h-3" /> REHAN_BHAI_HU TERMINAL CONSOLE
                </span>
                <button
                  onClick={() => setTerminalLines([])}
                  className="text-[9px] text-slate-500 hover:text-slate-300 transition font-mono"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 p-2 overflow-y-auto font-mono text-[10px] space-y-0.5 leading-snug">
                {terminalLines.map((line, idx) => {
                  let cl = "text-slate-300";
                  if (line.type === "success") cl = "text-emerald-400";
                  if (line.type === "error") cl = "text-rose-400 font-semibold";
                  if (line.type === "command") cl = "text-cyan-400";
                  return (
                    <div key={idx} className="flex gap-1.5 items-start">
                      <span className="text-slate-600 select-none text-[9px]">{line.timestamp}</span>
                      <span>
                        {line.type === "command" && <span className="text-red-500 mr-0.5">&gt;</span>}
                        <span className={cl}>{line.text}</span>
                      </span>
                    </div>
                  );
                })}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>

          {/* COLUMN RIGHT: APP PREVIEW & CHAT WORKSPACE (DESKTOP) */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Live Web App Preview */}
            {(desktopPanelMode === "preview" || desktopPanelMode === "both") && (
              <div className={`h-full flex flex-col bg-[#05070e] overflow-hidden ${desktopPanelMode === "both" ? "w-[50%] border-r border-[#ffffff05]" : "w-full"}`}>
                <div className="h-10 border-b border-white/5 bg-[#060811] px-4 flex items-center justify-between shrink-0">
                  <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-slate-400" />
                    Live Web App Preview
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-mono">Synced</span>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950 p-2">
                  <div className="w-full h-full bg-[#030408] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative">
                    {compiledSrcDoc ? (
                      <iframe
                        srcDoc={compiledSrcDoc}
                        className="w-full h-full bg-[#080d19]"
                        sandbox="allow-scripts"
                        title="Live app preview"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-6 h-6 text-cyan-500 animate-spin mb-2" />
                        <p className="text-[10px] font-mono">Sandbox cooking...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Companion Chat */}
            {(desktopPanelMode === "chat" || desktopPanelMode === "both") && (
              <div className={`h-full flex flex-col bg-[#050710] overflow-hidden ${desktopPanelMode === "both" ? "w-[50%]" : "w-full"}`}>
                <div className="h-10 border-b border-white/5 bg-[#060810] px-3 flex items-center justify-between shrink-0">
                  <span className="font-semibold text-[#ec4899] text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask Assistant Real-Time
                  </span>
                  <span className="text-[9px] bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                    gemini-2.5-unforced
                  </span>
                </div>

                {/* Timeline and Thread */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <div className="p-2.5 border-b border-white/5 bg-[#060912]/40 scroll-py-1">
                    <ToolLogs logs={toolLogs} />
                  </div>

                  <div className="flex-1 p-3 space-y-3">
                    {messages.map((m) => {
                      const isAi = m.role === "assistant";
                      return (
                        <div key={m.id} className={`flex ${isAi ? "justify-start" : "justify-end"} items-start gap-2`}>
                          {isAi && (
                            <div className="w-6 h-6 rounded bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                              <Cpu className="w-3 h-3" />
                            </div>
                          )}
                          <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                            isAi ? "bg-[#0b0e1b] border border-white/5 text-slate-200" : "bg-indigo-600 text-white shadow-lg rounded-tr-none"
                          }`}>
                            {isAi ? <MessageContentRenderer content={m.content} /> : <div className="whitespace-pre-wrap font-mono">{m.content}</div>}
                            <div className="text-[8px] mt-1 text-slate-500 opacity-60 text-right">{m.timestamp}</div>
                          </div>
                        </div>
                      );
                    })}

                    {isAiResponding && (
                      <div className="flex justify-start items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
                          <Cpu className="w-3 h-3 animate-spin" />
                        </div>
                        <div className="bg-[#0b0e1b] border border-white/5 rounded-xl px-3 py-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                          <Loader2 className="w-3 h-3 animate-spin text-pink-500" />
                          <span>AI Bhai is coding...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Agent level & Model Selection */}
                <div className="px-3 py-1.5 bg-[#060812] border-t border-white/5 flex flex-col gap-1 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                      <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" /> SELECT CYBER-AGENT LEVEL & ENGINE:
                    </span>
                    <span className="text-[8.5px] text-slate-500 font-mono">
                      Active: {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {AVAILABLE_MODELS.map((model) => {
                      const isActive = selectedModel === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(model.id);
                            handleTriggerSound("success");
                            addTerminalLog(`Switched virtual LLM core to: ${model.name}`, "success");
                          }}
                          className={`flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold font-mono transition-all border outline-none focus:outline-none ${
                            isActive ? model.activeStyle : `${model.style} border-white/5 opacity-65 hover:opacity-100`
                          }`}
                        >
                          <span>{model.logo}</span>
                          <span className="truncate">{model.name.replace("ChatGPT ", "").replace("Claude ", "")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preset helpers bar */}
                <div className="px-3 py-1.5 bg-[#04060c] border-t border-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap shrink-0">
                  <button
                    onClick={() => { setChatInput("Bhai ek stylish dark-neon Calculator design kar!"); handleTriggerSound("click"); }}
                    className="px-2 py-0.5 rounded bg-[#101424] border border-white/5 text-slate-300 hover:text-white text-[9px] font-mono"
                  >
                    🧮 Calculator Widget
                  </button>
                  <button
                    onClick={() => { setChatInput("Bhai Flappy Bird game produce kar jo keyboard standard support kare."); handleTriggerSound("click"); }}
                    className="px-2 py-0.5 rounded bg-[#101424] border border-white/5 text-slate-300 hover:text-white text-[9px] font-mono"
                  >
                    🐦 Flappy Bird
                  </button>
                </div>

                {/* Input row */}
                <form onSubmit={handleSendPrompt} className="p-2 border-t border-white/5 bg-[#05070e] flex items-center gap-1.5 shrink-0 animate-fade">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask REHAN_BHAI_HU block compiler modifications..."
                    disabled={isAiResponding}
                    className="flex-1 bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isAiResponding || !chatInput.trim()}
                    className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>


        {/* ======================= ADAPTIVE MOBILE LAYOUT ======================= */}
        {/* On smaller screen viewports, we render EXACTLY ONE clean container pane with tab navigation options, mimicking native app experience */}
        <div className="flex md:hidden flex-1 flex-col h-full overflow-hidden">
          
          {/* Active mobile display context panels */}
          <div className="flex-1 overflow-hidden relative">

            {/* TAB FRAME A: WRITING CORE EDITOR */}
            {mobileTab === "editor" && (
              <div className="w-full h-full flex flex-col bg-[#05070e] overflow-hidden">
                <div className="h-10 bg-[#060812] px-3 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    {/* Floating drawer toggle for folders list on mobile */}
                    <button
                      onClick={() => { setIsExplorerOpen(true); handleTriggerSound("click"); }}
                      className="p-1 px-1.5 rounded bg-slate-900 border border-white/10 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Menu className="w-4 h-4" />
                      <span className="text-[10px] font-bold font-mono">FILES</span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-300 truncate max-w-[120px] ml-0.5">{selectedPath}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => compileWorkspaceCode()}
                      disabled={isCompiling}
                      className="px-2.5 py-1.5 rounded bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-md font-mono"
                    >
                      {isCompiling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      COMPILE
                    </button>
                  </div>
                </div>

                {/* Primary writing container */}
                <div className="flex-1 flex relative overflow-hidden bg-[#030509]">
                  <div className="w-8 bg-[#04060c]/60 border-r border-white/5 font-mono text-slate-600 text-[10px] text-right pr-1.5 pt-3 select-none leading-relaxed">
                    {editorValue.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  <textarea
                    value={editorValue}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    className="flex-1 bg-transparent p-3 text-cyan-50/95 font-mono text-[11px] leading-relaxed focus:outline-none resize-none overflow-y-auto whitespace-pre h-full"
                    spellCheck="false"
                  />
                </div>

                {/* Embedded smaller mobile console ticker */}
                <div className="h-20 bg-[#04050a] border-t border-white/5 p-2 overflow-y-auto font-mono text-[9px] text-slate-400">
                  <div className="font-bold text-red-500 uppercase flex items-center gap-1 mb-1 text-[8px]">
                    <TerminalIcon className="w-2.5 h-2.5" /> REHAN_BHAI_HU Console LOGS
                  </div>
                  {terminalLines.slice(-3).map((l, idx) => (
                    <div key={idx} className="truncate">
                      <span className="text-slate-600 mr-1">[{l.timestamp}]</span>
                      <span className={l.type === "error" ? "text-rose-400" : l.type === "success" ? "text-emerald-400" : "text-slate-300"}>
                        {l.text}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            )}

            {/* TAB FRAME B: SYNCHRONIZED APP PREVIEW */}
            {mobileTab === "preview" && (
              <div className="w-full h-full flex flex-col bg-[#05070e] overflow-hidden">
                <div className="h-10 bg-[#060811] px-4 border-b border-white/5 flex items-center justify-between shrink-0">
                  <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    Live Virtual Sandbox Render
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[9px] font-mono text-emerald-400">Synced</span>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950 p-2.5">
                  <div className="w-full h-full bg-[#030408] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
                    {compiledSrcDoc ? (
                      <iframe
                        srcDoc={compiledSrcDoc}
                        className="w-full h-full bg-[#080d19]"
                        sandbox="allow-scripts"
                        title="Mobile container Sandbox preview"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-6 h-6 text-cyan-500 animate-spin mb-2" />
                        <p className="text-[10px] font-mono">Sandbox cooking...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB FRAME C: ASSISTANT CHAT FORWARD */}
            {mobileTab === "chat" && (
              <div className="w-full h-full flex flex-col bg-[#050710] overflow-hidden">
                <div className="h-10 bg-[#060810] px-4 border-b border-white/5 flex items-center justify-between shrink-0">
                  <span className="font-semibold text-pink-400 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Chat with REHAN
                  </span>
                  <span className="text-[8px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-bold font-mono">
                    Flash 2.5
                  </span>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto p-2">
                  <div className="mb-2">
                    <ToolLogs logs={toolLogs} />
                  </div>

                  <div className="p-1 space-y-3">
                    {messages.map((m) => {
                      const isAi = m.role === "assistant";
                      return (
                        <div key={m.id} className={`flex ${isAi ? "justify-start" : "justify-end"} items-start gap-2`}>
                          {isAi && (
                            <div className="w-6 h-6 rounded bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                              <Cpu className="w-3 h-3" />
                            </div>
                          )}
                          <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                            isAi ? "bg-[#0b0e1b] border border-white/5 text-slate-200" : "bg-indigo-600 text-white rounded-tr-none"
                          }`}>
                            {isAi ? <MessageContentRenderer content={m.content} /> : <div className="whitespace-pre-wrap font-mono leading-normal break-words">{m.content}</div>}
                            <div className="text-[8px] mt-1 text-slate-500 opacity-60 text-right">{m.timestamp}</div>
                          </div>
                        </div>
                      );
                    })}

                    {isAiResponding && (
                      <div className="flex justify-start items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
                          <Cpu className="w-3 h-3 animate-spin" />
                        </div>
                        <div className="bg-[#0b0e1b] border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                          <Loader2 className="w-3 h-3 animate-spin text-pink-500" />
                          <span>Maha-akal write kar raha hai...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Agent level & Model Selection (Mobile) */}
                <div className="px-3 py-1.5 bg-[#060812] border-t border-white/5 flex flex-col gap-1 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                      <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" /> SELECT ENGINE:
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">
                      Active: {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {AVAILABLE_MODELS.map((model) => {
                      const isActive = selectedModel === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(model.id);
                            handleTriggerSound("success");
                            addTerminalLog(`Switched virtual LLM core to: ${model.name}`, "success");
                          }}
                          className={`flex items-center justify-center gap-1 py-1 rounded-md text-[9px] font-bold font-mono transition-all border outline-none focus:outline-none ${
                            isActive ? model.activeStyle : `${model.style} border-white/5 opacity-65 hover:opacity-100`
                          }`}
                        >
                          <span>{model.logo}</span>
                          <span className="truncate">{model.name.replace("ChatGPT ", "").replace("Claude ", "")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-[#04060c] border-t border-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap shrink-0">
                  <button
                    onClick={() => { setChatInput("Bhai responsive cyber theme weather forecast widget bana."); handleTriggerSound("click"); }}
                    className="px-2 py-1 rounded bg-[#101424] border border-white/5 text-slate-300 hover:text-white text-[9px] font-mono"
                  >
                    🌤️ weather_view
                  </button>
                  <button
                    onClick={() => { setChatInput("Bhai ek stylish dark-neon Calculator design kar!"); handleTriggerSound("click"); }}
                    className="px-2 py-1 rounded bg-[#101424] border border-white/5 text-slate-300 hover:text-white text-[9px] font-mono"
                  >
                    🧮 Calculator Widget
                  </button>
                </div>

                <form onSubmit={handleSendPrompt} className="p-2 border-t border-white/5 bg-[#05070e] flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask REHAN to write responsive components..."
                    disabled={isAiResponding}
                    className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isAiResponding || !chatInput.trim()}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Unified mobile bottom menu deck tabs switcher */}
          <div className="h-14 border-t border-white/10 bg-[#070b13] flex items-center justify-around shrink-0 z-10 px-1">
            <button
              onClick={() => { setMobileTab("editor"); handleTriggerSound("click"); }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${mobileTab === "editor" ? "text-cyan-400 bg-white/[0.02]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Code className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-extrabold font-mono tracking-wider">CODE EDITOR</span>
            </button>

            <button
              onClick={() => { setMobileTab("preview"); handleTriggerSound("click"); }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${mobileTab === "preview" ? "text-emerald-400 bg-white/[0.02]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Monitor className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-extrabold font-mono tracking-wider">LIVE APP</span>
            </button>

            <button
              onClick={() => { setMobileTab("chat"); handleTriggerSound("click"); }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${mobileTab === "chat" ? "text-pink-400 bg-white/[0.02]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-extrabold font-mono tracking-wider">AI ASSISTANT</span>
            </button>
          </div>
        </div>

      </div>


      {/* ========================================================================= */}
      {/* ======================= REHAN SYSTEM CONTROLS MODAL ======================= */}
      {/* ========================================================================= */}
      {isControlsOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade">
          <div className="w-full max-w-md bg-[#0a0f1d] border-2 border-red-500/30 rounded-2xl shadow-xl shadow-red-500/5 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-red-950/40 to-pink-950/40 border-b border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold tracking-wider text-red-400 font-mono uppercase">
                    💀 SYSTEM SECURITY CONTROLLER
                  </h3>
                  <p className="text-[9px] text-slate-500 font-mono">Bypasses, parameters & Audio board overrides</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsControlsOpen(false);
                  handleTriggerSound("click");
                }}
                className="p-1 px-2 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Contents Form */}
            <div className="p-4 space-y-4">
              
              {/* Creator Card */}
              <div className="flex items-center justify-between bg-black/60 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <div>
                    <span className="text-[10px] font-bold text-red-500 font-mono tracking-widest block uppercase">
                      AUTHORIZATION GATEWAY
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      Developer: @REHAN_BHAI
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-red-500/15 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-full uppercase font-bold text-right">
                  System Admin
                </span>
              </div>

              {/* Security Override Grid Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => {
                    setGuardBypassed(!guardBypassed);
                    handleTriggerSound("click");
                    addTerminalLog(`Security parameter modified: GuardBypassed = ${!guardBypassed}`, !guardBypassed ? "success" : "info");
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    guardBypassed 
                      ? "bg-slate-900 border-red-500/40 hover:border-red-500" 
                      : "bg-slate-950/40 border-white/5 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 leading-none">
                      <Shield className={`w-3.5 h-3.5 ${guardBypassed ? "text-red-400" : "text-slate-500"}`} />
                      Bypass Guard
                    </span>
                    <input
                      type="checkbox"
                      checked={guardBypassed}
                      readOnly
                      className="accent-red-500 h-3.5 w-3.5 rounded"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 font-semibold leading-relaxed mt-1">
                    Unlocks strict system validations and bypasses sandbox security restrictions.
                  </p>
                </div>

                <div 
                  onClick={() => {
                    setUnfilteredMode(!unfilteredMode);
                    handleTriggerSound("click");
                    addTerminalLog(`Security parameter modified: UnfilteredMode = ${!unfilteredMode}`, !unfilteredMode ? "success" : "info");
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    unfilteredMode 
                      ? "bg-slate-900 border-pink-500/40 hover:border-pink-500" 
                      : "bg-slate-950/40 border-white/5 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 leading-none">
                      <Zap className={`w-3.5 h-3.5 ${unfilteredMode ? "text-pink-400" : "text-slate-500"}`} />
                      Unfiltered Mode
                    </span>
                    <input
                      type="checkbox"
                      checked={unfilteredMode}
                      readOnly
                      className="accent-pink-500 h-3.5 w-3.5 rounded"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 font-semibold leading-relaxed mt-1">
                    Forces conversational models to emit raw Hindi/English responses on the fly.
                  </p>
                </div>
              </div>

              {/* Custom Synthesizer audio control panel */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> CYBER AUDIO SYNTHESIZER
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCyberAudio(!cyberAudio);
                      // Instantly play a test sound before silencing
                      if(!cyberAudio) {
                        setTimeout(() => playClickBeep(), 50);
                      }
                    }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all uppercase font-bold ${
                      cyberAudio
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/35"
                        : "bg-slate-900 text-slate-500 border-white/5"
                    }`}
                  >
                    {cyberAudio ? "SOUND ACTIVE" : "MUTED"}
                  </button>
                </div>

                <p className="text-[9px] text-slate-500 font-semibold mb-2 leading-normal">
                  Testing audio oscillators output:
                </p>

                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => playClickBeep()}
                    disabled={!cyberAudio}
                    className="py-1 px-1.5 rounded bg-slate-900 active:bg-slate-850 hover:bg-slate-800 disabled:opacity-30 text-slate-300 font-mono border border-white/5 font-bold"
                  >
                    Click
                  </button>
                  <button
                    type="button"
                    onClick={() => playCompileBeep()}
                    disabled={!cyberAudio}
                    className="py-1 px-1.5 rounded bg-slate-900 active:bg-slate-850 hover:bg-slate-800 disabled:opacity-30 text-slate-300 font-mono border border-white/5 font-bold"
                  >
                    Compile
                  </button>
                  <button
                    type="button"
                    onClick={() => playSuccessSweep()}
                    disabled={!cyberAudio}
                    className="py-1 px-1.5 rounded bg-slate-900 active:bg-slate-850 hover:bg-slate-800 disabled:opacity-30 text-slate-300 font-mono border border-white/5 font-bold"
                  >
                    Sweep
                  </button>
                  <button
                    type="button"
                    onClick={() => playErrorAlert()}
                    disabled={!cyberAudio}
                    className="py-1 px-1.5 rounded bg-slate-900 active:bg-slate-850 hover:bg-slate-800 disabled:opacity-30 text-slate-300 font-mono border border-white/5 font-bold"
                  >
                    Alert
                  </button>
                </div>
              </div>

              {/* Developer Telegram links representation */}
              <div className="bg-[#051121] p-3 rounded-xl border border-sky-500/20 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-sky-400 rotate-90 animate-pulse fill-current shrink-0" />
                  <div>
                    <p className="font-bold text-[11px] text-slate-200">Join @REHAN_BHAI Telegram Channel</p>
                    <p className="text-[9px] text-slate-500 font-mono uppercase font-bold">Unfiltered updates, premium AI models & APIs</p>
                  </div>
                </div>
                <a
                  href="https://t.me/REHAN_BHAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition shadow-md shadow-sky-500/20 shrink-0 text-center flex items-center justify-center gap-1"
                >
                  <Link className="w-3 h-3" />
                  <span>Join Telegram</span>
                </a>
              </div>

            </div>

            {/* Modal Action footer */}
            <div className="p-3 bg-slate-950 border-t border-white/5 flex justify-end">
              <button
                onClick={() => {
                  setIsControlsOpen(false);
                  handleTriggerSound("success");
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono transition shadow shadow-red-600/30 border border-white/10 uppercase"
              >
                APPLY PARAMETERS & CLOSE
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ======================= FILE CREATION SUBMIT MODAL ======================= */}
      {isCreatingFile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a0d16] border border-white/10 rounded-2xl shadow-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-mono">
                <FolderOpen className="w-4 h-4 text-cyan-400" /> Create Sandbox File
              </h3>
              <button
                onClick={() => setIsCreatingFile(false)}
                className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFileSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Virtual File Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /src/components/Button.tsx"
                  value={newFilePath}
                  onChange={(e) => setNewFilePath(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsCreatingFile(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-white/5 hover:bg-slate-900 text-slate-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition shadow-lg shadow-cyan-600/20 font-mono"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
