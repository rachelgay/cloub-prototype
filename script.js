const STORAGE_KEYS = {
  courses: "cloub_courses",
  events: "cloub_events",
  chat: "cloub_chat_messages",
};

const state = {
  courses: load(STORAGE_KEYS.courses, [
    {
      id: crypto.randomUUID(),
      title: "Mobilite du midi",
      coach: "Coach Ana",
      discipline: "Mobilité",
      room: "Salle A",
      datetime: new Date().toISOString().slice(0, 16),
      participants: ["Nina", "Paul"],
    },
    {
      id: crypto.randomUUID(),
      title: "Running matinal",
      coach: "Coach Théo",
      discipline: "Running",
      room: "Extérieur",
      datetime: new Date().toISOString().slice(0, 16),
      participants: ["Emma", "Marc", "Léa"],
    },
  ]),
  events: load(STORAGE_KEYS.events, [
    { id: crypto.randomUUID(), title: "Run collectif", location: "Sion", date: "2026-06-15", participants: [] },
    { id: crypto.randomUUID(), title: "Défi escalade", location: "Halle d'escalade", date: "2026-07-05", participants: [] },
  ]),
  chatMessages: load(STORAGE_KEYS.chat, [
    {
      id: crypto.randomUUID(),
      author: "Lea",
      content: "Qui est partant pour un run ce soir a 18h?",
      timestamp: new Date().toISOString(),
    },
  ]),
};

// ── TAB NAVIGATION ────────────────────────────────────

const tabButtons = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    tabButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    panels.forEach((p) => p.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

// ── FORM REFS ─────────────────────────────────────────

const courseForm = document.getElementById("course-form");
const participantForm = document.getElementById("participant-form");
const participantCourseSelect = document.getElementById("participant-course");
const courseList = document.getElementById("course-list");
const eventForm = document.getElementById("event-form");
const eventList = document.getElementById("event-list");
const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");

// ── FORM HANDLERS ─────────────────────────────────────

if (courseForm) {
  courseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("course-title").value.trim();
    const coach = document.getElementById("course-coach").value.trim();
    const discipline = document.getElementById("course-discipline").value;
    const room = document.getElementById("course-room").value.trim();
    const datetime = document.getElementById("course-datetime").value;

    state.courses.unshift({
      id: crypto.randomUUID(),
      title,
      coach,
      discipline,
      room,
      datetime,
      participants: [],
    });
    courseForm.reset();
    persist();
    renderAll();
  });
}

if (participantForm) {
  participantForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("participant-name").value.trim();
    const courseId = participantCourseSelect.value;
    const course = state.courses.find((c) => c.id === courseId);
    if (!course || !name) return;
    if (!course.participants.includes(name)) course.participants.push(name);
    participantForm.reset();
    persist();
    renderAll();
  });
}

if (eventForm) {
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("event-title").value.trim();
    const location = document.getElementById("event-location").value.trim();
    const date = document.getElementById("event-date").value;
    state.events.unshift({ id: crypto.randomUUID(), title, location, date, participants: [] });
    eventForm.reset();
    persist();
    renderAll();
  });
}

if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const author = document.getElementById("chat-author").value.trim();
    const content = document.getElementById("chat-input").value.trim();
    if (!author || !content) return;
    state.chatMessages.push({
      id: crypto.randomUUID(),
      author,
      content,
      timestamp: new Date().toISOString(),
    });
    document.getElementById("chat-input").value = "";
    persist();
    renderChat();
  });
}

// ── RENDER : COURSES ──────────────────────────────────

function renderCourses() {
  if (!courseList) return;
  if (participantCourseSelect) participantCourseSelect.innerHTML = "";
  courseList.innerHTML = "";

  if (state.courses.length === 0) {
    courseList.innerHTML = "<li>Aucun cours pour le moment.</li>";
    return;
  }

  state.courses.forEach((course) => {
    if (participantCourseSelect) {
      const option = document.createElement("option");
      option.value = course.id;
      option.textContent = `${course.title} — ${formatDateTime(course.datetime)}`;
      participantCourseSelect.appendChild(option);
    }

    const disc = course.discipline ? ` · ${escapeHtml(course.discipline)}` : "";
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${escapeHtml(course.title)}</strong>${disc}<br />
      Coach : ${escapeHtml(course.coach)} &nbsp;·&nbsp; Salle : ${escapeHtml(course.room)}<br />
      Horaire : ${formatDateTime(course.datetime)}<br />
      Inscrits (${course.participants.length}) : ${course.participants.map(escapeHtml).join(", ") || "Aucun"}
    `;
    courseList.appendChild(li);
  });
}

// ── RENDER : EVENTS ───────────────────────────────────

function renderEvents() {
  if (!eventList) return;
  eventList.innerHTML = "";

  if (state.events.length === 0) {
    eventList.innerHTML = "<li>Aucun event pour le moment.</li>";
    return;
  }

  state.events.forEach((event) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${escapeHtml(event.title)}</strong><br />
      Lieu : ${escapeHtml(event.location)}<br />
      Date : ${formatDate(event.date)}
    `;
    eventList.appendChild(li);
  });
}

// ── RENDER : CHAT ─────────────────────────────────────

function renderChat() {
  if (!chatMessages) return;
  chatMessages.innerHTML = "";
  state.chatMessages.forEach((msg) => {
    const el = document.createElement("div");
    el.className = "chat-message";
    el.innerHTML = `<strong>${escapeHtml(msg.author)}</strong><small> — ${formatDateTime(msg.timestamp)}</small><div>${escapeHtml(msg.content)}</div>`;
    chatMessages.appendChild(el);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ── RENDER : DASHBOARD ────────────────────────────────

function renderDashboard() {
  const dashCoursesList  = document.getElementById("dash-courses");
  const dashCoachesList  = document.getElementById("dash-coaches");
  const dashEventsList   = document.getElementById("dash-events");
  const statCoursesEl    = document.getElementById("stat-courses");
  const statCoachesEl    = document.getElementById("stat-coaches");
  const statParticipants = document.getElementById("stat-participants");

  if (!dashCoursesList) return; // pas sur la page gestionnaire

  // ── Chiffres clés
  const totalInscrits = state.courses.reduce((s, c) => s + c.participants.length, 0);
  const uniqueCoaches = [...new Set(state.courses.map((c) => c.coach))];

  if (statCoursesEl)    statCoursesEl.textContent    = state.courses.length;
  if (statCoachesEl)    statCoachesEl.textContent    = uniqueCoaches.length;
  if (statParticipants) statParticipants.textContent = totalInscrits;

  // ── Participants par cours (avec barre de progression)
  const maxP = Math.max(...state.courses.map((c) => c.participants.length), 1);

  if (state.courses.length === 0) {
    dashCoursesList.innerHTML = "<li>Aucun cours créé.</li>";
  } else {
    dashCoursesList.innerHTML = state.courses
      .map((c) => {
        const pct = Math.round((c.participants.length / maxP) * 100);
        const disc = c.discipline ? ` · ${escapeHtml(c.discipline)}` : "";
        const label = c.participants.length === 1 ? "inscrit" : "inscrits";
        return `<li>
          <div class="dash-row">
            <strong>${escapeHtml(c.title)}${disc}</strong>
            <span class="badge badge-solid">${c.participants.length} ${label}</span>
          </div>
          <div class="dash-sub">Coach ${escapeHtml(c.coach)} &nbsp;·&nbsp; ${formatDateTime(c.datetime)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        </li>`;
      })
      .join("");
  }

  // ── Coachs disponibles avec leur sport
  const coachMap = {};
  state.courses.forEach((c) => {
    if (!coachMap[c.coach]) coachMap[c.coach] = { count: 0, disciplines: new Set() };
    coachMap[c.coach].count++;
    if (c.discipline) coachMap[c.coach].disciplines.add(c.discipline);
  });

  if (Object.keys(coachMap).length === 0) {
    dashCoachesList.innerHTML = "<li>Aucun coach enregistré.</li>";
  } else {
    dashCoachesList.innerHTML = Object.entries(coachMap)
      .map(([name, data]) => {
        const tags = [...data.disciplines]
          .map((d) => `<span class="badge badge-outline">${escapeHtml(d)}</span>`)
          .join("");
        const coursLabel = data.count === 1 ? "cours" : "cours";
        return `<li>
          <div class="dash-row">
            <strong>${escapeHtml(name)}</strong>
            <span class="dash-sub">${data.count} ${coursLabel}</span>
          </div>
          <div class="tag-group">${tags || '<span class="badge badge-outline">Non précisé</span>'}</div>
        </li>`;
      })
      .join("");
  }

  // ── Inscrits par event
  if (state.events.length === 0) {
    dashEventsList.innerHTML = "<li>Aucun event créé.</li>";
  } else {
    dashEventsList.innerHTML = state.events
      .map((e) => {
        const count = (e.participants || []).length;
        const label = count === 1 ? "inscrit" : "inscrits";
        return `<li>
          <div class="dash-row">
            <strong>${escapeHtml(e.title)}</strong>
            <span class="badge badge-solid">${count} ${label}</span>
          </div>
          <div class="dash-sub">${escapeHtml(e.location)} &nbsp;·&nbsp; ${formatDate(e.date)}</div>
        </li>`;
      })
      .join("");
  }
}

// ── HELPERS ───────────────────────────────────────────

function renderAll() {
  renderCourses();
  renderEvents();
  renderChat();
  renderDashboard();
}

function persist() {
  localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(state.courses));
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(state.events));
  localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(state.chatMessages));
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(dateValue) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString("fr-CH");
}

function formatDateTime(dateValue) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleString("fr-CH");
}

function escapeHtml(value) {
  if (!value) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ── INIT ──────────────────────────────────────────────

renderAll();
