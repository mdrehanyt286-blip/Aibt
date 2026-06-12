export interface VirtualFile {
  name: string;
  path: string;
  content: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface TerminalLine {
  text: string;
  type: "info" | "success" | "error" | "command";
  timestamp: string;
}
