import { apiFetch } from "./api";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  full_name: string;
}

export async function login(
  data: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  localStorage.setItem("rewardnest_token", response.access_token);

  localStorage.setItem(
    "rewardnest_user",
    JSON.stringify(response.user),
  );

  return response;
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("rewardnest_token");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem("rewardnest_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as User;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem("rewardnest_token");
  localStorage.removeItem("rewardnest_user");
}