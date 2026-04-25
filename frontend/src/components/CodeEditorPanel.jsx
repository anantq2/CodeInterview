import Editor from "@monaco-editor/react";
import { PlayIcon, LoaderIcon, SaveIcon, WifiIcon, WifiOffIcon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../lib/constants";
import { useEffect, useRef, useState, useCallback } from "react";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onSave,
  isSaving,
  leftHeaderAction,
  // Yjs collaboration props (optional — only active in session pages)
  yjsProvider,
  yjsDoc,
  yjsAwareness,
  userName,
  userColor,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const bindingRef = useRef(null);
  const [isYjsReady, setIsYjsReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // connected, connecting, disconnected

  // Track Yjs provider connection status
  useEffect(() => {
    if (!yjsProvider) {
      setConnectionStatus("disconnected");
      return;
    }

    const handleStatus = ({ status }) => {
      setConnectionStatus(status);
    };

    yjsProvider.on("status", handleStatus);

    // Set initial status
    if (yjsProvider.wsconnected) {
      setConnectionStatus("connected");
    } else if (yjsProvider.wsconnecting) {
      setConnectionStatus("connecting");
    }

    return () => {
      yjsProvider.off("status", handleStatus);
    };
  }, [yjsProvider]);

  const handleEditorDidMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Capture Ctrl+S to save code instead of browser save dialog
      editor.addCommand(
        2048 | 49, // CtrlCmd + S
        () => {
          if (onSave) onSave();
        }
      );

      // If Yjs is available, set up the binding
      if (yjsDoc && yjsProvider) {
        setupYjsBinding(editor, monaco);
      }
    },
    [yjsDoc, yjsProvider, onSave]
  );

  // Set up or tear down Yjs binding when provider/doc changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current && yjsDoc && yjsProvider) {
      setupYjsBinding(editorRef.current, monacoRef.current);
    }

    return () => {
      cleanupYjsBinding();
    };
  }, [yjsDoc, yjsProvider, selectedLanguage]);

  const setupYjsBinding = async (editor, monaco) => {
    // Clean up existing binding first
    cleanupYjsBinding();

    try {
      // Dynamic import to avoid bundle issues when Yjs isn't used
      const { MonacoBinding } = await import("y-monaco");

      // Each language gets its own Y.Text so switching languages doesn't overwrite
      const yText = yjsDoc.getText(`code-${selectedLanguage}`);

      // Create the Monaco <-> Yjs binding
      const binding = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        yjsAwareness || yjsProvider.awareness
      );

      bindingRef.current = binding;
      setIsYjsReady(true);

      // Set awareness local state (user name + cursor color)
      const awareness = yjsAwareness || yjsProvider.awareness;
      if (awareness) {
        awareness.setLocalStateField("user", {
          name: userName || "Anonymous",
          color: userColor || "#6366f1",
          colorLight: (userColor || "#6366f1") + "40",
        });
      }
    } catch (error) {
      console.error("[Yjs] Failed to setup MonacoBinding:", error);
      setIsYjsReady(false);
    }
  };

  const cleanupYjsBinding = () => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    setIsYjsReady(false);
  };

  // Determine if we're in collaborative mode
  const isCollaborative = !!yjsProvider;

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-content/5 bg-gradient-to-r from-base-100 to-base-200/50">
        <div className="flex items-center gap-3">
          {leftHeaderAction ? <div className="shrink-0">{leftHeaderAction}</div> : null}

          {/* Language dots */}
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-error/70" />
            <div className="size-3 rounded-full bg-warning/70" />
            <div className="size-3 rounded-full bg-success/70" />
          </div>

          <select
            className="px-3 py-1.5 rounded-lg bg-base-content/5 border border-base-content/8 text-sm font-medium focus:border-primary/30 focus:ring-1 focus:ring-primary/10 outline-none transition-all"
            value={selectedLanguage}
            onChange={onLanguageChange}
            aria-label="Select programming language"
          >
            {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => (
              <option key={lang} value={lang}>
                {config.label}
              </option>
            ))}
          </select>

          {/* Collaboration status indicator */}
          {isCollaborative && (
            <div className="flex items-center gap-1.5" title={`Sync: ${connectionStatus}`}>
              {connectionStatus === "connected" ? (
                <WifiIcon className="size-3.5 text-success" />
              ) : connectionStatus === "connecting" ? (
                <LoaderIcon className="size-3.5 text-warning animate-spin" />
              ) : (
                <WifiOffIcon className="size-3.5 text-error" />
              )}
              <span className={`text-[10px] font-bold ${
                connectionStatus === "connected" ? "text-success" :
                connectionStatus === "connecting" ? "text-warning" : "text-error"
              }`}>
                {connectionStatus === "connected" ? "SYNCED" :
                 connectionStatus === "connecting" ? "SYNCING" : "OFFLINE"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Save button */}
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-base-content/60 hover:text-base-content hover:bg-base-content/5 transition-all"
              title="Save code (Ctrl+S)"
              aria-label="Save code"
            >
              {isSaving ? (
                <LoaderIcon className="size-3.5 animate-spin" />
              ) : (
                <SaveIcon className="size-3.5" />
              )}
              Save
            </button>
          )}

          <button
            onClick={onRunCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${isRunning
                ? "bg-base-content/5 text-base-content/40 cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] active:scale-[0.97]"
              }`}
            aria-label="Run code"
          >
            {isRunning ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="size-4" />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLanguage}
          theme="vs-dark"
          // When collaborative, Yjs controls the content. Otherwise, use controlled value.
          value={isCollaborative && isYjsReady ? undefined : code}
          onChange={(value) => {
            if (!isCollaborative) {
              onCodeChange(value);
            }
          }}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            lineHeight: 24,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "all",
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
            cursorBlinking: "smooth",
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditorPanel;
