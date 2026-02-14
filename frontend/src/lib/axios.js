import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

console.log("FINAL AXIOS BASEURL:", axiosInstance.defaults.baseURL);

// Add Clerk auth token to every request (required for cross-origin API calls)
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Failed to get Clerk token:", err);
  }
  return config;
});

// Global response error interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        toast.error("Session expired. Please sign in again.");
        window.location.href = "/";
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      }
    } else if (error.request) {
      // Network error — no response received
      toast.error("Network error. Please check your internet connection.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

