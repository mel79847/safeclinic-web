import { api } from "./api.js";
import { login, logout, getSession } from "./auth.js";
import { setStatus, setAuthUI, renderSpecialties, renderAppointments } from "./ui.js";

const els = {
  btnHealth: document.getElementById("btnHealth"),
  btnLogin: document.getElementById("btnLogin"),
  btnLogout: document.getElementById("btnLogout"),
  btnDemo: document.getElementById("btnDemoFill"),
  specialty: document.getElementById("specialty"),
  btnContinuar: document.getElementById("btnContinuar"),
  btnConsults: document.getElementById("btnConsults"),
  reason: document.getElementById("reason"),
  mode: document.getElementById("mode"),
  scheduledAt: document.getElementById("scheduledAt"),
};

async function tryCreatePendingAppointment() {
  const pending = localStorage.getItem("pendingAppointment");
  if (!pending) return;

  const data = JSON.parse(pending);

  try {
    await api.appointmentsCreate(data);
    localStorage.removeItem("pendingAppointment");
    alert("✅ Cita creada correctamente.");
  } catch (e) {
    console.log(e);
    alert(e.message || "No se pudo crear la cita (revisa sesión/rol/datos).");
  }
}

async function loadSpecialties() {
  try {
    const list = await api.specialties();
    renderSpecialties(list);
  } catch (e) {
    setStatus(e.message || "No se pudo cargar especialidades", "error");
  }
}

async function loadMyAppointments() {
  const session = getSession();
  if (!session) return;

  try {
    const list =
      session.role === "MEDICO"
        ? await api.appointmentsDoctor()
        : await api.appointmentsMine();

    renderAppointments(list);
  } catch (e) {
    setStatus(e.message || "No se pudo cargar citas", "error");
  }
}

els.btnHealth.onclick = async () => {
  try {
    const h = await api.health();
    setStatus(`API OK • ${h.time}`, "ok");
  } catch (e) {
    setStatus(e.message || "API no disponible", "error");
  }
};

els.btnLogin.onclick = async () => {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value;

  try {
    const session = await login(u, p);
    setAuthUI(session);
    setStatus("Sesión iniciada.", "ok");

    await tryCreatePendingAppointment();
    await loadMyAppointments();
  } catch (e) {
    setStatus(e.message || "Login falló", "error");
  }
};

els.btnLogout.onclick = () => {
  logout();
  setAuthUI(null);
  setStatus("Sesión cerrada.", "info");
};

els.btnDemo.onclick = () => {
  document.getElementById("username").value = "paciente1";
  document.getElementById("password").value = "safe1234";
};

els.btnContinuar.onclick = async () => {
  const session = getSession();

  const specialtyId = Number(els.specialty.value);
  const mode = els.mode.value;
  const scheduledAt = els.scheduledAt.value;
  const reason = (els.reason.value || "").trim();

  const payload = { specialtyId, mode, scheduledAt, reason: reason || undefined };

  if (!session) {
    localStorage.setItem("pendingAppointment", JSON.stringify(payload));
    setStatus("Inicia sesión para confirmar tu cita.", "info");
    alert("⚠️ Inicia sesión para confirmar tu cita.");
    return;
  }

  try {
    await api.appointmentsCreate(payload);
    alert("✅ Cita creada correctamente.");
    await loadMyAppointments();
  } catch (e) {
    setStatus(e.message || "No se pudo crear la cita", "error");
  }
};

els.btnConsults.onclick = async () => {
  await loadMyAppointments();
};

(async function init() {
  const session = getSession();
  setAuthUI(session);

  await loadSpecialties();

  if (session) {
    await tryCreatePendingAppointment();
    await loadMyAppointments();
  }
})();
