/* ============================================================
   Render tampilan: sidebar, header proyek, timeline
   ============================================================ */
"use strict";

function renderAll(options) {
  const opts = options || {};
  const scroller = $("#timelineScroll");
  const keepScroll = opts.preserveScroll && scroller ? scroller.scrollLeft : null;

  renderSidebar();
  renderView();

  if (keepScroll != null) {
    const next = $("#timelineScroll");
    if (next) next.scrollLeft = keepScroll;
  }
}

/* ----------------------------- Sidebar ----------------------------- */
function renderSidebar() {
  const list = $("#projectList");
  const count = $("#projectCount");
  const team = state.settings.teamName || "Tim Saya";

  $("#brandTeamName").textContent = "Ruang Tim";
  $("#teamNameFoot").textContent = team;
  count.textContent = String(state.projects.length);

  const logoWrap = $("#teamLogo");
  if (state.settings.logo) {
    logoWrap.innerHTML = '<img src="' + state.settings.logo + '" alt="Logo tim">';
  } else {
    logoWrap.innerHTML = icon("layers");
  }

  const taskMenu = $("#tasksMenuBtn");
  if (taskMenu) taskMenu.classList.toggle("active", state.viewMode === "tasks");
  const notesMenu = $("#notesMenuBtn");
  if (notesMenu) notesMenu.classList.toggle("active", state.viewMode === "notes");

  const taskBadge = $("#tasksBadge");
  if (taskBadge && typeof taskStats === "function") {
    const ts = taskStats();
    const urgent = ts.urgent || 0;
    taskBadge.textContent = String(urgent || ts.open);
    taskBadge.hidden = ts.open === 0;
    taskBadge.classList.toggle("urgent", urgent > 0);
    taskBadge.title = urgent
      ? urgent + " tugas deadline kurang dari 24 jam"
      : ts.open + " tugas belum selesai";
  }

  if (!state.projects.length) {
    list.innerHTML = '<div style="padding:16px 12px;font-size:12px;line-height:1.6;color:#8199bd;">Belum ada proyek.<br>Klik <b style="color:#ffc46b">Tambah Proyek</b> untuk memulai.</div>';
    return;
  }

  list.innerHTML = state.projects.map((project) => {
    const stats = projectStats(project);
    const st = projectState(project);
    const active = project.id === state.activeProjectId && state.viewMode === "project" ? " active" : "";
    return (
      '<div class="project-item' + active + '" role="button" tabindex="0" data-act="select-project" data-id="' + project.id + '" title="' + esc(project.name) + '">' +
        '<span class="p-avatar" style="' + avatarStyle(project.name) + '">' + esc(initials(project.name)) + "</span>" +
        '<span class="p-info">' +
          '<span class="p-name">' + esc(project.name) + "</span>" +
          '<span class="p-meta">' +
            '<i class="p-bar"><i style="width:' + stats.pct + '%"></i></i>' +
            '<span class="p-count">' + stats.done + "/" + stats.total + "</span>" +
            '<span class="p-status" style="background:' + st.color + '" title="' + esc(st.label) + '"></span>' +
          "</span>" +
        "</span>" +
        '<button class="p-more" type="button" data-act="project-menu" data-id="' + project.id + '" title="Kelola proyek" aria-label="Kelola proyek">' +
          '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none"/></svg>' +
        "</button>" +
      "</div>"
    );
  }).join("");
}

/* ----------------------------- View ----------------------------- */
function renderView() {
  const view = $("#view");
  const project = activeProject();

  if (state.viewMode === "tasks") {
    view.innerHTML = renderTasksView();
    return;
  }

  if (state.viewMode === "notes") {
    view.innerHTML = renderNotesView();
    return;
  }

  if (!project) {
    view.innerHTML = emptyProjectsHTML();
    return;
  }

  const stats = projectStats(project);
  const st = projectState(project);
  const deadlinePassed = project.deadline && project.deadline < currentMonthISO() && stats.pct < 100;

  const deadlineChip = '<span class="chip ' + (deadlinePassed ? "orange" : "gray") + '">' +
    icon("calendar") + (deadlinePassed ? "Lewat batas · " : "Batas selesai · ") + esc(fmtMonth(project.deadline)) + "</span>";

  const stateChip = '<span class="chip ' + st.cls + '"><span class="dot ' + (st.key === "done" ? "green" : st.key === "running" ? "amber" : "gray") + '" style="width:7px;height:7px;border-radius:50%"></span>' + esc(st.label) + "</span>";

  view.innerHTML =
    '<header class="project-head">' +
      '<div class="eyebrow">' +
        '<span class="crumb">' + icon("folder") + "Proyek</span>" +
        deadlineChip +
        stateChip +
        '<span class="chip">' + icon("layers") + stats.total + " step</span>" +
      "</div>" +
      '<div class="head-row">' +
        '<div class="head-main">' +
          "<h1>" + esc(project.name) + "</h1>" +
          '<p class="desc' + (project.description ? "" : " empty") + '">' + (project.description ? esc(project.description) : "Belum ada deskripsi proyek.") + "</p>" +
        "</div>" +
        '<div class="head-actions">' +
          '<button class="btn" type="button" data-act="edit-project" data-id="' + project.id + '">' + icon("pencil") + "Edit proyek</button>" +
          '<button class="btn primary" type="button" data-act="add-step">' + icon("plus") + "Tambah Step</button>" +
          '<button class="btn dark" type="button" data-act="open-report" data-id="' + project.id + '">' + icon("print") + "Cetak Lembar Kerja</button>" +
        "</div>" +
      "</div>" +
      '<div class="head-stats">' +
        '<div class="progress-wrap">' +
          '<span class="progress-num">' + stats.pct + "<small>%</small></span>" +
          '<div class="progress-track" role="progressbar" aria-valuenow="' + stats.pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + stats.pct + '%"></i></div>' +
        "</div>" +
        '<div class="stat-list">' +
          '<span class="stat"><i class="dot green"></i><b>' + stats.done + "</b> Selesai</span>" +
          '<span class="stat"><i class="dot amber"></i><b>' + stats.active + "</b> Berjalan</span>" +
          '<span class="stat"><i class="dot gray"></i><b>' + stats.todo + "</b> Belum</span>" +
        "</div>" +
      "</div>" +
    "</header>" +
    timelineHTML(project, stats);

  requestAnimationFrame(() => {
    const track = $(".progress-track i");
    if (track) track.style.width = stats.pct + "%";
  });
}

function timelineHTML(project, stats) {
  const steps = project.steps;

  const head =
    '<div class="card-head">' +
      '<div class="card-title">' +
        "<h2>Alur &amp; Timeline</h2>" +
        '<span class="tag">' + steps.length + " step</span>" +
        (steps.length ? '<span class="hint">' + icon("grip") + "Geser kartu untuk mengubah urutan</span>" : "") +
      "</div>" +
      (steps.length ? '<button class="btn sm" type="button" data-act="add-step">' + icon("plus") + "Tambah step</button>" : "") +
    "</div>";

  let body;
  if (!steps.length) {
    body =
      '<div class="empty-timeline">' +
        '<div class="hint-box">' +
          icon("layers") +
          "<b>Belum ada step di proyek ini</b>" +
          "<span>Tambahkan step pertama, lalu tentukan status dan deadlinenya. Timeline akan muncul otomatis di sini.</span>" +
          '<button class="btn primary" type="button" data-act="add-step">' + icon("plus") + "Tambah step pertama</button>" +
        "</div>" +
      "</div>";
  } else {
    body =
      '<div class="timeline-scroll" id="timelineScroll">' +
        '<div class="timeline" id="timeline">' +
          steps.map(stepHTML).join("") +
          '<div class="step-add">' +
            '<div class="rail"><span class="dot"></span></div>' +
            '<button class="add-card" type="button" data-act="add-step">' +
              '<span class="plus-circle">' + icon("plus") + "</span>" +
              "Tambah Step" +
            "</button>" +
          "</div>" +
        "</div>" +
      "</div>";
  }

  return '<section class="card">' + head + body + "</section>";
}

function stepHTML(step, index) {
  const overdue = step.deadline && step.deadline < todayISO() && step.status !== "done";
  const status = STATUS[step.status] || STATUS.todo;

  return (
    '<div class="step" data-id="' + step.id + '" data-status="' + step.status + '">' +
      '<div class="rail"><span class="dot"></span></div>' +
      '<article class="step-card" title="Klik dua kali untuk mengedit">' +
        '<div class="step-top">' +
          '<span class="step-top-left">' +
            '<button class="drag-handle" type="button" aria-label="Geser step" title="Geser untuk ubah urutan">' + icon("grip") + "</button>" +
            '<span class="step-idx">' + pad2(index + 1) + "</span>" +
          "</span>" +
          '<span class="step-tools">' +
            '<button class="tool-btn" type="button" data-act="edit-step" data-id="' + step.id + '" title="Edit step" aria-label="Edit step">' + icon("pencil") + "</button>" +
            '<button class="tool-btn danger" type="button" data-act="delete-step" data-id="' + step.id + '" title="Hapus step" aria-label="Hapus step">' + icon("trash") + "</button>" +
          "</span>" +
        "</div>" +
        '<h3 class="step-title">' + esc(step.name) + "</h3>" +
        (step.description ? '<p class="step-desc">' + esc(step.description) + "</p>" : "") +
        '<div class="step-foot">' +
          '<button class="status-pill ' + step.status + '" type="button" data-act="cycle-status" data-id="' + step.id + '" title="Klik untuk mengubah status (' + status.label + ')">' +
            '<span class="dot"></span>' + status.pill +
          "</button>" +
          '<span class="date-tag' + (overdue ? " overdue" : "") + '" title="Deadline step">' + icon("calendar") + (step.deadline ? fmtDate(step.deadline) : "Tanpa tanggal") + "</span>" +
        "</div>" +
      "</article>" +
    "</div>"
  );
}

function emptyProjectsHTML() {
  return (
    '<div class="card" style="margin-top:0">' +
      '<div class="empty-wrap">' +
        '<div class="empty-art">' + icon("layers") + "</div>" +
        "<h2>Mulai susun kinerja tim Anda</h2>" +
        "<p>Buat proyek pertama, pecah menjadi step, atur status dan deadline, lalu cetak lembar kerja dalam resolusi HD.</p>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">' +
          '<button class="btn primary" type="button" data-act="add-project">' + icon("plus") + "Tambah Proyek</button>" +
          '<button class="btn" type="button" data-act="load-sample">' + icon("download") + "Muat contoh proyek</button>" +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

/* ----------------------------- Sidebar mobile ----------------------------- */
function openSidebar() {
  $("#sidebar").classList.add("open");
  $("#sidebarBackdrop").classList.add("show");
}

function closeSidebar() {
  $("#sidebar").classList.remove("open");
  $("#sidebarBackdrop").classList.remove("show");
}

function toggleSidebar() {
  if ($("#sidebar").classList.contains("open")) closeSidebar();
  else openSidebar();
}
