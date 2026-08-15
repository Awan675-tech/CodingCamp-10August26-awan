const storageKeys = {
  tasks: "life-dashboard-tasks",
  links: "life-dashboard-links",
  name: "life-dashboard-name",
  theme: "life-dashboard-theme"
};

const defaultLinks = [
  { name: "Google", url: "https://www.google.com" },
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "GitHub", url: "https://github.com" }
];

let tasks = JSON.parse(localStorage.getItem(storageKeys.tasks) || "[]");
let links = JSON.parse(localStorage.getItem(storageKeys.links) || "null") || defaultLinks;
let timerSeconds = 25 * 60;
let timerId = null;

const elements = {
  greeting: document.querySelector("#greeting"),
  currentDate: document.querySelector("#current-date"),
  currentTime: document.querySelector("#current-time"),
  timer: document.querySelector("#timer-display"),
  taskList: document.querySelector("#task-list"),
  taskCount: document.querySelector("#task-count"),
  taskForm: document.querySelector("#task-form"),
  taskInput: document.querySelector("#task-input"),
  links: document.querySelector("#quick-links"),
  linkForm: document.querySelector("#link-form"),
  linkName: document.querySelector("#link-name"),
  linkUrl: document.querySelector("#link-url"),
  toast: document.querySelector("#toast"),
  nameDialog: document.querySelector("#name-dialog"),
  nameForm: document.querySelector("#name-form"),
  nameInput: document.querySelector("#name-input")
};

function saveData() {
  localStorage.setItem(storageKeys.tasks, JSON.stringify(tasks));
  localStorage.setItem(storageKeys.links, JSON.stringify(links));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2800);
}

function updateClock() {
  const now = new Date();
  const hour = now.getHours();
  const name = localStorage.getItem(storageKeys.name) || "";
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
  elements.greeting.textContent = `${greeting}${name ? `, ${name}` : ""}!`;
  elements.currentTime.textContent = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  elements.currentDate.textContent = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function updateTimer() {
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
  const seconds = (timerSeconds % 60).toString().padStart(2, "0");
  elements.timer.textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = null;
}

function renderTasks() {
  elements.taskList.innerHTML = "";
  const remaining = tasks.filter((task) => !task.done).length;
  elements.taskCount.textContent = `${remaining} tugas aktif`;

  if (!tasks.length) {
    elements.taskList.innerHTML = '<li class="empty-state">Belum ada tugas. Mulai dari satu langkah kecil hari ini.</li>';
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;
    item.innerHTML = `
      <label class="task-main">
        <input type="checkbox" ${task.done ? "checked" : ""} aria-label="Selesaikan tugas" />
        <span></span>
      </label>
      <div class="task-actions">
        <button type="button" aria-label="Edit tugas">✎</button>
        <button type="button" aria-label="Hapus tugas">×</button>
      </div>`;
    item.querySelector("span").textContent = task.title;
    item.querySelector("input").addEventListener("change", () => {
      task.done = !task.done;
      saveData();
      renderTasks();
    });
    item.querySelectorAll("button")[0].addEventListener("click", () => editTask(task.id));
    item.querySelectorAll("button")[1].addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveData();
      renderTasks();
      showToast("Tugas dihapus.");
    });
    elements.taskList.append(item);
  });
}

function editTask(id) {
  const task = tasks.find((entry) => entry.id === id);
  const title = window.prompt("Ubah tugas:", task.title);
  if (title === null) return;
  const cleanTitle = title.trim();
  if (!cleanTitle) return showToast("Nama tugas tidak boleh kosong.");
  const duplicate = tasks.some((entry) => entry.id !== id && entry.title.toLowerCase() === cleanTitle.toLowerCase());
  if (duplicate) return showToast("Tugas yang sama sudah ada.");
  task.title = cleanTitle;
  saveData();
  renderTasks();
}

function renderLinks() {
  elements.links.innerHTML = "";
  links.forEach((link, index) => {
    const anchor = document.createElement("a");
    anchor.className = "quick-link";
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.innerHTML = `<span></span><button type="button" aria-label="Hapus ${link.name}">×</button>`;
    anchor.querySelector("span").textContent = link.name;
    anchor.querySelector("button").addEventListener("click", (event) => {
      event.preventDefault();
      links.splice(index, 1);
      saveData();
      renderLinks();
    });
    elements.links.append(anchor);
  });
}

document.querySelector("#start-timer").addEventListener("click", () => {
  if (timerId || timerSeconds === 0) return;
  timerId = window.setInterval(() => {
    timerSeconds -= 1;
    updateTimer();
    if (timerSeconds === 0) {
      stopTimer();
      showToast("Sesi fokus selesai. Kerja bagus!");
    }
  }, 1000);
});

document.querySelector("#stop-timer").addEventListener("click", () => {
  stopTimer();
  showToast("Timer dihentikan.");
});

document.querySelector("#reset-timer").addEventListener("click", () => {
  stopTimer();
  timerSeconds = 25 * 60;
  updateTimer();
});

elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.taskInput.value.trim();
  const duplicate = tasks.some((task) => task.title.toLowerCase() === title.toLowerCase());
  if (duplicate) return showToast("Tugas yang sama sudah ada.");
  tasks.unshift({ id: Date.now(), title, done: false });
  saveData();
  renderTasks();
  elements.taskForm.reset();
});

elements.linkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  links.push({ name: elements.linkName.value.trim(), url: elements.linkUrl.value.trim() });
  saveData();
  renderLinks();
  elements.linkForm.reset();
});

document.querySelector("#theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(storageKeys.theme, document.body.classList.contains("dark") ? "dark" : "light");
});

document.querySelector("#name-button").addEventListener("click", () => {
  elements.nameInput.value = localStorage.getItem(storageKeys.name) || "";
  elements.nameDialog.showModal();
});

document.querySelector("#close-name-dialog").addEventListener("click", () => {
  elements.nameDialog.close();
});

elements.nameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  localStorage.setItem(storageKeys.name, elements.nameInput.value.trim());
  elements.nameDialog.close();
  updateClock();
  showToast("Nama disimpan.");
});

if (localStorage.getItem(storageKeys.theme) !== "light") document.body.classList.add("dark");
saveData();
updateClock();
updateTimer();
renderTasks();
renderLinks();
window.setInterval(updateClock, 1000);
