import { api } from "./api.js";

function decodeJwtPayload(token) {
  const part = token.split(".")[1] || "";
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((part.length + 3) % 4);
  return JSON.parse(atob(base64));
}

export function getSession() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return token && user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("pendingAppointment");
}

export async function login(username, password) {
  const { token, user } = await api.login({ username, password });

  let u = user;
  if (!u) {
    const payload = decodeJwtPayload(token);
    u = { id: payload.sub, username: payload.username, role: payload.role };
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(u));

  return u;
}
