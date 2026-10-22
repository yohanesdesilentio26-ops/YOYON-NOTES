/* ============================================================
   Event aplikasi: aksi, drag & drop, keyboard
   ============================================================ */
"use strict";

let drag = null;

function onAppClick(event) {
  const el = event.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act;
  const id = el.dataset.id;
  const project = activeProject();

  switch (act) {
    case "add-project":
      openProjectModal(null);
      break;
    case "open-tasks":
      openTasksView();
      break;
    case "open-notes":
      openNotesView();
      break;
    case "add-note":
      createNote();
      break;
    case "edit-note": {
      const note = state.notes.find((item) => item.id === id);
      if (note) openNoteEditor(note, false);
      break;
    }
    case "delete-note":
      deleteNoteById(id);
      break;
    case "add-task":
      openTaskModal(null);
      break;
    case "edit-task": {
      const task = state.tasks.find((item) => item.id === id);
      if (task) openTaskModal(task);
      break;
    }
    case "delete-task":
      deleteTaskById(id);
      break;
    case "toggle-task":
      toggleTask(id);
      break;
    case "settings":
      openSettingsModal();
      break;
    case "select-project":
      if (id && (id !== state.activeProjectId || state.viewMode !== "project")) setActiveProject(id);
      else closeSidebar();
      break;
    case "project-menu": {
      const target = state.projects.find((item) => item.id === id);
      if (target) openProjectModal(target);
      break;
    }
    case "edit-project":
      if (project) openProjectModal(project);
      break;
    case "add-step":
      if (project) openStepModal(null);
      break;
    case "edit-step": {
      const step = project ? findStep(project, id) : null;
      if (step) openStepModal(step);
      break;
    }
    case "delete-step":
      deleteStepById(id);
      break;
    case "cycle-status":
      cycleStatus(id);
      break;
    case "open-report":
      openReportForm();
      break;
    case "load-sample":
      loadSampleProject();
      break;
    case "toggle-sidebar":
      toggleSidebar();
      break;
    case "close-sidebar":
      closeSidebar();
      break;
    default:
      break;
  }
}

function deleteStepById(stepId) {
  const project = activeProject();
  const step = project ? findStep(project, stepId) : null;
  if (!step) return;
  confirmDialog({
    title: "Hapus step?",
    message: 'Step "' + step.name + '" akan dihapus dari timeline proyek.',
    confirmText: "Hapus step"
  }).then((yes) => {
    if (!yes) return;
    project.steps = project.steps.filter((item) => item.id !== stepId);
    saveState();
    renderAll({ preserveScroll: true });
    toast("Step dihapus.");
  });
}

function cycleStatus(stepId) {
  const project = activeProject();
  const step = project ? findStep(project, stepId) : null;
  if (!step) return;
  const index = STATUS_ORDER.indexOf(step.status);
  step.status = STATUS_ORDER[(index + 1) % STATUS_ORDER.length];
  saveState();
  renderAll({ preserveScroll: true });
  toast("Status step: " + STATUS[step.status].label + ".");
}

/* ------------------------- Drag & drop ------------------------- */
function onPointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  const card = event.target.closest(".step-card");
  if (!card) return;

  const handle = event.target.closest(".drag-handle");
  if (!handle && event.target.closest("button, a, input, textarea, select")) return;

  const stepEl = card.closest(".step");
  if (!stepEl) return;

  /* Di layar sentuh, geser hanya lewat handle agar scroll tetap nyaman */
  if (event.pointerType !== "mouse" && !handle) return;

  drag = {
    stepEl,
    card,
    startX: event.clientX,
    startY: event.clientY,
    pointerX: event.clientX,
    active: false,
    pointerId: event.pointerId,
    scroller: $("#timelineScroll"),
    timer: null
  };

  try { card.setPointerCapture(event.pointerId); } catch (err) { /* abaikan */ }
  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerup", onPointerUp);
  card.addEventListener("pointercancel", onPointerUp);
}

function onPointerMove(event) {
  if (!drag) return;
  drag.pointerX = event.clientX;
  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;

  if (!drag.active) {
    if (Math.hypot(dx, dy) < 7) return;
    if (event.pointerType !== "mouse" && Math.abs(dx) <= Math.abs(dy)) {
      cleanupDrag();
      return;
    }
    drag.active = true;
    drag.stepEl.classList.add("dragging");
    document.body.classList.add("is-dragging");
    if (drag.scroller) drag.scroller.classList.add("dragging-active");
    drag.timer = setInterval(() => {
      if (drag && drag.active) autoScrollTimeline(drag.pointerX);
    }, 30);
  }

  event.preventDefault();
  const timeline = $("#timeline");
  if (!timeline) return;

  const siblings = $$(".step", timeline);
  const target = siblings.find((el) => {
    const rect = el.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right;
  });

  if (target && target !== drag.stepEl) {
    const rect = target.getBoundingClientRect();
    const before = event.clientX < rect.left + rect.width / 2;
    const reference = before ? target : target.nextElementSibling;
    if (reference !== drag.stepEl) timeline.insertBefore(drag.stepEl, reference);
  }

  autoScrollTimeline(event.clientX);
}

function autoScrollTimeline(x) {
  if (!drag || !drag.scroller) return;
  const scroller = drag.scroller;
  const rect = scroller.getBoundingClientRect();
  const edge = 90;
  let delta = 0;
  if (x < rect.left + edge) delta = -Math.ceil((rect.left + edge - x) / 5);
  else if (x > rect.right - edge) delta = Math.ceil((x - (rect.right - edge)) / 5);
  if (delta) {
    scroller.scrollLeft = clamp(scroller.scrollLeft + delta, 0, scroller.scrollWidth);
  }
}

function onPointerUp() {
  if (!drag) return;
  const wasActive = drag.active;
  const timeline = $("#timeline");
  let ids = null;

  if (wasActive && timeline) {
    ids = $$(".step", timeline).map((el) => el.dataset.id);
  }
  cleanupDrag();

  if (!wasActive || !ids) return;
  const project = activeProject();
  if (!project) return;

  const order = new Map(ids.map((id, i) => [id, i]));
  project.steps.sort((a, b) => {
    const ai = order.has(a.id) ? order.get(a.id) : 999;
    const bi = order.has(b.id) ? order.get(b.id) : 999;
    return ai - bi;
  });
  saveState();
  $$(".step", timeline).forEach((el, i) => {
    const idx = el.querySelector(".step-idx");
    if (idx) idx.textContent = pad2(i + 1);
  });
  toast("Urutan step diperbarui.");
}

function cleanupDrag() {
  if (!drag) return;
  if (drag.timer) clearInterval(drag.timer);
  drag.card.removeEventListener("pointermove", onPointerMove);
  drag.card.removeEventListener("pointerup", onPointerUp);
  drag.card.removeEventListener("pointercancel", onPointerUp);
  drag.stepEl.classList.remove("dragging");
  document.body.classList.remove("is-dragging");
  if (drag.scroller) drag.scroller.classList.remove("dragging-active");
  drag = null;
}

/* ------------------------- Keyboard ------------------------- */
function onAppKeydown(event) {  if (event.key === "Escape") {
    if (document.querySelector(".confirm-overlay")) return;
    if (modal) { closeModal(); return; }
    if (drag) { cleanupDrag(); renderAll({ preserveScroll: true }); return; }
    closeSidebar();
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") return;
  const noteCard = event.target.closest('[data-act="edit-note"]');
  if (noteCard && !event.target.closest("button")) {
    event.preventDefault();
    const note = state.notes.find((item) => item.id === noteCard.dataset.id);
    if (note) openNoteEditor(note, false);
    return;
  }
  const item = event.target.closest('[data-act="select-project"]');
  if (!item || event.target.closest("button")) return;
  event.preventDefault();
  setActiveProject(item.dataset.id);
}

function onAppDoubleClick(event) {
  if (event.target.closest("button, a, input, textarea, select")) return;
  const card = event.target.closest(".step-card");
  if (!card) return;
  const stepEl = card.closest(".step");
  const project = activeProject();
  if (!project || !stepEl) return;
  const step = findStep(project, stepEl.dataset.id);
  if (step) openStepModal(step);
}

function initApp() {
  document.addEventListener("click", onAppClick);
  document.addEventListener("keydown", onAppKeydown);
  document.addEventListener("dblclick", onAppDoubleClick);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("wheel", onTimelineWheel, { passive: false });
  renderAll();
}

function onTimelineWheel(event) {
  const scroller = event.target.closest(".timeline-scroll");
  if (!scroller) return;
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  if (scroller.scrollWidth <= scroller.clientWidth + 2) return;
  const atStart = scroller.scrollLeft <= 0 && event.deltaY < 0;
  const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1 && event.deltaY > 0;
  if (atStart || atEnd) return;
  event.preventDefault();
  scroller.scrollLeft += event.deltaY;
}
