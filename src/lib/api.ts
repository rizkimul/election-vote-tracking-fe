// API Configuration
// Uses environment variable for the API base URL
// Falls back to empty string for relative URLs (works with Vite proxy in dev)

import { toast } from 'sonner';

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

/**
 * Validates the current session and refreshing token if necessary
 * Usage: Replace standard fetch with this for authenticated endpoints
 */
export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers = getApiHeaders(init?.headers as Record<string, string> || {});
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...init,
    headers
  };

  let response = await fetch(input, config);

  if (response.status === 401) {
    // Token might be expired, try refreshing
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(getApiUrl('/auth/refresh'), {
          method: 'POST',
          headers: getApiHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('token', data.access_token);
          // If a new refresh token is returned (rotation), save it too
          if (data.refresh_token) {
            localStorage.setItem('refreshToken', data.refresh_token);
          }

          // Retry original request with new token
          headers['Authorization'] = `Bearer ${data.access_token}`;
          response = await fetch(input, { ...init, headers });
        } else {
          // Refresh failed (token expired/revoked) - Logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          toast.error("Sesi Anda telah berakhir, silakan login kembali");
          setTimeout(() => {
            window.location.href = '/login'; 
          }, 2000); 
        }
      } catch (error) {
        // Network error or other issue during refresh
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        toast.error("Gagal memperbarui sesi, silakan login kembali");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else {
       // No refresh token available
       toast.error("Sesi telah berakhir, silakan login kembali");
       setTimeout(() => {
         window.location.href = '/login';
       }, 2000);
    }
  }

  return response;
}
