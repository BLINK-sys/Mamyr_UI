const API_BASE = import.meta.env.VITE_API_URL || "https://mamyr-server.onrender.com/api";

function getToken(): string | null {
  const saved = localStorage.getItem("auth_user_token");
  return saved;
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("auth_user_token", token);
  } else {
    localStorage.removeItem("auth_user_token");
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: unknown) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: "DELETE" }),

  async uploadFile(file: File): Promise<string> {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form, headers });
    const data = await res.json();
    return data.url;
  },

  fullImageUrl(path: string | undefined): string {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/api")) {
      const base = API_BASE.replace("/api", "");
      return `${base}${path}`;
    }
    return path;
  },
};
