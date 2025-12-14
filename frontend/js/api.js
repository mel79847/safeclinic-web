const API_BASE = "/api";

function withTimeout(ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, id };
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const { controller, id } = withTimeout(10000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error || err.message || `Error API (${res.status})`;
      throw new Error(msg);
    }

    if (res.status === 204) return null;
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  health: () => apiFetch("/health"),
  login: (data) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  specialties: () => apiFetch("/specialties"),
  doctors: () => apiFetch("/doctors"),
  appointmentsCreate: (data) =>
    apiFetch("/appointments", { method: "POST", body: JSON.stringify(data) }),
  appointmentsMine: () => apiFetch("/appointments/mine"),
  appointmentsDoctor: () => apiFetch("/appointments/doctor"),
};
