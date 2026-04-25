import { useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById, useSaveCodeSnapshot, useSaveExecutionResult } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/codeExecution";
import Navbar from "../components/Navbar";
import JoinByCodeModal from "../components/JoinByCodeModal";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  CheckIcon,
  Loader2Icon,
  LockIcon,
  LogOutIcon,
  PhoneOffIcon,
  Share2Icon,
  ShieldAlertIcon,
  KeyRoundIcon,
  SaveIcon,
  VideoIcon,
} from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

// Yjs for real-time code collaboration
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isQuestionCollapsed, setIsQuestionCollapsed] = useState(false);
  const questionPanelRef = useRef(null);
  const editorPanelRef = useRef(null);
  const outputPanelRef = useRef(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [joinVideo, setJoinVideo] = useState(false);

  // Yjs state for real-time collaboration
  const yjsDocRef = useRef(null);
  const yjsProviderRef = useRef(null);
  const [yjsDoc, setYjsDoc] = useState(null);
  const [yjsProvider, setYjsProvider] = useState(null);

  const { data: sessionData, isLoading: loadingSession, error: sessionError, refetch } = useSessionById(id);

  // Detect 403 (private session, user not authorized yet)
  const isPrivateError = sessionError?.response?.status === 403;

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();
  const saveCodeMutation = useSaveCodeSnapshot();
  const saveExecutionMutation = useSaveExecutionResult();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant,
    joinVideo
  );

  // Find the problem data based on the session problem title.
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  // Use a ref to always have latest code for interval-based auto-save
  const codeRef = useRef(code);
  const languageRef = useRef(selectedLanguage);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);
  useEffect(() => {
    languageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // Auto-join session if user is not already a participant and not the host.
  // Skip auto-join for private sessions — they require an invite code.
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    if (session.isPrivate) return; // private sessions need invite code

    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  // Redirect the participant when session ends.
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // Update starter code when problem or language changes (only when NOT using Yjs)
  useEffect(() => {
    if (yjsDoc) return; // In collaborative mode, Yjs manages the content
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage, yjsDoc]);

  // ===== INITIALIZE Yjs PROVIDER FOR REAL-TIME SYNC =====
  useEffect(() => {
    if (!session?.callId) return;
    if (!isHost && !isParticipant) return;
    if (session.status !== "active") return;

    // Build WebSocket URL pointing to the backend
    const apiUrl = import.meta.env.VITE_API_URL || "";
    // Convert http(s)://... to ws(s)://... and append /yjs
    const wsBaseUrl = apiUrl
      .replace(/^https:/, "wss:")
      .replace(/^http:/, "ws:")
      .replace(/\/api$/, ""); // Remove /api suffix if present
    
    const wsUrl = `${wsBaseUrl}/yjs`;

    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      wsUrl,
      session.callId, // room name = callId
      doc,
      { connect: true }
    );

    // Set initial content for the language if the Y.Text is empty
    const yText = doc.getText(`code-${selectedLanguage}`);
    if (yText.length === 0 && problemData?.starterCode?.[selectedLanguage]) {
      yText.insert(0, problemData.starterCode[selectedLanguage]);
    }

    // Observe text changes to keep local code state in sync (for auto-save & code execution)
    const updateLocalCode = () => {
      const currentYText = doc.getText(`code-${languageRef.current}`);
      const textContent = currentYText.toString();
      setCode(textContent);
      codeRef.current = textContent;
    };

    doc.on("update", updateLocalCode);

    yjsDocRef.current = doc;
    yjsProviderRef.current = provider;
    setYjsDoc(doc);
    setYjsProvider(provider);

    console.log(`[Yjs] Connected to room: ${session.callId}`);

    return () => {
      doc.off("update", updateLocalCode);
      provider.disconnect();
      provider.destroy();
      doc.destroy();
      yjsDocRef.current = null;
      yjsProviderRef.current = null;
      setYjsDoc(null);
      setYjsProvider(null);
      console.log(`[Yjs] Disconnected from room: ${session.callId}`);
    };
  }, [session?.callId, session?.status, isHost, isParticipant]);

  // ===== AUTO-SAVE CODE EVERY 30 SECONDS =====
  useEffect(() => {
    if (!session || session.status !== "active") return;
    if (!isHost && !isParticipant) return;

    const interval = setInterval(() => {
      const currentCode = codeRef.current;
      const currentLang = languageRef.current;
      if (currentCode && currentCode.trim()) {
        saveCodeMutation.mutate(
          { id, language: currentLang, code: currentCode },
          { onSuccess: () => setLastSaved(new Date()) }
        );
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [session?._id, session?.status, isHost, isParticipant, id]);

  // Save code on page unload (best effort)
  useEffect(() => {
    if (!session || session.status !== "active") return;
    if (!isHost && !isParticipant) return;

    const handleBeforeUnload = () => {
      const currentCode = codeRef.current;
      const currentLang = languageRef.current;
      if (currentCode && currentCode.trim()) {
        // Use sendBeacon for reliable delivery on page close
        const apiUrl = import.meta.env.VITE_API_URL || "";
        navigator.sendBeacon(
          `${apiUrl}/api/sessions/${id}/save-code`,
          new Blob(
            [JSON.stringify({ language: currentLang, code: currentCode })],
            { type: "application/json" }
          )
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session?._id, session?.status, isHost, isParticipant, id]);

  const handleManualSave = useCallback(() => {
    if (!code || !code.trim()) return;
    saveCodeMutation.mutate(
      { id, language: selectedLanguage, code },
      { onSuccess: () => setLastSaved(new Date()) }
    );
  }, [id, selectedLanguage, code]);

  const handleLanguageChange = (e) => {
    // Save current code before switching
    if (code && code.trim()) {
      saveCodeMutation.mutate({ id, language: selectedLanguage, code });
    }

    const newLang = e.target.value;
    setSelectedLanguage(newLang);

    if (yjsDoc) {
      // In Yjs mode: initialize Y.Text for new language if empty
      const yText = yjsDoc.getText(`code-${newLang}`);
      if (yText.length === 0 && problemData?.starterCode?.[newLang]) {
        yText.insert(0, problemData.starterCode[newLang]);
      }
      // Local code will update via the Yjs observer
    } else {
      const starterCode = problemData?.starterCode?.[newLang] || "";
      setCode(starterCode);
    }

    setOutput(null);
  };

  const handleRunCode = async () => {
    // Bring output panel up on every run so result is immediately visible.
    const targetOutputSize = 40;
    outputPanelRef.current?.resize?.(targetOutputSize);
    editorPanelRef.current?.resize?.(100 - targetOutputSize);

    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    // Save execution result to session
    if (session?.status === "active") {
      saveExecutionMutation.mutate({
        id,
        language: selectedLanguage,
        code,
        output: result.output || result.error || "",
        success: !!result.success,
      });
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // Save final code snapshot along with end request
      const codeSnapshots = code && code.trim()
        ? [{ language: selectedLanguage, code }]
        : [];

      endSessionMutation.mutate(
        { id, codeSnapshots },
        { onSuccess: () => navigate("/dashboard") }
      );
    }
  };

  const toggleQuestionPanel = () => {
    if (!questionPanelRef.current) return;

    if (isQuestionCollapsed) {
      questionPanelRef.current.expand();
      return;
    }

    questionPanelRef.current.collapse();
  };

  const difficulty = typeof session?.difficulty === "string" ? session.difficulty : "easy";
  const difficultyLabel = `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`;

  // If user hits a private session URL without being a participant, show invite code prompt
  if (isPrivateError) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="size-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlertIcon className="size-10 text-warning" />
            </div>
            <h1 className="text-3xl font-bold text-base-content mb-3">Private Session</h1>
            <p className="text-base-content/60 mb-8">
              This session is private. Enter the invite code shared by the host to join.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn btn-warning gap-2"
              >
                <KeyRoundIcon className="size-4" />
                Enter Invite Code
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-ghost"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <JoinByCodeModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-h-0 min-w-0">
          <PanelGroup direction="horizontal" className="h-full">
          {/* LEFT PANEL - QUESTION (COLLAPSIBLE) */}
          <Panel
            ref={questionPanelRef}
            defaultSize={28}
            minSize={20}
            collapsible
            collapsedSize={0}
            onCollapse={() => setIsQuestionCollapsed(true)}
            onExpand={() => setIsQuestionCollapsed(false)}
            className="min-w-0"
          >
            <div className="h-full overflow-y-auto bg-base-200 border-r border-base-300">
              <div className="p-5 bg-base-100 border-b border-base-300">
                {/* Title + badges row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-base-content">
                        {session?.problem || "Loading..."}
                      </h1>
                      <span className={`badge badge-sm ${getDifficultyBadgeClass(difficulty)}`}>
                        {difficultyLabel}
                      </span>
                      {session?.isPrivate && (
                        <span className="badge badge-warning badge-sm gap-0.5">
                          <LockIcon className="size-2.5" />
                          Private
                        </span>
                      )}
                    </div>
                    {problemData?.category && (
                      <p className="text-base-content/60 text-sm mt-1">{problemData.category}</p>
                    )}
                    <p className="text-base-content/60 text-sm mt-1">
                      Host: {session?.host?.name || "Loading..."} | {session?.participant ? 2 : 1}/2 participants
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isHost && session?.status === "active" && (
                      <button
                        onClick={handleEndSession}
                        disabled={endSessionMutation.isPending}
                        className="btn btn-error btn-sm gap-1"
                      >
                        {endSessionMutation.isPending ? (
                          <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LogOutIcon className="w-3.5 h-3.5" />
                        )}
                        End
                      </button>
                    )}
                    {session?.status === "completed" && (
                      <span className="badge badge-ghost badge-sm">Completed</span>
                    )}
                  </div>
                </div>

                {/* Share row — compact, below title */}
                {isHost && session?.status === "active" && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-base-content/5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="btn btn-xs btn-outline btn-primary gap-1"
                    >
                      {copiedLink ? <CheckIcon className="size-3" /> : <Share2Icon className="size-3" />}
                      {copiedLink ? "Copied!" : "Share Link"}
                    </button>
                    {session?.isPrivate && session?.inviteCode && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(session.inviteCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="btn btn-xs btn-outline btn-warning gap-1"
                      >
                        {copiedCode ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                        {copiedCode ? "Copied!" : `Code: ${session.inviteCode}`}
                      </button>
                    )}

                    {/* Auto-save indicator */}
                    <div className="ml-auto flex items-center gap-1.5 text-[10px] text-base-content/40">
                      {saveCodeMutation.isPending ? (
                        <>
                          <Loader2Icon className="size-3 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : lastSaved ? (
                        <>
                          <SaveIcon className="size-3 text-success/60" />
                          <span>Saved</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-5">
                {problemData?.description && (
                  <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                    <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
                    <div className="space-y-3 text-base leading-relaxed">
                      <p className="text-base-content/90">{problemData.description.text}</p>
                      {problemData.description.notes?.map((note, idx) => (
                        <p key={idx} className="text-base-content/90">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {problemData?.examples && problemData.examples.length > 0 && (
                  <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                    <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
                    <div className="space-y-4">
                      {problemData.examples.map((example, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge badge-sm">{idx + 1}</span>
                            <p className="font-semibold text-base-content">Example {idx + 1}</p>
                          </div>
                          <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                            <div className="flex gap-2">
                              <span className="text-primary font-bold min-w-[70px]">Input:</span>
                              <span>{example.input}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-secondary font-bold min-w-[70px]">Output:</span>
                              <span>{example.output}</span>
                            </div>
                            {example.explanation && (
                              <div className="pt-2 border-t border-base-300 mt-2">
                                <span className="text-base-content/60 font-sans text-xs">
                                  <span className="font-semibold">Explanation:</span>{" "}
                                  {example.explanation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {problemData?.constraints && problemData.constraints.length > 0 && (
                  <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                    <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
                    <ul className="space-y-2 text-base-content/90">
                      {problemData.constraints.map((constraint, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary">*</span>
                          <code className="text-sm">{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-base-300/80 hover:bg-primary transition-colors cursor-col-resize" />

          {/* MIDDLE PANEL - CODE */}
          <Panel defaultSize={72} minSize={30} className="min-w-0">
            <PanelGroup direction="vertical" className="h-full bg-base-100">
              <Panel ref={editorPanelRef} defaultSize={74} minSize={35}>
                <div className="h-full min-h-0">
                  <CodeEditorPanel
                    selectedLanguage={selectedLanguage}
                    code={code}
                    isRunning={isRunning}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={(value) => setCode(value)}
                    onRunCode={handleRunCode}
                    onSave={handleManualSave}
                    isSaving={saveCodeMutation.isPending}
                    // Yjs real-time collaboration props
                    yjsProvider={yjsProvider}
                    yjsDoc={yjsDoc}
                    yjsAwareness={yjsProvider?.awareness}
                    userName={user?.fullName || user?.firstName || "Anonymous"}
                    userColor={isHost ? "#6366f1" : "#f59e0b"}
                    leftHeaderAction={
                      <button
                        type="button"
                        onClick={toggleQuestionPanel}
                        className={`btn btn-sm rounded-full px-3 border ${
                          isQuestionCollapsed
                            ? "bg-primary text-primary-content border-primary/40 hover:bg-primary/90"
                            : "bg-base-100/95 text-base-content border-base-300 hover:bg-base-200"
                        }`}
                        aria-label={
                          isQuestionCollapsed ? "Open question panel" : "Collapse question panel"
                        }
                        title={isQuestionCollapsed ? "Open Question Panel" : "Collapse Question Panel"}
                      >
                        {isQuestionCollapsed ? (
                          <ChevronRightIcon className="w-4 h-4" />
                        ) : (
                          <ChevronLeftIcon className="w-4 h-4" />
                        )}
                        <span className="text-xs font-semibold">
                          {isQuestionCollapsed ? "Questions" : "Hide"}
                        </span>
                      </button>
                    }
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-1.5 bg-base-300/80 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel ref={outputPanelRef} defaultSize={26} minSize={15}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>

          </PanelGroup>
        </div>

        {/* RIGHT PANEL - VIDEO CALL (FIXED WIDTH) */}
        <div className="w-[360px] min-w-[360px] max-w-[360px] h-full bg-base-200 border-l border-base-300 p-4 overflow-hidden flex flex-col">
          {!joinVideo ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <VideoIcon className="size-10 text-primary opacity-80" />
              </div>
              <h3 className="text-xl font-bold mb-2">Video & Chat</h3>
              <p className="text-sm text-base-content/60 mb-8">
                Join the video call to communicate and collaborate with your partner in real-time.
              </p>
              <button onClick={() => setJoinVideo(true)} className="btn btn-primary w-full shadow-lg shadow-primary/20">
                Start Video Call
              </button>
            </div>
          ) : isInitializingCall ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                <p className="text-lg">Connecting to video call...</p>
              </div>
            </div>
          ) : !streamClient || !call ? (
            <div className="h-full flex items-center justify-center">
              <div className="card bg-base-100 shadow-xl max-w-md">
                <div className="card-body items-center text-center">
                  <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                    <PhoneOffIcon className="w-12 h-12 text-error" />
                  </div>
                  <h2 className="card-title text-2xl">Connection Failed</h2>
                  <p className="text-base-content/70">Unable to connect to the video call</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <StreamVideo client={streamClient}>
                <StreamCall call={call}>
                  <VideoCallUI chatClient={chatClient} channel={channel} />
                </StreamCall>
              </StreamVideo>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionPage;
