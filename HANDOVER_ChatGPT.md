# 🚀 CodeInterview: Project Progress & ChatGPT Handover Document

This document contains a complete, A-to-Z breakdown of every architectural decision, bug fix, and feature implementation we completed in our current session. You can copy-paste this directly to ChatGPT to give it 100% context on the current state of the codebase.

---

## 🎯 What We Set Out To Do (The Plan)
Initially, the CodeInterview platform had 3 major flaws:
1. **No Data Persistence:** Code was never saved to the database. When a session ended, all progress was permanently lost. "Past Sessions" in the dashboard were empty shells.
2. **Fake Collaboration:** Users in a session had completely independent code editors. There was no real-time typing sync (Google Docs style).
3. **Hardcoded Problems:** The 5 interview problems were hardcoded in the frontend.

We decided to implement **Phase 1 (Code Snapshots)** and **Phase 2 (Yjs Real-time Sync)** to transform the app into a true production-grade platform. We also added a manual "Start Video Call" feature for better UX and performance.

---

## 🛠️ Phase 1: Code Persistence & Session History (COMPLETED)
**Goal:** Ensure users can review their code and execution outputs after a session ends.

### Backend Changes:
1. **Updated Model (`backend/src/models/Session.js`)**
   - Added `codeSnapshots`: Array of objects storing the user's final code state.
   - Added `executionResults`: Array tracking code runs (success/error output).
   - Added `startedAt` and `endedAt` for session duration calculation.
   - Added `problemId` for future database mapping.
2. **New Controllers (`backend/src/controllers/sessionController.js`)**
   - `saveCodeSnapshot`: API for periodic auto-saving to prevent data loss on crash.
   - `saveExecutionResult`: API to track code runner outputs.
   - `getSessionDetails`: API to fetch full session history (with populated user info).
   - Modified `endSession`: Now accepts final code snapshots in the request body.
   - Modified `getMyRecentSessions`: Added `.populate()` for host/participant details to show on the dashboard.
3. **Updated Routes (`backend/src/routes/sessionRoute.js`)**
   - Connected the new endpoints (`/:id/save-code`, `/:id/details`, `/:id/save-execution`).

### Frontend Changes:
1. **API Layer (`frontend/src/api/sessions.js` & `hooks/useSessions.js`)**
   - Created Axios wrappers and React Query hooks (`useSaveCodeSnapshot`, `useSessionDetails`, etc.) for the new backend APIs.
2. **Auto-Save System (`frontend/src/pages/SessionPage.jsx`)**
   - Implemented a `setInterval` that automatically saves the current editor code to the database every 30 seconds.
   - Added `navigator.sendBeacon` to attempt a final save if the user suddenly closes the tab (`beforeunload`).
3. **Completed Session Review (`frontend/src/pages/SessionDetailPage.jsx` [NEW])**
   - Created a brand-new page specifically for reviewing completed sessions.
   - Features: Read-only Monaco editor, execution history timeline, session duration stats, and participant cards.
4. **Dashboard Upgrades (`frontend/src/components/RecentSessions.jsx`)**
   - Past session cards are now clickable and route to the new review page.
   - Added small code snippet previews directly on the cards.

---

## ⚡ Phase 2: Real-time Code Sync using CRDTs (COMPLETED)
**Goal:** Implement true, conflict-free real-time collaboration with multi-cursor support.

### Backend Changes:
1. **Dependencies:** Installed `ws`, `yjs`, `y-protocols`, and `lib0`.
2. **Yjs Persistence Model (`backend/src/models/YjsDocument.js` [NEW])**
   - MongoDB schema storing `roomName` and the binary Yjs document state (`Buffer`). This ensures that if the Render backend sleeps, the code state is reloaded seamlessly from DB.
3. **WebSocket Server (`backend/src/lib/yjsServer.js` [NEW])**
   - Built a custom WebSocket handler for the `y-websocket` protocol using `y-protocols/sync` and `y-protocols/awareness`.
   - Handles auto-cleanup of dead connections and debounced persistence to MongoDB (saves every 2s).
4. **Server Entry Upgrade (`backend/src/server.js`)**
   - Wrapped the Express `app` with `http.createServer()` so both HTTP APIs and WebSockets run on the **same port** (port 5000). The WebSocket server listens on the `/yjs/` path prefix.

### Frontend Changes:
1. **Dependencies:** Installed `yjs`, `y-monaco`, and `y-websocket`.
2. **Collaborative Editor (`frontend/src/components/CodeEditorPanel.jsx`)**
   - Integrated `y-monaco`'s `MonacoBinding`.
   - The editor now supports remote cursors (showing partner's name and color).
   - Added a live "SYNCED / SYNCING / OFFLINE" connection indicator in the header.
   - Added manual Ctrl+S capture and a "Save" button to the UI.
3. **Yjs Provider Initialization (`frontend/src/pages/SessionPage.jsx`)**
   - Initializes `WebsocketProvider` targeting `ws://your-backend/yjs/<callId>`.
   - Binds the local React code state to the Yjs document to ensure the auto-saver and code-runner always have the synchronized state.

---

## 🎨 UI/UX Polish & Bug Fixes (COMPLETED)
1. **Manual Video Call Join (`frontend/src/hooks/useStreamClient.js` & `SessionPage.jsx`)**
   - **Problem:** Video and Mic auto-started the moment a user joined the session.
   - **Fix:** Added a `joinVideo` state. The right panel now displays a "Start Video Call" button. Stream SDK only initializes *after* the user clicks this button, drastically saving network/RAM resources for code-only sessions.
   - **Bug Fixed:** Fixed the dependency array in the hook to ensure the call connects correctly when `joinVideo` switches to `true`.
2. **Layout Warnings Fixed**
   - Fixed an `Invalid layout total size: 28%, 42%` console warning from `react-resizable-panels` by ensuring the left panel (28%) and middle panel (72%) sum exactly to 100%.
3. **Icon Imports Fixed**
   - Resolved a missing `Share2Icon` import in `SessionPage.jsx`.

---

## 🚀 Next Steps / Future Roadmap (For ChatGPT)
If you are reading this as an AI assistant to continue the project, here is what the user might want to tackle next:

1. **Phase 3: Database-backed Problems**
   - Move the hardcoded 5 problems in `frontend/src/data/problems.js` to MongoDB (`Problem` model).
   - Create admin API routes for CRUD operations on problems.
2. **Phase 4: AI Integration (Gemini)**
   - Add a "Request AI Review" button on the `SessionDetailPage` that sends the final code to Gemini for algorithmic feedback.
   - Add progressive AI hints inside the active `SessionPage`.
3. **Security & Production Polish**
   - Implement rate limiting (`express-rate-limit`) to protect the code execution endpoint (JDoodle API limits).
   - Implement data validation using Zod for API routes.
