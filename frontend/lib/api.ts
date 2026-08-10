const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  authenticated = true
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (authenticated && typeof window !== "undefined") {
    const token = localStorage.getItem("rewardnest_token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Public API request
 */
export function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(endpoint, options, false);
}

/**
 * Authenticated API request
 */
export function apiFetchAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(endpoint, options, true);
}

/**
 * Convenience API client
 */
export const api = {
  get<T>(endpoint: string) {
    return apiFetchAuth<T>(endpoint, {
      method: "GET",
    });
  },

  post<T>(endpoint: string, body?: unknown) {
    return apiFetchAuth<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown) {
    return apiFetchAuth<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string) {
    return apiFetchAuth<T>(endpoint, {
      method: "DELETE",
    });
  },
};