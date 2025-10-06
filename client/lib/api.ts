const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? (undefined as any) : await res.json();
}

export const api = {
  register: (email: string, password: string) =>
    request<{ message: string; user: { id: string; email: string } }>(
      "/register",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  login: (email: string, password: string) =>
    request<{ message: string; user: { id: string; email: string } }>(
      "/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  logout: () => request<{ message: string }>("/logout", { method: "POST" }),
  getVault: () => request<any[]>("/vault", { method: "GET" }),
  createVault: (payload: any) =>
    request<any>("/vault", { method: "POST", body: JSON.stringify(payload) }),
  updateVault: (id: string, payload: any) =>
    request<any>(`/vault/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteVault: (id: string) =>
    request<{ message: string }>(`/vault/${id}`, { method: "DELETE" }),
};

export default api;
