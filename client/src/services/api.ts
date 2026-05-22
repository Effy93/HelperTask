const API = import.meta.env.VITE_API_URL as string;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Erreur ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
