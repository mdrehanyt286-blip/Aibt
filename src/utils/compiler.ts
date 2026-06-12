/**
 * Compiles virtual sandbox user files into a highly robust single standard HTML string
 * containing React, Tailwind CSS, and Lucide icons linked to the parent via message bridges.
 */
export function compileSandboxCode(files: Record<string, string>): string {
  const appCode = files["/src/App.tsx"] || "";
  const cssCode = files["/src/index.css"] || "";

  // Prepare standard clean code that drops ES modules imports which Babel UMD cannot evaluate
  let cleanCode = appCode;

  // Let's replace import statements so that the transpiler works directly in-browser
  cleanCode = cleanCode.replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"];?/g, (match, imports, source) => {
    // If we're importing from react or lucide-react, we map them directly to our virtual globals
    if (source === "react") {
      return `// Stripped: ${match}`;
    }
    if (source === "lucide-react") {
      // e.g. import { Sparkles } from 'lucide-react'; => const { Sparkles } = LucideReactProxy;
      const cleanImports = imports.replace(/[\{\}]/g, "").trim();
      return `const { ${cleanImports} } = LucideReactProxy;`;
    }
    if (source.startsWith(".") || source.startsWith("@/")) {
      // Try to find the file from the local file tree context
      // For simple apps, components might hold state, but let's comment them out or map them
      return `// Local Module Included: ${match}`;
    }
    return `// Stripped: ${match}`;
  });

  // Make sure we have an App component declared. If export default standard App exists, replace the export statement
  cleanCode = cleanCode.replace(/export\s+default\s+function\s+App\b/g, "function App");
  cleanCode = cleanCode.replace(/export\s+default\s+class\s+App\b/g, "class App");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevCraft Live Sandbox</title>
  
  <!-- Tailwind V4 CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React 18 CDN -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  
  <!-- Lucide Icon Library -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <!-- Babel Standalone Compiler -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    /* User Custom CSS integration */
    ${cssCode}
    
    /* Elegant and smooth scrollbars inside preview */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.3);
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.3);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.5);
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;

    // React Dynamic Proxy for Lucide Icons
    const LucideReactProxy = new Proxy({}, {
      get: (target, prop) => {
        return (props) => {
          // Converts React component CamelCase (e.g. Sparkles, TerminalWindow) to KebabCase (e.g. sparkles, terminal-window)
          const name = prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
          
          useEffect(() => {
            if (window.lucide) {
              window.lucide.createIcons();
            }
          }, [props.className, props.size, props.color]);

          return (
            <i 
              data-lucide={name} 
              className={props.className || ''} 
              style={{
                width: props.size ? props.size + 'px' : undefined,
                height: props.size ? props.size + 'px' : undefined,
                stroke: props.color || undefined,
                ...props.style
              }}
            ></i>
          );
        };
      }
    });

    // Provide standard hook and utility access
    window.React = React;
    window.useState = useState;
    window.useEffect = useEffect;
    window.useRef = useRef;
    window.useMemo = useMemo;
    window.useCallback = useCallback;
    window.LucideReactProxy = LucideReactProxy;

    // Bridge console logs to workspace console panel
    const _originalLog = console.log;
    const _originalError = console.error;
    
    console.log = (...args) => {
      _originalLog(...args);
      window.parent.postMessage({ 
        type: 'CONSOLE_LOG', 
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') 
      }, '*');
    };
    
    console.error = (...args) => {
      _originalError(...args);
      window.parent.postMessage({ 
        type: 'CONSOLE_ERROR', 
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') 
      }, '*');
    };

    // Listen to React errors at top level
    window.addEventListener('error', (event) => {
      window.parent.postMessage({ type: 'PREVIEW_ERROR', message: event.message }, '*');
    });

    try {
      // Injected code execution
      ${cleanCode}

      // Render Active Component
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      
      if (typeof App !== 'undefined') {
        root.render(<App />);
        window.parent.postMessage({ type: 'PREVIEW_SUCCESS' }, '*');
      } else {
        throw new Error("No App component declared in /src/App.tsx! Make sure to write a 'export default function App() {}'");
      }
    } catch (err) {
      console.error(err);
      window.parent.postMessage({ type: 'PREVIEW_ERROR', message: err.message }, '*');
    }
  </script>
</body>
</html>`;
}
