/* ============================================================
   Ruang Tim — Dashboard Kinerja Tim
   Data disimpan lokal di browser (localStorage).
   ============================================================ */
"use strict";

/* ----------------------------- Konstanta ----------------------------- */
const STORAGE_KEY = "ruang-tim-v1";

const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const STATUS = {
  done: { label: "Selesai", pill: "Selesai", color: "#22a06b" },
  active: { label: "Sedang Berjalan", pill: "Berjalan", color: "#f5a524" },
  todo: { label: "Belum Berjalan", pill: "Belum", color: "#94a3b8" }
};
const STATUS_ORDER = ["todo", "active", "done"];

const AVATAR_GRADIENTS = [
  ["#f7b04a", "#e8890c"],
  ["#60a5fa", "#1d4ed8"],
  ["#34d399", "#047857"],
  ["#a78bfa", "#6d28d9"],
  ["#f472b6", "#be185d"],
  ["#22d3ee", "#0e7490"],
  ["#fca5a5", "#dc2626"]
];

/* ----------------------------- Ikon SVG ----------------------------- */
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>',
  grip: '<circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none"/>',
  print: '<polyline points="6 9 6 3 18 3 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  download: '<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/>',
  upload: '<path d="M12 21V9"/><path d="m7 13 5-5 5 5"/><path d="M5 3h14"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.6.7 1.03 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  checkSquare: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 2.5 2.5L16 9"/>',
  listChecks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/>'
};

function icon(name, cls) {
  return '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
}

/* ----------------------------- Util ----------------------------- */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

const pad2 = (n) => String(n).padStart(2, "0");

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

function uid() {
  return "id" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function todayISO() {
  const d = new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

function currentMonthISO() { return todayISO().slice(0, 7); }

function fmtDate(iso, style) {
  if (!iso) return "Tanpa tanggal";
  const parts = String(iso).split("-").map(Number);
  if (parts.length < 3 || parts.some((p) => !p)) return iso;
  const [y, m, d] = parts;
  if (style === "long") {
    const dt = new Date(y, m - 1, d);
    return DAYS_ID[dt.getDay()] + ", " + d + " " + MONTHS_ID[m - 1] + " " + y;
  }
  return d + " " + MONTHS_SHORT[m - 1] + " " + y;
}

function fmtMonth(ym, long) {
  if (!ym) return "Tanpa batas";
  const [y, m] = String(ym).split("-").map(Number);
  if (!y || !m) return ym;
  return (long ? MONTHS_ID[m - 1] : MONTHS_SHORT[m - 1]) + " " + y;
}

function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

function defaultStepDate(project) {
  const base = (project && project.deadline) || currentMonthISO();
  const [y, m] = base.split("-").map(Number);
  return base + "-" + pad2(daysInMonth(y, m));
}

function initials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "PR";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function hashText(text) {
  let h = 0;
  const s = String(text || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function avatarStyle(name) {
  const g = AVATAR_GRADIENTS[hashText(name) % AVATAR_GRADIENTS.length];
  return "background:linear-gradient(140deg," + g[0] + "," + g[1] + ")";
}

function projectStats(project) {
  const steps = project.steps || [];
  const total = steps.length;
  const done = steps.filter((s) => s.status === "done").length;
  const active = steps.filter((s) => s.status === "active").length;
  const todo = total - done - active;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { total, done, active, todo, pct };
}

function projectState(project) {
  const st = projectStats(project);
  if (!st.total) return { key: "empty", label: "Belum ada step", cls: "gray", color: "#94a3b8" };
  if (st.pct === 100) return { key: "done", label: "Selesai", cls: "green", color: "#22a06b" };
  return { key: "running", label: "Berjalan", cls: "blue", color: "#f5a524" };
}

/* ----------------------------- State ----------------------------- */
const TEXT_SIZES = {
  ringkas: { label: "Ringkas", scale: 1, hint: "Muat lebih banyak teks" },
  nyaman: { label: "Nyaman", scale: 1.08, hint: "Disarankan" },
  besar: { label: "Besar", scale: 1.16, hint: "Paling mudah dibaca" }
};

function normalizeTask(raw) {
  const t = raw && typeof raw === "object" ? raw : {};
  return {
    id: t.id || uid(),
    name: String(t.name || "Tugas tanpa nama"),
    from: String(t.from || ""),
    description: String(t.description || ""),
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(t.deadline || "") ? t.deadline : "",
    done: !!t.done,
    createdAt: t.createdAt || Date.now()
  };
}

function normalizeNote(raw) {
  const n = raw && typeof raw === "object" ? raw : {};
  const createdAt = n.createdAt || Date.now();
  return {
    id: n.id || uid(),
    text: String(n.text || ""),
    createdAt,
    updatedAt: n.updatedAt || createdAt
  };
}

function normalizeProject(raw) {
  const p = raw && typeof raw === "object" ? raw : {};
  const steps = Array.isArray(p.steps) ? p.steps : [];
  return {
    id: p.id || uid(),
    name: String(p.name || "Proyek tanpa nama"),
    description: String(p.description || ""),
    deadline: /^\d{4}-\d{2}$/.test(p.deadline || "") ? p.deadline : currentMonthISO(),
    cover: typeof p.cover === "string" ? p.cover : null,
    createdAt: p.createdAt || Date.now(),
    steps: steps.map((s) => ({
      id: s.id || uid(),
      name: String(s.name || "Step"),
      description: String(s.description || ""),
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(s.deadline || "") ? s.deadline : "",
      status: STATUS[s.status] ? s.status : "todo"
    })),
    report: {
      progress: String((p.report && p.report.progress) || ""),
      kendala: String((p.report && p.report.kendala) || ""),
      target: String((p.report && p.report.target) || ""),
      names: Array.isArray(p.report && p.report.names)
        ? [0, 1, 2].map((i) => String(p.report.names[i] || ""))
        : ["", "", ""],
      date: (p.report && /^\d{4}-\d{2}-\d{2}$/.test(p.report.date || "")) ? p.report.date : todayISO(),
      textSize: TEXT_SIZES[p.report && p.report.textSize] ? p.report.textSize : "nyaman"
    }
  };
}

function normalizeState(raw) {
  const s = raw && typeof raw === "object" ? raw : {};
  const settings = s.settings || {};
  const projects = Array.isArray(s.projects) ? s.projects.map(normalizeProject) : [];
  const tasks = Array.isArray(s.tasks) ? s.tasks.map(normalizeTask) : [];
  const notes = Array.isArray(s.notes) ? s.notes.map(normalizeNote) : [];
  const activeExists = projects.some((p) => p.id === s.activeProjectId);
  const viewMode = s.viewMode === "tasks" || s.viewMode === "notes" ? s.viewMode : "project";
  return {
    version: 1,
    settings: {
      teamName: String(settings.teamName || "Tim 2"),
      logo: typeof settings.logo === "string" ? settings.logo : null,
      members: [0, 1, 2].map((i) => String((settings.members && settings.members[i]) || ""))
    },
    projects,
    tasks,
    notes,
    viewMode,
    activeProjectId: activeExists ? s.activeProjectId : (projects[0] ? projects[0].id : null)
  };
}

function seedState() {
  const now = new Date();
  const shift = (months) => {
    const d = new Date(now.getFullYear(), now.getMonth() + months, 15);
    return { ym: d.getFullYear() + "-" + pad2(d.getMonth() + 1), date: d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-15" };
  };
  const deadline = shift(2).ym;
  const mk = (name, description, status, offset) => {
    const at = shift(offset);
    const last = new Date(Number(at.ym.slice(0, 4)), Number(at.ym.slice(5, 7)), 0).getDate();
    return {
      id: uid(),
      name,
      description,
      status,
      deadline: at.ym + "-" + pad2(last)
    };
  };

  const sample = normalizeProject({
    name: "Renewal Digital",
    description: "Pengembangan ulang layanan digital: penyampaian requirement, desain, dokumen polis, development, hingga implementasi penuh.",
    deadline,
    cover: null,
    steps: [
      mk("Penyampaian Requirement", "Kebutuhan bisnis dan teknis disepakati bersama seluruh stakeholder.", "done", -5),
      mk("UI/UX Design", "Wireframe dan desain antarmuka disetujui tim produk.", "done", -4),
      mk("Dokumen Polis", "Penyesuaian dokumen polis dan alur penerbitan.", "done", -3),
      mk("Development Core", "Pengembangan modul inti dan integrasi layanan.", "done", -2),
      mk("UAT Internal", "Pengujian bersama tim internal dan perbaikan temuan.", "done", -1),
      mk("Pilot Testing (email & SMS)", "Uji coba terbatas penggunaan email dan SMS.", "active", 0),
      mk("Pengadaan WA Business", "Proses pengadaan layanan WhatsApp Business.", "todo", 1),
      mk("Full Implementasi", "Rilis penuh ke seluruh pengguna layanan.", "todo", 2)
    ],
    report: {
      progress: "Penyampaian requirement, UI/UX design, dokumen polis, development core, dan UAT internal sudah selesai. Saat ini sedang berjalan pilot testing menggunakan email dan SMS.",
      kendala: "Menunggu persetujuan pengadaan WA Business serta penyesuaian jadwal dari vendor.",
      target: "Pilot testing selesai bulan ini, pengadaan WA Business bulan depan, lalu full implementasi sesuai tenggat proyek.",
      names: ["", "", ""],
      date: todayISO()
    }
  });

  return normalizeState({
    settings: { teamName: "Tim 2", logo: null, members: ["", "", ""] },
    projects: [sample],
    tasks: [],
    notes: [],
    viewMode: "project",
    activeProjectId: sample.id
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (err) {
    console.warn("Gagal membaca data tersimpan:", err);
  }
  const seeded = seedState();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded)); } catch (err) { console.warn(err); }
  return seeded;
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error(err);
    toast("Penyimpanan browser penuh. Hapus gambar atau cadangkan data.", "warn");
    return false;
  }
}

function activeProject() {
  return state.projects.find((p) => p.id === state.activeProjectId) || null;
}

function findStep(project, stepId) {
  return (project.steps || []).find((s) => s.id === stepId) || null;
}

function setActiveProject(id) {
  state.activeProjectId = id;
  state.viewMode = "project";
  saveState();
  closeSidebar();
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function duplicateProject(project) {
  const copy = normalizeProject(JSON.parse(JSON.stringify(project)));
  copy.id = uid();
  copy.name = project.name + " (salinan)";
  copy.createdAt = Date.now();
  copy.steps = copy.steps.map((s) => ({ ...s, id: uid() }));
  state.projects.push(copy);
  state.activeProjectId = copy.id;
  state.viewMode = "project";
  saveState();
  closeModal();
  renderAll();
  toast("Proyek diduplikasi.");
}

/* ----------------------------- Toast ----------------------------- */
function toast(message, type) {
  const root = $("#toastRoot");
  if (!root) return;
  const el = document.createElement("div");
  el.className = "toast" + (type === "warn" ? " warn" : "");
  el.innerHTML = icon(type === "warn" ? "alert" : "check") + "<span>" + esc(message) + "</span>";
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 240);
  }, type === "warn" ? 5000 : 3200);
}
