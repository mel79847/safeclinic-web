export function setStatus(text = "", type = "info") {
  const el = document.getElementById("status");
  if (!el) return;
  el.textContent = text;
  el.dataset.type = type;
}

export function setAuthUI(session) {
  const authBlock = document.getElementById("authBlock");
  const dashBlock = document.getElementById("dashBlock");
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");

  if (!authBlock || !dashBlock) return;

  const loggedIn = !!session;

  authBlock.hidden = loggedIn;
  dashBlock.hidden = !loggedIn;

  if (btnLogin) btnLogin.disabled = loggedIn;
  if (btnLogout) btnLogout.disabled = !loggedIn;

  const who = document.getElementById("whoami");
  if (who) who.textContent = loggedIn ? `${session.username} (${session.role})` : "";
}

export function renderSpecialties(items) {
  const sel = document.getElementById("specialty");
  if (!sel) return;

  sel.replaceChildren();

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "Selecciona una especialidad…";
  sel.appendChild(opt0);

  for (const it of items) {
    const opt = document.createElement("option");
    opt.value = String(it.id);
    opt.textContent = it.name;
    sel.appendChild(opt);
  }
}

function cardLine(label, value) {
  const row = document.createElement("div");
  row.className = "row";

  const l = document.createElement("strong");
  l.textContent = label + ": ";
  row.appendChild(l);

  const v = document.createElement("span");
  v.textContent = value;
  row.appendChild(v);

  return row;
}

export function renderAppointments(list) {
  const out = document.getElementById("cardsOut");
  if (!out) return;

  out.replaceChildren();

  if (!list || list.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No hay citas para mostrar.";
    out.appendChild(p);
    return;
  }

  for (const a of list) {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    const specName = a.specialty?.name || "Especialidad";
    title.textContent = `${specName} • ${new Date(a.scheduledAt).toLocaleString()}`;
    card.appendChild(title);

    card.appendChild(cardLine("Modo", a.mode));
    card.appendChild(cardLine("Estado", a.status));

    if (a.patient?.username) card.appendChild(cardLine("Paciente", a.patient.username));
    if (a.reason) card.appendChild(cardLine("Motivo", a.reason));

    out.appendChild(card);
  }
}
