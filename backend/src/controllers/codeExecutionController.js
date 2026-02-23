import { ENV } from "../lib/env.js";

const JDOODLE_EXECUTE_URL = "https://api.jdoodle.com/v1/execute";

const LANGUAGE_CONFIG = {
  javascript: { language: "nodejs", versionIndex: "0" },
  python: { language: "python3", versionIndex: "0" },
  java: { language: "java", versionIndex: "5" },
};

const REQUEST_TIMEOUT_MS = 15000;

export const executeCode = async (req, res) => {
  const { language, code, stdin = "" } = req.body || {};

  if (!language || typeof language !== "string") {
    return res.status(400).json({ success: false, error: "Language is required" });
  }

  if (!code || typeof code !== "string") {
    return res.status(400).json({ success: false, error: "Code is required" });
  }

  const languageConfig = LANGUAGE_CONFIG[language];
  if (!languageConfig) {
    return res.status(400).json({ success: false, error: `Unsupported language: ${language}` });
  }

  if (!ENV.JDOODLE_CLIENT_ID || !ENV.JDOODLE_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      error: "Server configuration missing JDoodle credentials",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const jdoodleResponse = await fetch(JDOODLE_EXECUTE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        clientId: ENV.JDOODLE_CLIENT_ID,
        clientSecret: ENV.JDOODLE_CLIENT_SECRET,
        script: code,
        stdin,
        language: languageConfig.language,
        versionIndex: languageConfig.versionIndex,
      }),
    });

    let payload = null;
    try {
      payload = await jdoodleResponse.json();
    } catch {
      payload = null;
    }

    if (!jdoodleResponse.ok) {
      return res.status(jdoodleResponse.status).json({
        success: false,
        error: payload?.error || `JDoodle request failed with status ${jdoodleResponse.status}`,
      });
    }

    const isExecutionSuccess =
      typeof payload?.isExecutionSuccess === "boolean"
        ? payload.isExecutionSuccess
        : payload?.statusCode === 200;

    const output = payload?.output || "";

    if (!isExecutionSuccess) {
      return res.status(200).json({
        success: false,
        output,
        error: payload?.error || output || "Execution failed",
      });
    }

    return res.status(200).json({
      success: true,
      output: output || "No output",
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "Code execution timed out",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to execute code",
    });
  } finally {
    clearTimeout(timeout);
  }
};
