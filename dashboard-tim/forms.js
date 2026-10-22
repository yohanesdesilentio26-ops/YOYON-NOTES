/* ============================================================
   Form lembar kerja & pengaturan
   ============================================================ */
"use strict";

function openReportForm() {
  const project = activeProject();
  if (!project) return;
  const report = project.report || {};
  const stats = projectStats(project);
  const members = state.settings.members || ["", "", ""];
  const saved = report.names || ["", "", ""];
  const useSaved = saved.some((n) => String(n || "").trim());
  const names = [0, 1, 2].map((i) => (useSaved ? String(saved[i] || "") : String(members[i] || "")));
  const textSize = TEXT_SIZES[report.textSize] ? report.textSize : "nyaman";
  const sizeOptions = Object.keys(TEXT_SIZES).map((key) =>
    '<label class="size-opt">' +
      '<input type="radio" name="textSize" value="' + key + '"' + (textSize === key ? " checked" : "") + ">" +
      "<span><b>" + TEXT_SIZES[key].label + "</b><small>" + TEXT_SIZES[key].hint + "</small></span>" +
    "</label>"
  ).join("");

  const suggestion = stats.total
    ? stats.done + " dari " + stats.total + " step selesai (" + stats.pct + "%). " + (stats.active ? stats.active + " step sedang berjalan." : "")
    : "Tuliskan ringkasan progress tim…";

  const body =
    '<form id="reportForm" novalidate>' +
      '<div class="field">' +
        '<label for="rf-progress">Progress <span class="opt">isi lembar kerja</span></label>' +
        '<textarea class="textarea" id="rf-progress" name="progress" rows="4" maxlength="900" placeholder="' + esc(suggestion) + '">' + esc(report.progress || "") + "</textarea>" +
      "</div>" +
      '<div class="row-2">' +
        '<div class="field">' +
          '<label for="rf-kendala">Kendala</label>' +
          '<textarea class="textarea" id="rf-kendala" name="kendala" rows="4" maxlength="700" placeholder="Kendala yang sedang dihadapi…">' + esc(report.kendala || "") + "</textarea>" +
        "</div>" +
        '<div class="field">' +
          '<label for="rf-target">Target</label>' +
          '<textarea class="textarea" id="rf-target" name="target" rows="4" maxlength="700" placeholder="Target berikutnya…">' + esc(report.target || "") + "</textarea>" +
        "</div>" +
      "</div>" +
      '<div class="field">' +
        '<span class="field-label">Nama yang dicantumkan <span class="opt">maksimal 3 nama</span></span>' +
        '<div class="row-3">' +
          '<input class="input" name="name1" maxlength="40" autocomplete="off" placeholder="Nama 1" value="' + esc(names[0]) + '">' +
          '<input class="input" name="name2" maxlength="40" autocomplete="off" placeholder="Nama 2" value="' + esc(names[1]) + '">' +
          '<input class="input" name="name3" maxlength="40" autocomplete="off" placeholder="Nama 3" value="' + esc(names[2]) + '">' +
        "</div>" +
      "</div>" +
      '<div class="field">' +
        '<span class="field-label">Ukuran teks lembar kerja</span>' +
        '<div class="size-choice">' + sizeOptions + "</div>" +
        '<p class="form-hint">Pilih &quot;Besar&quot; jika lembar kerja akan ditampilkan di layar atau proyektor.</p>' +
      "</div>" +
      '<div class="field">' +
        '<label for="rf-date">Tanggal lembar kerja</label>' +
        '<input class="input" type="date" id="rf-date" name="date" value="' + esc(report.date || todayISO()) + '">' +
        '<p class="form-hint">Tanggal ini tercetak di bagian bawah lembar kerja bersama nama tim.</p>' +
      "</div>" +
    "</form>";

  const overlay = openModal({
    title: "Cetak lembar kerja",
    subtitle: "Isi ringkasan progress, kendala, target, dan nama anggota tim.",
    body,
    width: 620,
    footer:
      '<span class="note">Isian tersimpan per proyek.</span>' +
      '<button class="btn" type="button" data-close>Batal</button>' +
      '<button class="btn primary" type="submit" form="reportForm">' + icon("print") + "Buat lembar kerja</button>"
  });

  const form = $("#reportForm", overlay);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    project.report = {
      progress: form.elements.progress.value.trim(),
      kendala: form.elements.kendala.value.trim(),
      target: form.elements.target.value.trim(),
      names: [
        form.elements.name1.value.trim(),
        form.elements.name2.value.trim(),
        form.elements.name3.value.trim()
      ],
      date: form.elements.date.value || todayISO(),
      textSize: (form.querySelector('input[name="textSize"]:checked') || {}).value || "nyaman"
    };
    saveState();
    closeModal();
    openReportPreview();
  });
}

/* ------------------------- Pengaturan ------------------------- */
function openSettingsModal() {
  let logo = state.settings.logo || null;
  const members = state.settings.members || ["", "", ""];

  const body =
    '<form id="settingsForm" novalidate>' +
      '<div class="field">' +
        '<label for="st-team">Nama tim</label>' +
        '<input class="input" id="st-team" name="teamName" maxlength="40" autocomplete="off" placeholder="Contoh: Tim 2" value="' + esc(state.settings.teamName || "") + '">' +
        '<p class="form-hint">Tampil di judul lembar kerja, footer, dan sidebar.</p>' +
      "</div>" +
      '<div class="field">' +
        '<span class="field-label">Logo tim <span class="opt">opsional</span></span>' +
        '<div class="upload-box">' +
          '<div class="preview" id="st-logo-preview"></div>' +
          '<div class="up-txt"><b>Untuk pojok kanan atas lembar kerja</b>PNG transparan lebih disarankan.</div>' +
          '<div class="up-actions">' +
            '<button class="btn sm" type="button" id="st-logo-upload">' + icon("image") + "Pilih</button>" +
            '<button class="link-btn danger" type="button" id="st-logo-remove">Hapus</button>' +
          "</div>" +
        "</div>" +
        '<input type="file" id="st-logo-file" accept="image/*" class="sr-only">' +
      "</div>" +
      '<div class="field">' +
        '<span class="field-label">Nama anggota bawaan <span class="opt">otomatis terisi di form cetak</span></span>' +
        '<div class="row-3">' +
          '<input class="input" name="member1" maxlength="40" autocomplete="off" placeholder="Nama 1" value="' + esc(members[0]) + '">' +
          '<input class="input" name="member2" maxlength="40" autocomplete="off" placeholder="Nama 2" value="' + esc(members[1]) + '">' +
          '<input class="input" name="member3" maxlength="40" autocomplete="off" placeholder="Nama 3" value="' + esc(members[2]) + '">' +
        "</div>" +
      "</div>" +
      '<div class="field" style="margin-top:18px;padding-top:16px;border-top:1px dashed var(--line)">' +
        '<span class="field-label">Cadangan data <span class="opt">proyek, tugas &amp; catatan tersimpan di browser ini</span></span>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="btn sm" type="button" id="st-export">' + icon("download") + "Unduh cadangan (.json)</button>" +
          '<button class="btn sm" type="button" id="st-import">' + icon("upload") + "Pulihkan cadangan</button>" +
          '<button class="btn sm danger" type="button" id="st-reset">' + icon("trash") + "Hapus semua data</button>" +
        "</div>" +
        '<input type="file" id="st-import-file" accept="application/json,.json" class="sr-only">' +
      "</div>" +
    "</form>";

  const overlay = openModal({
    title: "Pengaturan",
    subtitle: "Identitas tim dan cadangan data.",
    body,
    width: 620,
    footer:
      '<button class="btn" type="button" data-close>Batal</button>' +
      '<button class="btn primary" type="submit" form="settingsForm">' + icon("check") + "Simpan pengaturan</button>"
  });

  const preview = $("#st-logo-preview", overlay);
  const fileInput = $("#st-logo-file", overlay);
  const renderLogo = () => {
    preview.innerHTML = logo ? '<img src="' + logo + '" alt="Logo tim">' : icon("image");
    $("#st-logo-remove", overlay).style.display = logo ? "" : "none";
  };
  renderLogo();

  $("#st-logo-upload", overlay).addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    try {
      logo = await readImage(file, 420, 0.92, "image/png");
      renderLogo();
    } catch (err) {
      toast(err.message, "warn");
    }
  });
  $("#st-logo-remove", overlay).addEventListener("click", () => {
    logo = null;
    fileInput.value = "";
    renderLogo();
  });

  $("#st-export", overlay).addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    downloadBlob(blob, "ruang-tim-cadangan-" + todayISO() + ".json");
    toast("Cadangan data diunduh.");
  });

  const importInput = $("#st-import-file", overlay);
  $("#st-import", overlay).addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", async () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !Array.isArray(parsed.projects)) throw new Error("Format cadangan tidak dikenali.");
      const yes = await confirmDialog({
        title: "Pulihkan cadangan?",
        message: "Data saat ini akan diganti dengan isi cadangan (" + parsed.projects.length + " proyek).",
        confirmText: "Pulihkan",
        danger: false
      });
      if (!yes) return;
      state = normalizeState(parsed);
      saveState();
      closeModal();
      renderAll();
      toast("Cadangan berhasil dipulihkan.");
    } catch (err) {
      toast("Gagal memulihkan: " + err.message, "warn");
    }
  });

  $("#st-reset", overlay).addEventListener("click", async () => {
    const yes = await confirmDialog({
      title: "Hapus semua data?",
      message: "Seluruh proyek, tugas, catatan, step, dan isian lembar kerja akan dihapus dari browser ini. Pengaturan tim tetap disimpan.",
      confirmText: "Hapus semua"
    });
    if (!yes) return;
    state.projects = [];
    state.tasks = [];
    state.notes = [];
    state.activeProjectId = null;
    state.viewMode = "project";
    saveState();
    closeModal();
    renderAll();
    toast("Semua data dihapus.");
  });

  const form = $("#settingsForm", overlay);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings = {
      teamName: form.elements.teamName.value.trim() || "Tim Saya",
      logo,
      members: [
        form.elements.member1.value.trim(),
        form.elements.member2.value.trim(),
        form.elements.member3.value.trim()
      ]
    };
    saveState();
    closeModal();
    renderAll({ preserveScroll: true });
    toast("Pengaturan disimpan.");
  });
}

/* ------------------------- Aksi proyek lain ------------------------- */
function loadSampleProject() {
  const seeded = seedState();
  const sample = seeded.projects[0];
  if (!sample) return;
  state.projects.push(sample);
  state.activeProjectId = sample.id;
  saveState();
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
  toast("Contoh proyek dimuat. Silakan edit atau hapus sesuai kebutuhan.");
}
