/* ============================================================
   Menu Tugas Saya
   ============================================================ */
"use strict";

const TASK_URGENT_MS = 24 * 60 * 60 * 1000;

function taskDeadlineBounds(task) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((task && task.deadline) || "");
  if (!match) return null;
  const start = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0);
  const end = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 23, 59, 59, 999);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

/* Mendesak = belum selesai, belum lewat, dan deadline tinggal <= 24 jam. */
function isTaskUrgent(task) {
  if (!task || task.done) return false;
  const bounds = taskDeadlineBounds(task);
  if (!bounds) return false;
  const now = Date.now();
  return bounds.end.getTime() >= now && (bounds.start.getTime() - now) <= TASK_URGENT_MS;
}

function taskStats() {
  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.done).length;
  const open = total - done;
  const overdue = state.tasks.filter((t) => !t.done && t.deadline && t.deadline < todayISO()).length;
  const urgent = state.tasks.filter(isTaskUrgent).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { total, done, open, overdue, urgent, pct };
}

function sortedTasks() {
  return [...state.tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const da = a.deadline || "9999-12-31";
    const db = b.deadline || "9999-12-31";
    if (da !== db) return da < db ? -1 : 1;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
}

function openTasksView() {
  state.viewMode = "tasks";
  saveState();
  closeSidebar();
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTasksView() {
  const stats = taskStats();
  const tasks = sortedTasks();
  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  const head =
    '<header class="project-head tasks-head">' +
      '<div class="eyebrow">' +
        '<span class="crumb">' + icon("home") + "Menu</span>" +
        '<span class="chip blue">' + icon("user") + "Pribadi</span>" +
        (stats.urgent ? '<span class="chip red">' + icon("alert") + stats.urgent + " mendesak</span>" : "") +
        '<span class="chip gray">' + icon("checkSquare") + stats.open + " belum selesai</span>" +
      "</div>" +
      '<div class="head-row">' +
        '<div class="head-main">' +
          "<h1>Tugas Saya</h1>" +
          '<p class="desc">Catatan tugas harian di luar proyek — lengkap dengan asal tugas, deadline, dan ceklis selesai.</p>' +
        "</div>" +
        '<div class="head-actions">' +
          '<button class="btn primary" type="button" data-act="add-task">' + icon("plus") + "Tambah Tugas</button>" +
        "</div>" +
      "</div>" +
      '<div class="head-stats">' +
        '<div class="progress-wrap">' +
          '<span class="progress-num">' + stats.pct + "<small>%</small></span>" +
          '<div class="progress-track" role="progressbar" aria-valuenow="' + stats.pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + stats.pct + '%"></i></div>' +
        "</div>" +
        '<div class="stat-list">' +
          '<span class="stat"><i class="dot gray"></i><b>' + stats.open + "</b> Belum</span>" +
          '<span class="stat"><i class="dot green"></i><b>' + stats.done + "</b> Selesai</span>" +
          (stats.urgent ? '<span class="stat"><i class="dot red"></i><b>' + stats.urgent + "</b> Mendesak</span>" : "") +
          '<span class="stat"><i class="dot" style="background:#e05252"></i><b>' + stats.overdue + "</b> Terlambat</span>" +
        "</div>" +
      "</div>" +
    "</header>";

  if (!tasks.length) {
    return head +
      '<section class="card tasks-card">' +
        '<div class="empty-wrap">' +
          '<div class="empty-art">' + icon("checkSquare") + "</div>" +
          "<h2>Belum ada tugas</h2>" +
          "<p>Tambahkan tugas pertama Anda. Isi nama tugas, dari siapa tugas itu datang, deskripsi, dan tanggal deadline.</p>" +
          '<button class="btn primary" type="button" data-act="add-task">' + icon("plus") + "Tambah Tugas</button>" +
        "</div>" +
      "</section>";
  }

  const section = (title, items, key) => {
    if (!items.length) return "";
    return (
      '<div class="task-section">' +
        '<div class="task-section-head">' +
          '<span class="task-section-dot ' + key + '"></span>' +
          "<span>" + title + "</span>" +
          "<b>" + items.length + "</b>" +
        "</div>" +
        '<div class="task-list">' + items.map(taskRowHTML).join("") + "</div>" +
      "</div>"
    );
  };

  return head +
    '<section class="card tasks-card">' +
      '<div class="card-head tasks-card-head">' +
        '<div class="card-title"><h2>Daftar Tugas</h2><span class="tag">' + tasks.length + " tugas</span></div>" +
        '<button class="btn sm" type="button" data-act="add-task">' + icon("plus") + "Tambah tugas</button>" +
      "</div>" +
      '<div class="tasks-body">' +
        section("Belum selesai", openTasks, "open") +
        section("Selesai", doneTasks, "done") +
      "</div>" +
    "</section>";
}

function taskRowHTML(task) {
  const overdue = !task.done && task.deadline && task.deadline < todayISO();
  const urgent = isTaskUrgent(task);
  const from = task.from ? '<span class="task-meta-item">' + icon("user") + "Dari " + esc(task.from) + "</span>" : "";
  const deadline = task.deadline
    ? '<span class="date-tag' + (overdue ? " overdue" : urgent ? " urgent" : "") + '">' + icon("calendar") + fmtDate(task.deadline) + (overdue ? " · lewat" : urgent ? " · &lt;24 jam" : "") + "</span>"
    : '<span class="task-meta-item muted">' + icon("calendar") + "Tanpa deadline</span>";

  return (
    '<article class="task-row' + (task.done ? " done" : "") + (overdue ? " overdue" : "") + (urgent ? " urgent" : "") + '">' +
      '<button class="task-check" type="button" data-act="toggle-task" data-id="' + task.id + '" role="checkbox" aria-checked="' + (task.done ? "true" : "false") + '" title="' + (task.done ? "Tandai belum selesai" : "Tandai selesai") + '">' +
        (task.done ? icon("check") : "") +
      "</button>" +
      '<div class="task-main">' +
        '<h3 class="task-name">' + esc(task.name) + "</h3>" +
        (task.description ? '<p class="task-desc">' + esc(task.description) + "</p>" : "") +
        '<div class="task-meta">' + deadline + from + "</div>" +
      "</div>" +
      '<div class="task-actions">' +
        '<button class="tool-btn" type="button" data-act="edit-task" data-id="' + task.id + '" title="Edit tugas" aria-label="Edit tugas">' + icon("pencil") + "</button>" +
        '<button class="tool-btn danger" type="button" data-act="delete-task" data-id="' + task.id + '" title="Hapus tugas" aria-label="Hapus tugas">' + icon("trash") + "</button>" +
      "</div>" +
    "</article>"
  );
}

function openTaskModal(task) {
  const isEdit = !!task;
  const t = task || { name: "", from: "", description: "", deadline: "", done: false };

  const body =
    '<form id="taskForm" novalidate>' +
      '<div class="field">' +
        '<label for="tf-name">Nama tugas <span class="opt">wajib</span></label>' +
        '<input class="input" id="tf-name" name="name" maxlength="120" autocomplete="off" placeholder="Contoh: Menyusun laporan mingguan" value="' + esc(t.name) + '">' +
        '<div class="form-error" id="tf-name-error">Nama tugas wajib diisi.</div>' +
      "</div>" +
      '<div class="row-2">' +
        '<div class="field">' +
          '<label for="tf-from">Tugas dari siapa <span class="opt">opsional</span></label>' +
          '<input class="input" id="tf-from" name="from" maxlength="60" autocomplete="off" placeholder="Contoh: Pak Budi" value="' + esc(t.from) + '">' +
        "</div>" +
        '<div class="field">' +
          '<label for="tf-deadline">Tanggal deadline <span class="opt">opsional</span></label>' +
          '<input class="input" type="date" id="tf-deadline" name="deadline" value="' + esc(t.deadline || "") + '">' +
        "</div>" +
      "</div>" +
      '<div class="field">' +
        '<label for="tf-desc">Deskripsi <span class="opt">opsional</span></label>' +
        '<textarea class="textarea" id="tf-desc" name="description" rows="3" maxlength="500" placeholder="Detail atau catatan tugas…">' + esc(t.description) + "</textarea>" +
      "</div>" +
      '<label class="check-line">' +
        '<input type="checkbox" name="done"' + (t.done ? " checked" : "") + ">" +
        '<span><b>Sudah selesai</b><small>Tandai jika tugas ini sudah dikerjakan.</small></span>' +
      "</label>" +
    "</form>";

  const footer =
    '<div class="left">' +
      (isEdit ? '<button class="btn sm danger" type="button" data-x="delete">' + icon("trash") + "Hapus tugas</button>" : "") +
    "</div>" +
    '<button class="btn" type="button" data-close>Batal</button>' +
    '<button class="btn primary" type="submit" form="taskForm">' + icon(isEdit ? "check" : "plus") + (isEdit ? "Simpan" : "Tambah tugas") + "</button>";

  const overlay = openModal({
    title: isEdit ? "Edit tugas" : "Tambah tugas",
    subtitle: "Tugas pribadi yang tampil di menu Tugas Saya.",
    body,
    footer,
    width: 560
  });

  overlay.addEventListener("click", async (event) => {
    const btn = event.target.closest('[data-x="delete"]');
    if (!btn) return;
    const yes = await confirmDialog({
      title: "Hapus tugas?",
      message: 'Tugas "' + task.name + '" akan dihapus permanen.',
      confirmText: "Hapus tugas"
    });
    if (!yes) return;
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
    saveState();
    closeModal();
    renderAll();
    toast("Tugas dihapus.");
  });

  const form = $("#taskForm", overlay);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = form.elements.name;
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.classList.add("invalid");
      $("#tf-name-error", overlay).classList.add("show");
      nameInput.focus();
      return;
    }
    const data = {
      name,
      from: form.elements.from.value.trim(),
      description: form.elements.description.value.trim(),
      deadline: form.elements.deadline.value || "",
      done: form.elements.done.checked
    };

    if (isEdit) {
      Object.assign(task, data);
      toast("Tugas diperbarui.");
    } else {
      state.tasks.unshift({ id: uid(), createdAt: Date.now(), ...data });
      toast("Tugas baru ditambahkan.");
    }
    state.viewMode = "tasks";
    saveState();
    closeModal();
    renderAll();
  });

  form.elements.name.addEventListener("input", () => {
    if (!form.elements.name.value.trim()) return;
    form.elements.name.classList.remove("invalid");
    const err = $("#tf-name-error", overlay);
    if (err) err.classList.remove("show");
  });
}

function toggleTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.done = !task.done;
  saveState();
  renderAll();
  toast(task.done ? "Tugas ditandai selesai." : "Tugas dibuka kembali.");
}

function deleteTaskById(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  confirmDialog({
    title: "Hapus tugas?",
    message: 'Tugas "' + task.name + '" akan dihapus permanen.',
    confirmText: "Hapus tugas"
  }).then((yes) => {
    if (!yes) return;
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
    saveState();
    renderAll();
    toast("Tugas dihapus.");
  });
}
