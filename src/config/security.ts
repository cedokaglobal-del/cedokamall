/**
 * Security Configuration
 * Ensures the application follows industry security best practices
 */

// Content Security Policy Headers - STRICT for security
// Removed 'unsafe-inline' and 'unsafe-eval' to prevent XSS attacks
export const CSP_HEADERS = {
  "Content-Security-Policy": 
    "default-src 'self'; " +
    "script-src 'self' *.unsplash.com *.googleapis.com *.gstatic.com; " +
    "style-src 'self' *.googleapis.com *.gstatic.com; " +
    "img-src 'self' data: https: *.unsplash.com *.gstatic.com; " +
    "font-src 'self' data: *.googleapis.com *.gstatic.com; " +
    "connect-src 'self' *.unsplash.com *.googleapis.com *.gstatic.com; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests; " +
    "block-all-mixed-content"
};

// Security Headers
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
};

// CORS Configuration
export const CORS_CONFIG = {
  origin: import.meta.env.VITE_API_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
  maxAge: 86400
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false
};

// Input Validation Rules
export const VALIDATION_RULES = {
  password: {
    minLength: 12,
    requireUpperCase: true,
    requireLowerCase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/
  }
};

// Session Configuration
export const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: true,
  httpOnly: true,
  sameSite: "strict" as const
};

/**
 * Input Sanitization Functions
 */

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/&/g, "&amp;") // Escape ampersands
    .trim();
}

export function validateEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern.test(email);
}

export function validatePassword(password: string): boolean {
  return VALIDATION_RULES.password.pattern.test(password);
}

export function validateUsername(username: string): boolean {
  if (username.length < VALIDATION_RULES.username.minLength ||
      username.length > VALIDATION_RULES.username.maxLength) {
    return false;
  }
  return VALIDATION_RULES.username.pattern.test(username);
}

/**
 * Security Utility Functions
 */

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

export function encodeForHTML(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function encodeForURL(str: string): string {
  return encodeURIComponent(str);
}
