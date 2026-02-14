// ============================================
// App Route Paths
// ============================================
export const ROUTES = {
    HOME: "/",
    DASHBOARD: "/dashboard",
    PROBLEMS: "/problems",
    PROBLEM: (id) => `/problem/${id}`,
    SESSION: (id) => `/session/${id}`,
};

// ============================================
// Monaco Editor Configuration
// ============================================
export const EDITOR_CONFIG = {
    fontSize: 16,
    lineNumbers: "on",
    scrollBeyondLastLine: false,
    automaticLayout: true,
    minimap: { enabled: false },
    theme: "vs-dark",
};

// ============================================
// Confetti Configuration
// ============================================
export const CONFETTI_CONFIG = {
    particleCount: 80,
    spread: 250,
};

// ============================================
// Session Settings
// ============================================
export const SESSION = {
    MAX_PARTICIPANTS: 2,
};

// ============================================
// Toast Settings
// ============================================
export const TOAST_CONFIG = {
    duration: 3000,
};

// ============================================
// Language Configuration
// ============================================
export const LANGUAGE_CONFIG = {
    javascript: {
        label: "JavaScript",
        monacoLanguage: "javascript",
    },
    python: {
        label: "Python",
        monacoLanguage: "python",
    },
    java: {
        label: "Java",
        monacoLanguage: "java",
    },
};
