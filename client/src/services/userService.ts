import { apiFetch } from "./api";

export type UserPayload = { name: string; email: string; password?: string };
export type UserResponse = { id: number; name: string; email: string };

export const updateMe = (
  payload: UserPayload,
): Promise<{ user: UserResponse }> =>
  apiFetch("/api/users/me", { method: "PUT", body: JSON.stringify(payload) });
