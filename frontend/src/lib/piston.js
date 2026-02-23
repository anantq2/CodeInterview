import axiosInstance from "./axios";

/**
 * @param {string} language - programming language
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    if (!language || typeof language !== "string") {
      return {
        success: false,
        error: "Language is required",
      };
    }

    const response = await axiosInstance.post("/code/execute", { language, code });
    return response.data;
  } catch (error) {
    const apiError = error.response?.data?.error;

    return {
      success: false,
      error: apiError || `Failed to execute code: ${error.message}`,
    };
  }
}
