/* ============================================================
   Menu Catatan
   Catatan pribadi yang tersimpan otomatis saat diketik.
   Judul diambil dari baris pertama isi catatan.
   ============================================================ */
"use strict";

function noteTitle(text) {
  const line = String(text || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((item) => item.trim())
    .find(Boolean) || "";
  const clean = line.replace(/^#{1,6}\s*/, "").replace(/^[-*]\s+/, "").trim();
  return clean ? clean.slice(0, 90) : "Catatan baru";
}

function notePreview(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const first = lines.findIndex((line) => line.trim());
  if (first < 0) return "Belum ada isi catatan.";
  const rest = lines.slice(first + 1).map((line) => line.trim()).filter(Boolean).join(" ");
  return rest ? rest.slice(0, 190) : "Tidak ada isi tambahan.";
}

function fmtNoteTime(ts) {
  const date = new Date(ts || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function sortedNotes() {
  return [...state.notes].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function openNotesView() {
  state.viewMode = "notes";
  saveState();
  closeSidebar();
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function noteCardHTML(note) {
  return (
    '<article class="note-card" data-act="edit-note" data-id="' + note.id + '" role="button" tabindex="0" aria-label="Buka catatan ' + esc(noteTitle(note.text)) + '">' +
      '<div class="note-card-top">' +
        '<span class="note-dot" aria-hidden="true"></span>' +
        '<time class="note-time">' + esc(fmtNoteTime(note.updatedAt)) + "</time>" +
        '<button class="tool-btn danger note-delete" type="button" data-act="delete-note" data-id="' + note.id + '" title="Hapus catatan" aria-label="Hapus catatan">' + icon("trash") + "</button>" +
      "</div>" +
      '<h3 class="note-title">' + esc(noteTitle(note.text)) + "</h3>" +
      '<p class="note-preview">' + esc(notePreview(note.text)) + "</p>" +
      '<div class="note-card-foot">' +
        '<span class="note-auto">' + icon("check") + "Tersimpan otomatis</span>" +
        '<span class="note-open">Buka ' + icon("chevronRight") + "</span>" +
      "</div>" +
    "</article>"
  );
}

function renderNotesView() {
  const notes = sortedNotes();
  const head =
    '<header class="project-head notes-head">' +
      '<div class="eyebrow">' +
        '<span class="crumb">' + icon("home") + "Menu</span>" +
        '<span class="chip blue">' + icon("user") + "Pribadi</span>" +
        '<span class="chip gray">' + icon("check") + "Tersimpan otomatis</span>" +
      "</div>" +
      '<div class="head-row">' +
        '<div class="head-main">' +
          "<h1>Catatan</h1>" +
          '<p class="desc">Catatan cepat di luar proyek. Baris pertama otomatis menjadi judul, dan setiap perubahan langsung tersimpan.</p>' +
        "</div>" +
        '<div class="head-actions">' +
          '<button class="btn primary" type="button" data-act="add-note">' + icon("plus") + "Tambah Catatan</button>" +
        "</div>" +
      "</div>" +
    "</header>";

  if (!notes.length) {
    return head +
      '<section class="card notes-card">' +
        '<div class="empty-wrap notes-empty">' +
          '<div class="empty-art">' + icon("fileText") + "</div>" +
          "<h2>Belum ada catatan</h2>" +
          "<p>Tulis catatan pertama Anda. Tidak perlu tombol simpan—isi catatan tersimpan otomatis dan bisa dibuka kembali kapan saja.</p>" +
          '<button class="btn primary" type="button" data-act="add-note">' + icon("plus") + "Tambah Catatan</button>" +
        "</div>" +
      "</section>";
  }

  return head +
    '<section class="card notes-card">' +
      '<div class="card-head notes-card-head">' +
        '<div class="card-title"><h2>Semua Catatan</h2><span class="tag">' + notes.length + " catatan</span></div>" +
        '<button class="btn sm" type="button" data-act="add-note">' + icon("plus") + "Tambah catatan</button>" +
      "</div>" +
      '<div class="notes-grid">' + notes.map(noteCardHTML).join("") + "</div>" +
    "</section>";
}

function createNote() {
  state.viewMode = "notes";
  const note = normalizeNote({ text: "", createdAt: Date.now(), updatedAt: Date.now() });
  state.notes.unshift(note);
  saveState();
  renderAll();
  openNoteEditor(note, true);
}

function openNoteEditor(note, isNew) {
  if (!note) return;
  state.viewMode = "notes";
  saveState();

  const overlay = openModal({
    title: isNew ? "Catatan baru" : "Edit catatan",
    subtitle: "Judul diambil dari baris pertama. Perubahan tersimpan otomatis saat Anda mengetik.",
    width: 720,
    body:
      '<form id="noteForm" novalidate>' +
        '<div class="field">' +
          '<label for="note-text">Isi catatan <span class="opt">baris pertama menjadi judul</span></label>' +
          '<textarea class="textarea note-editor" id="note-text" name="text" rows="14" maxlength="20000" placeholder="Tulis catatan di sini. Baris pertama akan menjadi judul…">' + esc(note.text) + "</textarea>" +
          '<p class="form-hint note-title-hint">Judul: <b id="noteTitleHint">' + esc(noteTitle(note.text)) + "</b></p>" +
        "</div>" +
      "</form>",
    footer:
      '<div class="left">' +
        (isNew ? "" : '<button class="btn sm danger" type="button" data-x="delete-note">' + icon("trash") + "Hapus catatan</button>") +
        '<span class="note-save-status" id="noteSaveStatus">' + icon("check") + "Tersimpan otomatis</span>" +
      "</div>" +
      '<span class="note-count" id="noteCharCount">' + String(note.text || "").length + " karakter</span>" +
      '<button class="btn primary" type="button" data-close>' + icon("check") + "Selesai</button>",
    onClose: () => {
      clearTimeout(saveTimer);
      if (!note.text.trim()) {
        state.notes = state.notes.filter((item) => item.id !== note.id);
      }
      saveState();
      state.viewMode = "notes";
      renderAll();
    }
  });

  const textarea = $("#note-text", overlay);
  const status = $("#noteSaveStatus", overlay);
  const count = $("#noteCharCount", overlay);
  const titleHint = $("#noteTitleHint", overlay);
  let saveTimer = null;

  const updateMeta = () => {
    count.textContent = String(textarea.value.length) + " karakter";
    titleHint.textContent = noteTitle(textarea.value);
  };

  const persist = () => {
    note.text = textarea.value;
    note.updatedAt = Date.now();
    saveState();
    status.classList.remove("saving");
    status.innerHTML = icon("check") + "Tersimpan otomatis";
  };

  textarea.addEventListener("input", () => {
    note.text = textarea.value;
    note.updatedAt = Date.now();
    updateMeta();
    status.classList.add("saving");
    status.innerHTML = "Menyimpan…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 260);
  });

  overlay.addEventListener("click", async (event) => {
    const btn = event.target.closest('[data-x="delete-note"]');
    if (!btn) return;
    const yes = await confirmDialog({
      title: "Hapus catatan?",
      message: 'Catatan "' + noteTitle(note.text) + '" akan dihapus permanen.',
      confirmText: "Hapus catatan"
    });
    if (!yes) return;
    clearTimeout(saveTimer);
    state.notes = state.notes.filter((item) => item.id !== note.id);
    saveState();
    closeModal();
    renderAll();
    toast("Catatan dihapus.");
  });

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  });
}

function deleteNoteById(noteId) {
  const note = state.notes.find((item) => item.id === noteId);
  if (!note) return;
  confirmDialog({
    title: "Hapus catatan?",
    message: 'Catatan "' + noteTitle(note.text) + '" akan dihapus permanen.',
    confirmText: "Hapus catatan"
  }).then((yes) => {
    if (!yes) return;
    state.notes = state.notes.filter((item) => item.id !== note.id);
    saveState();
    renderAll();
    toast("Catatan dihapus.");
  });
}
