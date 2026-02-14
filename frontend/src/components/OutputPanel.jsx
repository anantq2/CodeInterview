import { CheckCircle2Icon, XCircleIcon, TerminalIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function OutputPanel({ output }) {
  const hasOutput = output !== null && output !== undefined;
  const isSuccess = hasOutput && output.success;
  const isError = hasOutput && !output.success;

  return (
    <div
      className={`h-full flex flex-col bg-base-100 transition-all duration-500 ${isSuccess ? "glow-success" : isError ? "glow-error" : ""
        }`}
      role="region"
      aria-label="Code output"
    >
      {/* Header */}
      <div className={`flex items-center gap-2.5 px-4 py-2.5 border-b transition-colors duration-500 ${isSuccess
          ? "border-success/20 bg-success/5"
          : isError
            ? "border-error/20 bg-error/5"
            : "border-base-content/5 bg-base-200/30"
        }`}>
        <TerminalIcon className="size-4 text-base-content/50" />
        <span className="text-sm font-semibold text-base-content/60">Output</span>
        {isSuccess && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full ml-auto">
            <CheckCircle2Icon className="size-3" />
            SUCCESS
          </span>
        )}
        {isError && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full ml-auto">
            <XCircleIcon className="size-3" />
            ERROR
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {!hasOutput ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              <p className="text-sm text-base-content/30 font-medium">
                Run your code to see output here...
              </p>
            </motion.div>
          ) : isSuccess ? (
            <motion.pre
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-sm text-success whitespace-pre-wrap leading-relaxed"
            >
              {output.output}
            </motion.pre>
          ) : (
            <motion.pre
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-sm text-error whitespace-pre-wrap leading-relaxed"
            >
              {output.error || "Execution failed"}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OutputPanel;
