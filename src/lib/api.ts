// API Configuration
// Uses environment variable for the API base URL
// Falls back to empty string for relative URLs (works with Vite proxy in dev)

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (e.g., '/auth/login')
 * @returns The full URL
 */
export function getApiUrl(endpoint: string): string {
  // If API_BASE_URL is set, use it directly with the endpoint
  // Otherwise, use /api prefix for Vite proxy
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `/api${endpoint}`;
}

/**
 * Get common API headers including ngrok bypass header
 * Use this for all fetch requests to ensure ngrok compatibility
 * @param additionalHeaders - Additional headers to merge
 * @returns Headers object
 */
export function getApiHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    // This header bypasses ngrok's browser warning page
    'ngrok-skip-browser-warning': 'true',
    ...additionalHeaders
  };
}
