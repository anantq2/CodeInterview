import Editor from "@monaco-editor/react";
import { PlayIcon, LoaderIcon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../lib/constants";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) {
  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-content/5 bg-gradient-to-r from-base-100 to-base-200/50">
        <div className="flex items-center gap-3">
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
        </div>

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

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLanguage}
          theme="vs-dark"
          value={code}
          onChange={(value) => onCodeChange(value)}
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
