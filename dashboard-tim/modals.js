/* ============================================================
   Modal umum, dialog konfirmasi, dan modal proyek
   ============================================================ */
"use strict";

let modal = null;
let lastFocused = null;

function openModal(options) {
  closeModal();
  lastFocused = document.activeElement;

  const root = $("#modalRoot");
  const width = options.width || 540;
  root.innerHTML =
    '<div class="modal-overlay" data-overlay>' +
      '<div class="modal ' + (options.className || "") + '" style="--mw:' + width + 'px" role="dialog" aria-modal="true" aria-label="' + esc(options.title || "Dialog") + '">' +
        '<header class="modal-head">' +
          '<div class="ht"><h2>' + esc(options.title || "") + "</h2>" + (options.subtitle ? "<p>" + esc(options.subtitle) + "</p>" : "") + "</div>" +
          '<button class="icon-btn" type="button" data-close aria-label="Tutup">' + icon("x") + "</button>" +
        "</header>" +
        '<div class="modal-body">' + (options.body || "") + "</div>" +
        (options.footer ? '<footer class="modal-foot">' + options.footer + "</footer>" : "") +
      "</div>" +
    "</div>";

  const overlay = root.firstElementChild;
  modal = { el: overlay, onClose: options.onClose || null };

  overlay.addEventListener("mousedown", (event) => {
    if (event.target === overlay) closeModal();
  });
  overlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) closeModal();
  });

  setTimeout(() => {
    const focusTarget = overlay.querySelector("input:not([type=file]), textarea, select, [data-close]");
    if (focusTarget) focusTarget.focus();
  }, 50);

  return overlay;
}

function closeModal() {
  if (!modal) return;
  const current = modal;
  modal = null;
  if (typeof current.onClose === "function") {
    try { current.onClose(); } catch (err) { console.warn(err); }
  }
  current.el.remove();
  $("#modalRoot").innerHTML = "";
  if (lastFocused && lastFocused.focus && document.contains(lastFocused)) {
    try { lastFocused.focus(); } catch (err) { /* abaikan */ }
  }
  lastFocused = null;
}

function confirmDialog(options) {
  const opts = options || {};
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "modal-overlay confirm-overlay";
    wrap.innerHTML =
      '<div class="modal" style="--mw:430px" role="alertdialog" aria-modal="true">' +
        '<div class="modal-body" style="padding-top:22px">' +
          "<h2 style=\"margin:0 0 6px;font-size:17px;letter-spacing:-.2px\">" + esc(opts.title || "Yakin?") + "</h2>" +
          '<p style="margin:0;font-size:13px;line-height:1.6;color:#7b8798">' + esc(opts.message || "Tindakan ini tidak bisa dibatalkan.") + "</p>" +
        "</div>" +
        '<footer class="modal-foot">' +
          '<button class="btn" type="button" data-c="no">Batal</button>' +
          '<button class="btn ' + (opts.danger === false ? "primary" : "danger") + '" type="button" data-c="yes">' + esc(opts.confirmText || "Hapus") + "</button>" +
        "</footer>" +
      "</div>";
    document.body.appendChild(wrap);

    let closed = false;
    const done = (value) => {
      if (closed) return;
      closed = true;
      wrap.remove();
      document.removeEventListener("keydown", onKey, true);
      resolve(value);
    };
    const onKey = (event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); done(false); }
      if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); done(true); }
    };
    document.addEventListener("keydown", onKey, true);

    wrap.addEventListener("click", (event) => {
      if (event.target === wrap) return done(false);
      const btn = event.target.closest("[data-c]");
      if (btn) done(btn.dataset.c === "yes");
    });
    setTimeout(() => {
      const yes = wrap.querySelector('[data-c="yes"]');
      if (yes) yes.focus();
    }, 50);
  });
}

/* ------------------------- Gambar ------------------------- */
function readImage(file, maxWidth, quality, mime) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      return reject(new Error("Pilih file gambar (JPG atau PNG)."));
    }
    if (file.size > 12 * 1024 * 1024) {
      return reject(new Error("Ukuran gambar terlalu besar (maksimal 12 MB)."));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gambar tidak bisa dibuka."));
      img.onload = () => {
        const scale = Math.min(1, (maxWidth || 900) / (img.naturalWidth || 1));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if ((mime || "image/jpeg") === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(mime || "image/jpeg", quality || 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ------------------------- Modal proyek ------------------------- */
function openProjectModal(project) {
  const isEdit = !!project;
  const p = project || { name: "", description: "", deadline: currentMonthISO(), cover: null };
  let cover = p.cover || null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const [pYear, pMonth] = (p.deadline || currentMonthISO()).split("-").map(Number);
  const years = [];
  for (let y = currentYear - 1; y <= currentYear + 7; y++) years.push(y);
  if (!years.includes(pYear)) { years.push(pYear); years.sort((a, b) => a - b); }

  const monthOptions = MONTHS_ID.map((name, i) =>
    '<option value="' + (i + 1) + '"' + (i + 1 === pMonth ? " selected" : "") + ">" + name + "</option>"
  ).join("");
  const yearOptions = years.map((y) =>
    '<option value="' + y + '"' + (y === pYear ? " selected" : "") + ">" + y + "</option>"
  ).join("");

  const body =
    '<form id="projectForm" novalidate>' +
      '<div class="field">' +
        '<label for="pf-name">Nama proyek <span class="opt">wajib</span></label>' +
        '<input class="input" id="pf-name" name="name" maxlength="80" autocomplete="off" placeholder="Contoh: Renewal Digital" value="' + esc(p.name) + '">' +
        '<div class="form-error" id="pf-name-error">Nama proyek wajib diisi.</div>' +
      "</div>" +
      '<div class="field">' +
        '<label for="pf-desc">Deskripsi proyek <span class="opt">opsional</span></label>' +
        '<textarea class="textarea" id="pf-desc" name="description" rows="3" maxlength="400" placeholder="Ringkasan tujuan atau ruang lingkup proyek…">' + esc(p.description) + "</textarea>" +
      "</div>" +
      '<div class="field">' +
        '<span class="field-label">Batas selesai proyek <span class="opt">bulan &amp; tahun</span></span>' +
        '<div class="month-row">' +
          '<select class="select" name="month" aria-label="Bulan batas selesai">' + monthOptions + "</select>" +
          '<select class="select" name="year" aria-label="Tahun batas selesai">' + yearOptions + "</select>" +
        "</div>" +
        '<p class="form-hint">Tenggat ini tampil di header proyek dan di lembar kerja.</p>' +
      "</div>" +
      '<div class="field">' +
        '<span class="field-label">Gambar proyek <span class="opt">opsional</span></span>' +
        '<div class="upload-box">' +
          '<div class="preview" id="pf-preview"></div>' +
          '<div class="up-txt"><b>Tampil di lembar kerja</b>JPG/PNG, otomatis diperkecil agar ringan.</div>' +
          '<div class="up-actions">' +
            '<button class="btn sm" type="button" id="pf-upload">' + icon("image") + "Pilih</button>" +
            '<button class="link-btn danger" type="button" id="pf-remove">Hapus</button>' +
          "</div>" +
        "</div>" +
        '<input type="file" id="pf-file" accept="image/*" class="sr-only">' +
      "</div>" +
    "</form>";

  const footer =
    '<div class="left">' +
      (isEdit
        ? '<button class="btn sm danger" type="button" data-x="delete">' + icon("trash") + "Hapus</button>" +
          '<button class="btn sm" type="button" data-x="duplicate">' + icon("copy") + "Duplikat</button>"
        : "") +
    "</div>" +
    '<button class="btn" type="button" data-close>Batal</button>' +
    '<button class="btn primary" type="submit" form="projectForm">' + icon(isEdit ? "check" : "plus") + (isEdit ? "Simpan perubahan" : "Tambah proyek") + "</button>";

  const overlay = openModal({
    title: isEdit ? "Edit proyek" : "Tambah proyek",
    subtitle: isEdit ? "Perbarui informasi proyek." : "Proyek baru akan muncul sebagai menu di sidebar.",
    body,
    footer,
    width: 560
  });

  const preview = $("#pf-preview", overlay);
  const fileInput = $("#pf-file", overlay);

  const renderCover = () => {
    preview.innerHTML = cover ? '<img src="' + cover + '" alt="Pratinjau gambar proyek">' : icon("image");
    $("#pf-remove", overlay).style.display = cover ? "" : "none";
  };
  renderCover();

  $("#pf-upload", overlay).addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    try {
      cover = await readImage(file, 1000, 0.84, "image/jpeg");
      renderCover();
    } catch (err) {
      toast(err.message, "warn");
    }
  });
  $("#pf-remove", overlay).addEventListener("click", () => {
    cover = null;
    fileInput.value = "";
    renderCover();
  });

  overlay.addEventListener("click", async (event) => {
    const actionBtn = event.target.closest("[data-x]");
    if (!actionBtn) return;
    const action = actionBtn.dataset.x;
    if (action === "duplicate") {
      duplicateProject(project);
      return;
    }
    if (action === "delete") {
      const yes = await confirmDialog({
        title: "Hapus proyek?",
        message: 'Proyek "' + project.name + '" beserta semua step dan isian lembar kerjanya akan dihapus permanen.',
        confirmText: "Hapus proyek"
      });
      if (!yes) return;
      state.projects = state.projects.filter((item) => item.id !== project.id);
      state.activeProjectId = state.projects[0] ? state.projects[0].id : null;
      saveState();
      closeModal();
      renderAll();
      toast("Proyek dihapus.");
    }
  });

  const form = $("#projectForm", overlay);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = form.elements.name;
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.classList.add("invalid");
      $("#pf-name-error", overlay).classList.add("show");
      nameInput.focus();
      return;
    }

    const deadline = form.elements.year.value + "-" + pad2(Number(form.elements.month.value));
    const data = {
      name,
      description: form.elements.description.value.trim(),
      deadline,
      cover
    };

    if (isEdit) {
      Object.assign(project, data);
      toast("Proyek diperbarui.");
    } else {
      const created = normalizeProject(data);
      state.projects.push(created);
      state.activeProjectId = created.id;
      state.viewMode = "project";
      toast("Proyek baru ditambahkan.");
    }
    saveState();
    closeModal();
    renderAll();
  });

  nameInputClearOnType(form.elements.name, overlay);
}

function nameInputClearOnType(input, overlay) {
  input.addEventListener("input", () => {
    if (!input.value.trim()) return;
    input.classList.remove("invalid");
    const err = $("#pf-name-error", overlay);
    if (err) err.classList.remove("show");
  });
}

/* ------------------------- Modal step ------------------------- */
function openStepModal(step) {
  const project = activeProject();
  if (!project) return;
  const isEdit = !!step;
  const s = step || { name: "", description: "", deadline: defaultStepDate(project), status: "todo" };

  const statusOptions = ["done", "active", "todo"].map((key) =>
    '<label class="status-opt" data-s="' + key + '">' +
      '<input type="radio" name="status" value="' + key + '"' + (s.status === key ? " checked" : "") + ">" +
      "<span><i class=\"dot\"></i>" + STATUS[key].label + "</span>" +
    "</label>"
  ).join("");

  const body =
    '<form id="stepForm" novalidate>' +
      '<div class="field">' +
        '<label for="sf-name">Nama step <span class="opt">wajib</span></label>' +
        '<input class="input" id="sf-name" name="name" maxlength="90" autocomplete="off" placeholder="Contoh: Pilot Testing" value="' + esc(s.name) + '">' +
        '<div class="form-error" id="sf-name-error">Nama step wajib diisi.</div>' +
      "</div>" +
      '<div class="field">' +
        '<label for="sf-desc">Keterangan <span class="opt">opsional</span></label>' +
        '<textarea class="textarea" id="sf-desc" name="description" rows="2" maxlength="300" placeholder="Catatan singkat tentang step ini…">' + esc(s.description) + "</textarea>" +
      "</div>" +
      '<div class="field">' +
        '<label for="sf-deadline">Deadline step</label>' +
        '<input class="input" type="date" id="sf-deadline" name="deadline" value="' + esc(s.deadline || "") + '">' +
        '<p class="form-hint">Tanggal ini tampil di kartu step dan timeline lembar kerja.</p>' +
      "</div>" +
      '<div class="field">' +
        '<span class="field-label">Status step</span>' +
        '<div class="status-choice">' + statusOptions + "</div>" +
        '<p class="form-hint">Hijau = selesai, oranye = sedang berjalan, abu-abu = belum berjalan.</p>' +
      "</div>" +
    "</form>";

  const footer =
    '<div class="left">' +
      (isEdit ? '<button class="btn sm danger" type="button" data-x="delete">' + icon("trash") + "Hapus step</button>" : "") +
    "</div>" +
    '<button class="btn" type="button" data-close>Batal</button>' +
    '<button class="btn primary" type="submit" form="stepForm">' + icon(isEdit ? "check" : "plus") + (isEdit ? "Simpan" : "Tambah step") + "</button>";

  const overlay = openModal({
    title: isEdit ? "Edit step" : "Tambah step",
    subtitle: "Step muncul sebagai kartu di timeline proyek.",
    body,
    footer,
    width: 520
  });

  overlay.addEventListener("click", async (event) => {
    const btn = event.target.closest('[data-x="delete"]');
    if (!btn) return;
    const yes = await confirmDialog({
      title: "Hapus step?",
      message: 'Step "' + step.name + '" akan dihapus dari timeline proyek.',
      confirmText: "Hapus step"
    });
    if (!yes) return;
    project.steps = project.steps.filter((item) => item.id !== step.id);
    saveState();
    closeModal();
    renderAll({ preserveScroll: true });
    toast("Step dihapus.");
  });

  const form = $("#stepForm", overlay);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = form.elements.name;
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.classList.add("invalid");
      $("#sf-name-error", overlay).classList.add("show");
      nameInput.focus();
      return;
    }
    const statusInput = form.querySelector('input[name="status"]:checked');
    const data = {
      name,
      description: form.elements.description.value.trim(),
      deadline: form.elements.deadline.value || "",
      status: statusInput ? statusInput.value : "todo"
    };

    let newId = null;
    if (isEdit) {
      Object.assign(step, data);
      toast("Step diperbarui.");
    } else {
      const created = { id: uid(), ...data };
      project.steps.push(created);
      newId = created.id;
      toast("Step baru ditambahkan.");
    }
    saveState();
    closeModal();
    renderAll({ preserveScroll: true });

    if (newId) {
      requestAnimationFrame(() => {
        const scroller = $("#timelineScroll");
        const el = scroller ? scroller.querySelector('.step[data-id="' + newId + '"]') : null;
        if (scroller && el) {
          scroller.scrollTo({ left: Math.max(0, el.offsetLeft - 30), behavior: "smooth" });
          el.classList.add("just-added");
          setTimeout(() => el.classList.remove("just-added"), 1800);
        }
      });
    }
  });

  nameInputClearOnType(form.elements.name, overlay);
}
