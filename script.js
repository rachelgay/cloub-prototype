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
      room: "Salle A",
      datetime: new Date().toISOString().slice(0, 16),
      participants: ["Nina", "Paul"],
    },
  ]),
  events: load(STORAGE_KEYS.events, [
    { id: crypto.randomUUID(), title: "Run collectif", location: "Sion", date: "2026-05-15" },
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

const tabButtons = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const courseForm = document.getElementById("course-form");
const participantForm = document.getElementById("participant-form");
const participantCourseSelect = document.getElementById("participant-course");
const courseList = document.getElementById("course-list");
const eventForm = document.getElementById("event-form");
const eventList = document.getElementById("event-list");
const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");

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

if (courseForm) {
  courseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("course-title").value.trim();
    const coach = document.getElementById("course-coach").value.trim();
    const room = document.getElementById("course-room").value.trim();
    const datetime = document.getElementById("course-datetime").value;

    state.courses.unshift({ id: crypto.randomUUID(), title, coach, room, datetime, participants: [] });
    courseForm.reset();
    persist();
    renderCourses();
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
    renderCourses();
  });
}

if (eventForm) {
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("event-title").value.trim();
    const location = document.getElementById("event-location").value.trim();
    const date = document.getElementById("event-date").value;
    state.events.unshift({ id: crypto.randomUUID(), title, location, date });
    eventForm.reset();
    persist();
    renderEvents();
  });
}

if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const author = document.getElementById("chat-author").value.trim();
    const content = document.getElementById("chat-input").value.trim();
    if (!author || !content) return;
    state.chatMessages.push({ id: crypto.randomUUID(), author, content, timestamp: new Date().toISOString() });
    document.getElementById("chat-input").value = "";
    persist();
    renderChat();
  });
}

function renderCourses() {
  if (!courseList) return;
  if (participantCourseSelect) participantCourseSelect.innerHTML = "";
  courseList.innerHTML = "";
  if (state.courses.length === 0) {
    courseList.innerHTML = "<li>Aucun cours pour le moment.</li>";
    return;
  }
  state.courses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course.id;
    option.textContent = `${course.title} - ${formatDateTime(course.datetime)}`;
    if (participantCourseSelect) participantCourseSelect.appendChild(option);
    const li = document.createElement("li");
    li.innerHTML = `<strong>${escapeHtml(course.title)}</strong><br />Coach: ${escapeHtml(course.coach)} | Salle: ${escapeHtml(course.room)}<br />Horaire: ${formatDateTime(course.datetime)}<br />Inscrits (${course.participants.length}): ${course.participants.map(escapeHtml).join(", ") || "Aucun"}`;
    courseList.appendChild(li);
  });
}

function renderEvents() {
  if (!eventList) return;
  eventList.innerHTML = "";
  if (state.events.length === 0) {
    eventList.innerHTML = "<li>Aucun event pour le moment.</li>";
    return;
  }
  state.events.forEach((event) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${escapeHtml(event.title)}</strong><br />Lieu: ${escapeHtml(event.location)}<br />Date: ${formatDate(event.date)}`;
    eventList.appendChild(li);
  });
}

function renderChat() {
  if (!chatMessages) return;
  chatMessages.innerHTML = "";
  state.chatMessages.forEach((msg) => {
    const el = document.createElement("div");
    el.className = "chat-message";
    el.innerHTML = `<strong>${escapeHtml(msg.author)}</strong><small> - ${formatDateTime(msg.timestamp)}</small><div>${escapeHtml(msg.content)}</div>`;
    chatMessages.appendChild(el);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
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
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("fr-CH");
}

function formatDateTime(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleString("fr-CH");
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

renderCourses();
renderEvents();
renderChat();
