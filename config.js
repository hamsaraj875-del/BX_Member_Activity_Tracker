/**
 * config.js — BX Analytics Frontend Configuration
 *
 * Automatically resolves the API Base URL:
 * - If running locally (localhost, 127.0.0.1, or file:///), points to http://localhost:3001.
 * - If deployed, uses relative paths to request data from the same host.
 */

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") {
  window.API_BASE_URL = "http://localhost:3001";
} else {
  window.API_BASE_URL = ""; // Relative URL for deployment
}

