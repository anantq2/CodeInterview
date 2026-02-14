import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "";
const axiosInstance = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : "/api",
  withCredentials: true,
});

console.log("Axios Base URL Env:", import.meta.env.VITE_API_URL);
console.log("FINAL AXIOS BASEURL:", axiosInstance.defaults.baseURL);

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

