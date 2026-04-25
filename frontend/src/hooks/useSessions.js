import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  const result = useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onSuccess: () => toast.success("Session created successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create room"),
  });

  return result;
};

export const useActiveSessions = () => {
  const result = useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
  });

  return result;
};

export const useMyRecentSessions = () => {
  const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });

  return result;
};

export const useSessionById = (id) => {
  const result = useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Stop polling if we got a 403 (private session — user not authorized)
      if (query.state.error?.response?.status === 403) return false;
      return 5000;
    },
    retry: (failureCount, error) => {
      // Don't retry on 403 (private session) — show invite code prompt immediately
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  return result;
};

export const useJoinSession = () => {
  const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: () => toast.success("Joined session successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to join session"),
  });

  return result;
};

export const useEndSession = () => {
  const result = useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
    onSuccess: () => toast.success("Session ended successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to end session"),
  });

  return result;
};

export const useSessionDetails = (id) => {
  const result = useQuery({
    queryKey: ["sessionDetails", id],
    queryFn: () => sessionApi.getSessionDetails(id),
    enabled: !!id,
  });

  return result;
};

export const useSaveCodeSnapshot = () => {
  const result = useMutation({
    mutationKey: ["saveCodeSnapshot"],
    mutationFn: sessionApi.saveCodeSnapshot,
    // Silent — no toasts for auto-save
  });

  return result;
};

export const useSaveExecutionResult = () => {
  const result = useMutation({
    mutationKey: ["saveExecutionResult"],
    mutationFn: sessionApi.saveExecutionResult,
    // Silent — no toasts
  });

  return result;
};

export const useJoinByInviteCode = () => {
  const result = useMutation({
    mutationKey: ["joinByInviteCode"],
    mutationFn: sessionApi.joinByInviteCode,
    onError: (error) => toast.error(error.response?.data?.message || "Invalid invite code"),
  });

  return result;
};
