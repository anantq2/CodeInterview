import { lazy, Suspense } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";

import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import DashboardPage from "./pages/DashboardPage";
import ProblemsPage from "./pages/ProblemsPage";

import { ROUTES, TOAST_CONFIG } from "./lib/constants";

// Lazy load heavy pages — these load only when user navigates to them
const HomePage = lazy(() => import("./pages/HomePage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const SessionPage = lazy(() => import("./pages/SessionPage"));

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
        <Routes>
          <Route path={ROUTES.HOME} element={!isSignedIn ? <HomePage /> : <Navigate to={ROUTES.DASHBOARD} />} />
          <Route path={ROUTES.DASHBOARD} element={isSignedIn ? <DashboardPage /> : <Navigate to={ROUTES.HOME} />} />

          <Route path={ROUTES.PROBLEMS} element={isSignedIn ? <ProblemsPage /> : <Navigate to={ROUTES.HOME} />} />
          <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={ROUTES.HOME} />} />
          <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={ROUTES.HOME} />} />
        </Routes>
      </Suspense>

      <Toaster toastOptions={{ duration: TOAST_CONFIG.duration }} />
    </ErrorBoundary>
  );
}

export default App;

