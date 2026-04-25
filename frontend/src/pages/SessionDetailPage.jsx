import { useParams, useNavigate } from "react-router";
import { useSessionDetails } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";
import Editor from "@monaco-editor/react";
import { LANGUAGE_CONFIG } from "../lib/constants";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ClockIcon,
  Code2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  UsersIcon,
  Loader2Icon,
  TerminalIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { useState } from "react";

function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useSessionDetails(id);
  const [selectedSnapshotIdx, setSelectedSnapshotIdx] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2Icon className="size-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !data?.session) {
    return (
      <div className="min-h-screen animated-gradient-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <AlertTriangleIcon className="size-12 text-error mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Session Not Found</h2>
            <p className="text-base-content/60 mb-6">This session doesn't exist or you don't have access.</p>
            <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const session = data.session;
  const problemData = session.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const difficulty = typeof session.difficulty === "string" ? session.difficulty : "easy";
  const difficultyLabel = `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`;

  const durationMinutes = session.startedAt && session.endedAt
    ? differenceInMinutes(new Date(session.endedAt), new Date(session.startedAt))
    : null;

  const snapshots = session.codeSnapshots || [];
  const execResults = session.executionResults || [];
  const currentSnapshot = snapshots[selectedSnapshotIdx];

  const languageForEditor = currentSnapshot?.language
    ? LANGUAGE_CONFIG[currentSnapshot.language]?.monacoLanguage || "javascript"
    : "javascript";

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back button + title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-ghost btn-sm gap-2 mb-4"
          >
            <ArrowLeftIcon className="size-4" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-3xl font-black text-base-content">
                  {session.problem}
                </h1>
                <span className={`badge badge-sm ${getDifficultyBadgeClass(difficulty)}`}>
                  {difficultyLabel}
                </span>
                <span className="badge badge-ghost badge-sm">Completed</span>
              </div>
              {problemData?.category && (
                <p className="text-base-content/50 text-sm">{problemData.category}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card rounded-xl p-4 gradient-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <ClockIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50 font-medium">Duration</p>
                <p className="text-lg font-bold">
                  {durationMinutes !== null ? `${durationMinutes} min` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 gradient-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                <UsersIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50 font-medium">Participants</p>
                <p className="text-lg font-bold">{session.participant ? 2 : 1}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 gradient-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center">
                <Code2Icon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50 font-medium">Code Saves</p>
                <p className="text-lg font-bold">{snapshots.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 gradient-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
                <TerminalIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-base-content/50 font-medium">Runs</p>
                <p className="text-lg font-bold">{execResults.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Participants */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl gradient-border p-6 mb-8"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <UsersIcon className="size-5 text-primary" />
            Participants
          </h2>
          <div className="flex gap-6">
            {session.host && (
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={session.host.profileImage || `https://ui-avatars.com/api/?name=${session.host.name}`}
                      alt={session.host.name}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm">{session.host.name}</p>
                  <p className="text-xs text-base-content/50">Host</p>
                </div>
              </div>
            )}
            {session.participant && (
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                    <img
                      src={session.participant.profileImage || `https://ui-avatars.com/api/?name=${session.participant.name}`}
                      alt={session.participant.name}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm">{session.participant.name}</p>
                  <p className="text-xs text-base-content/50">Participant</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Code Snapshots */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl gradient-border mb-8"
        >
          <div className="p-6 border-b border-base-content/5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Code2Icon className="size-5 text-secondary" />
              Saved Code
            </h2>
          </div>

          {snapshots.length > 0 ? (
            <>
              {/* Snapshot selector tabs */}
              {snapshots.length > 1 && (
                <div className="flex gap-2 px-6 pt-4">
                  {snapshots.map((snap, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSnapshotIdx(idx)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        idx === selectedSnapshotIdx
                          ? "bg-primary text-primary-content"
                          : "bg-base-content/5 text-base-content/60 hover:bg-base-content/10"
                      }`}
                    >
                      {snap.userId?.name || `User ${idx + 1}`} • {snap.language}
                    </button>
                  ))}
                </div>
              )}

              {/* Code viewer */}
              <div className="p-6">
                <div className="rounded-xl overflow-hidden border border-base-content/10">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-base-300/50 border-b border-base-content/5">
                    <div className="flex gap-1.5">
                      <div className="size-3 rounded-full bg-error/70" />
                      <div className="size-3 rounded-full bg-warning/70" />
                      <div className="size-3 rounded-full bg-success/70" />
                    </div>
                    <span className="text-xs font-medium text-base-content/50 ml-2">
                      {currentSnapshot?.language || "javascript"} • Saved{" "}
                      {currentSnapshot?.savedAt
                        ? formatDistanceToNow(new Date(currentSnapshot.savedAt), { addSuffix: true })
                        : ""}
                    </span>
                  </div>
                  <Editor
                    height="400px"
                    language={languageForEditor}
                    theme="vs-dark"
                    value={currentSnapshot?.code || "// No code saved"}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 22,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      scrollBeyondLastLine: false,
                      padding: { top: 12, bottom: 12 },
                      renderLineHighlight: "none",
                      domReadOnly: true,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Code2Icon className="size-10 text-base-content/20 mx-auto mb-3" />
              <p className="text-sm text-base-content/40">No code was saved for this session</p>
            </div>
          )}
        </motion.div>

        {/* Execution History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl gradient-border mb-8"
        >
          <div className="p-6 border-b border-base-content/5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TerminalIcon className="size-5 text-accent" />
              Execution History
            </h2>
          </div>

          {execResults.length > 0 ? (
            <div className="divide-y divide-base-content/5">
              {execResults.map((result, idx) => (
                <div key={idx} className="p-4 px-6 flex items-start gap-4">
                  <div className="mt-0.5">
                    {result.success ? (
                      <CheckCircle2Icon className="size-5 text-success" />
                    ) : (
                      <XCircleIcon className="size-5 text-error" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-base-content/60">
                        {result.userId?.name || "User"}
                      </span>
                      <span className="badge badge-xs">{result.language}</span>
                      <span className="text-[10px] text-base-content/40 ml-auto">
                        {result.executedAt
                          ? formatDistanceToNow(new Date(result.executedAt), { addSuffix: true })
                          : ""}
                      </span>
                    </div>
                    <pre className={`text-xs font-mono p-2 rounded-lg max-h-20 overflow-auto ${
                      result.success ? "bg-success/5 text-success" : "bg-error/5 text-error"
                    }`}>
                      {result.output || (result.success ? "Success" : "Error")}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <TerminalIcon className="size-10 text-base-content/20 mx-auto mb-3" />
              <p className="text-sm text-base-content/40">No code was executed during this session</p>
            </div>
          )}
        </motion.div>

        {/* Session metadata footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-base-content/30 pb-8"
        >
          Session created{" "}
          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
          {session.endedAt && (
            <> • Ended {formatDistanceToNow(new Date(session.endedAt), { addSuffix: true })}</>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default SessionDetailPage;
