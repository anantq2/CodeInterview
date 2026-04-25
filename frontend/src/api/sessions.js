import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  getSessionDetails: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}/details`);
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },

  joinByInviteCode: async (inviteCode) => {
    const response = await axiosInstance.post(`/sessions/join/code/${inviteCode}`);
    return response.data;
  },

  endSession: async ({ id, codeSnapshots }) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`, { codeSnapshots });
    return response.data;
  },

  heartbeatSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/heartbeat`);
    return response.data;
  },

  saveCodeSnapshot: async ({ id, language, code }) => {
    const response = await axiosInstance.post(`/sessions/${id}/save-code`, { language, code });
    return response.data;
  },

  saveExecutionResult: async ({ id, language, code, output, success }) => {
    const response = await axiosInstance.post(`/sessions/${id}/save-execution`, {
      language,
      code,
      output,
      success,
    });
    return response.data;
  },

  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
};
