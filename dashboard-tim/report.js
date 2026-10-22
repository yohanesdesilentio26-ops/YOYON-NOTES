/* ============================================================
   Lembar kerja: render laporan, pratinjau, unduh HD, cetak
   ============================================================ */
"use strict";

function teamReportLabel(team) {
  const t = String(team || "").trim();
  if (!t) return "PROGRESS TIM";
  if (/^tim\b/i.test(t)) return "PROGRESS " + t.toUpperCase();
  return "PROGRESS TIM " + t.toUpperCase();
}

function buildReportHTML(project) {
  const settings = state.settings || {};
  const report = project.report || {};
  const steps = project.steps || [];
  const team = settings.teamName || "Tim Saya";
  const n = Math.max(steps.length, 1);
  const innerW = 1504;
  const nodeW = innerW / n;
  const labelSize = steps.length <= 7 ? 21 : steps.length <= 9 ? 19 : steps.length <= 12 ? 17 : 15;
  const reportDate = report.date || todayISO();
  const textScale = (TEXT_SIZES[report.textSize] || TEXT_SIZES.nyaman).scale;

  const dir = (i) => (i % 2 === 0 ? "up" : "down");
  const statusClass = (s) => "is-" + (STATUS[s] ? s : "todo");
  const lineColor = (s) => s === "done" ? "#2f9e5f" : s === "active" ? "#f5a63b" : "#cfd6df";

  let railContent = "";
  if (steps.length) {
    const segments = steps.slice(0, -1).map((s) => '<i style="background:' + lineColor(s.status) + '"></i>').join("");
    const nodes = steps.map((step, i) => {
      const d = dir(i);
      return (
        '<div class="rp-node ' + d + " " + statusClass(step.status) + '" style="left:' + (i * nodeW) + "px;width:" + nodeW + "px;--nw:" + nodeW + "px;--lbl:" + labelSize + 'px">' +
          '<div class="rp-stem"></div>' +
          '<div class="rp-dot"></div>' +
          '<div class="rp-label">' +
            "<b>" + esc(step.name) + "</b>" +
            (step.deadline ? "<small>" + esc(fmtDate(step.deadline)) + "</small>" : "") +
          "</div>" +
        "</div>"
      );
    }).join("");
    railContent =
      '<div class="rp-rail">' +
        '<div class="rp-line" style="left:' + (nodeW / 2) + "px;right:" + (nodeW / 2) + 'px">' + segments + "</div>" +
        nodes +
      "</div>";
  } else {
    railContent = '<div class="rp-rail" style="display:flex;align-items:center;justify-content:center"><div style="color:#9aa6b8;font-size:18px;font-weight:600">Belum ada step pada proyek ini.</div></div>';
  }

  const names = (report.names || []).map((s) => String(s || "").trim()).filter(Boolean);
  const footerParts = [];
  if (names.length) footerParts.push(esc(names.join(" - ")));
  footerParts.push(esc(team));
  footerParts.push(esc(fmtDate(reportDate, "long")));

  const logo = settings.logo
    ? '<img src="' + settings.logo + '" alt="Logo tim">'
    : "";

  const companyLogos =
    typeof LOGO_DANANTARA === "string" && typeof LOGO_JASINDO === "string"
      ? '<div class="rp-company">' +
          '<img class="logo-danantara" src="' + LOGO_DANANTARA + '" alt="Danantara Indonesia">' +
          '<span class="sep" aria-hidden="true"></span>' +
          '<img class="logo-jasindo" src="' + LOGO_JASINDO + '" alt="Asuransi Jasindo">' +
        "</div>"
      : "";

  const projectCover = typeof project.cover === "string" ? project.cover : "";
  const deviceMockup = typeof DEFAULT_DEVICE_MOCKUP === "string" ? DEFAULT_DEVICE_MOCKUP : "";
  const projectShot = projectCover
    ? '<div class="project-shot" style="background-image:url(&#39;' + projectCover + '&#39;)" role="img" aria-label="Gambar proyek"></div>'
    : '<div class="project-shot is-placeholder"><div class="ph"><b>' + esc(initials(project.name)) + "</b><span>" + esc(fmtMonth(project.deadline)) + "</span></div></div>";
  const mockupShot = deviceMockup
    ? '<div class="mockup-shot"><img src="' + deviceMockup + '" alt="Ilustrasi perangkat"></div>'
    : '<div class="mockup-shot is-placeholder"><div class="ph"><b>' + esc(initials(project.name)) + "</b><span>Ilustrasi</span></div></div>";
  const shotPreloads = projectCover
    ? '<img class="shot-preload" src="' + projectCover + '" alt="" aria-hidden="true">'
    : "";

  const box = (title, text) =>
    '<article class="rp-box"><h3>' + title + '</h3><div class="body">' + (String(text || "").trim() ? esc(text) : "&mdash;") + "</div></article>";

  return (
    '<div class="report" style="--rp-scale:' + textScale + '">' +
      '<header class="rp-head">' +
        '<div class="rp-title">' +
          '<span class="t-black">' + esc(teamReportLabel(team)) + "</span>" +
          '<span class="t-sep">|</span>' +
          '<span class="t-blue">' + esc(project.name) + "</span>" +
        "</div>" +
        '<div class="rp-logos">' +
          logo +
          companyLogos +
        "</div>" +
      "</header>" +

      '<section class="rp-card">' +
        '<h2 class="rp-project">' + esc(project.name) + "</h2>" +
        railContent +
      "</section>" +

      '<section class="rp-bottom">' +
        '<figure class="rp-shot">' +
          projectShot +
          mockupShot +
          shotPreloads +
        "</figure>" +
        box("Progress", report.progress) +
        box("Kendala", report.kendala) +
        box("Target", report.target) +
      "</section>" +

      '<footer class="rp-foot">' +
        '<div class="rp-names">' + footerParts.join('<span class="dot">•</span>') + "</div>" +
      "</footer>" +
    "</div>"
  );
}

/* ------------------------- Penyesuaian teks ------------------------- */
function fitReportText(root) {
  if (!root) return;

  const title = root.querySelector(".rp-title");
  const black = root.querySelector(".t-black");
  const sep = root.querySelector(".t-sep");
  const blue = root.querySelector(".t-blue");
  if (title && blue && black && sep) {
    let size = parseFloat(getComputedStyle(blue).fontSize) || 41;
    let guard = 0;
    while (blue.scrollWidth > blue.clientWidth + 1 && size > 20 && guard < 30) {
      size -= 1;
      guard += 1;
      blue.style.fontSize = size + "px";
      black.style.fontSize = size + "px";
      sep.style.fontSize = (size - 1) + "px";
    }
  }

  const projTitle = root.querySelector(".rp-project");
  if (projTitle) {
    let size = parseFloat(getComputedStyle(projTitle).fontSize) || 33;
    let guard = 0;
    while (projTitle.scrollWidth > projTitle.clientWidth + 1 && size > 20 && guard < 20) {
      size -= 1;
      guard += 1;
      projTitle.style.fontSize = size + "px";
    }
  }

  $$(".rp-label", root).forEach((label) => {
    const b = label.querySelector("b");
    if (!b) return;
    let size = parseFloat(getComputedStyle(b).fontSize) || 19;
    let guard = 0;
    while (label.scrollHeight > label.clientHeight + 1 && size > 11 && guard < 20) {
      size -= 1;
      guard += 1;
      b.style.fontSize = size + "px";
    }
  });

  $$(".rp-box .body", root).forEach((body) => {
    let size = parseFloat(getComputedStyle(body).fontSize) || 15;
    let guard = 0;
    while (body.scrollHeight > body.clientHeight + 1 && size > 9.5 && guard < 24) {
      size -= 0.5;
      guard += 1;
      body.style.fontSize = size + "px";
      body.style.lineHeight = "1.4";
    }
  });
}

function waitForImages(root) {
  const imgs = $$("img", root);
  return Promise.all(imgs.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  }));
}

async function prepareReport() {
  const project = activeProject();
  if (!project) throw new Error("Tidak ada proyek aktif.");
  const cap = $("#reportCapture");
  cap.innerHTML = buildReportHTML(project);
  const el = cap.firstElementChild;
  fitReportText(el);
  await waitForImages(el);
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (err) { /* abaikan */ }
  }
  return { html: el.outerHTML, el, project };
}

/* ------------------------- Pratinjau ------------------------- */
async function openReportPreview() {
  if (!activeProject()) return;
  let prepared;
  try {
    prepared = await prepareReport();
  } catch (err) {
    toast(err.message, "warn");
    return;
  }

  const overlay = openModal({
    title: "Lembar Kerja",
    subtitle: "Pratinjau laporan tim. Unduh sebagai gambar HD atau cetak ke PDF.",
    className: "report-modal",
    width: 1180,
    body:
      '<div class="report-toolbar">' +
        '<span class="badge-hd"><b>HD</b> 4800 × 2700 px</span>' +
        '<span class="badge-hd">16 : 9</span>' +
        '<span class="spacer"></span>' +
        '<span class="badge-hd">PNG / PDF</span>' +
      "</div>" +
      '<div class="report-wrap"><div class="report-scaler" id="reportScaler"></div></div>',
    footer:
      '<div class="left"><button class="btn ghost" type="button" data-r="edit">' + icon("pencil") + "Ubah isian</button></div>" +
      '<button class="btn" type="button" data-r="print">' + icon("print") + "Cetak / PDF</button>" +
      '<button class="btn primary" type="button" data-r="png">' + icon("download") + "Unduh PNG (HD)</button>"
  });

  const scaler = $("#reportScaler", overlay);
  scaler.innerHTML = prepared.html;

  const applyScale = () => {
    const reportEl = scaler.firstElementChild;
    if (!reportEl) return;
    const width = scaler.clientWidth;
    const scale = width / 1600;
    reportEl.style.transform = "scale(" + scale + ")";
    scaler.style.height = Math.round(900 * scale) + "px";
  };
  applyScale();
  requestAnimationFrame(applyScale);
  window.addEventListener("resize", applyScale);
  if (modal) modal.onClose = () => window.removeEventListener("resize", applyScale);

  overlay.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-r]");
    if (!btn) return;
    const action = btn.dataset.r;
    if (action === "edit") {
      closeModal();
      openReportForm();
    } else if (action === "png") {
      downloadReportPNG();
    } else if (action === "print") {
      printActiveReport();
    }
  });
}

/* ------------------------- Unduh PNG HD ------------------------- */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function slugify(text) {
  return String(text || "proyek").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "proyek";
}

function showBusy(title) {
  const el = document.createElement("div");
  el.className = "busy-overlay";
  el.innerHTML =
    '<div class="busy-card">' +
      '<div class="spinner" aria-hidden="true"></div>' +
      "<div><b>" + esc(title) + "</b><span>Menyiapkan gambar resolusi tinggi, mohon tunggu…</span></div>" +
    "</div>";
  document.body.appendChild(el);
  return () => el.remove();
}

async function downloadReportPNG() {
  if (typeof html2canvas !== "function") {
    toast("Pustaka ekspor gambar tidak ditemukan. Pastikan folder vendor ikut tersalin.", "warn");
    return;
  }
  if (!activeProject()) return;

  let stopBusy = null;
  const cap = $("#reportCapture");
  try {
    const prepared = await prepareReport();
    stopBusy = showBusy("Membuat gambar HD…");

    cap.style.left = "0px";
    cap.style.top = "0px";
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvas(prepared.el, {
      scale: 3,
      backgroundColor: "#fdf6ea",
      width: 1600,
      height: 900,
      windowWidth: 1600,
      windowHeight: 900,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      logging: false
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Gambar gagal dibuat.");

    const date = (prepared.project.report && prepared.project.report.date) || todayISO();
    downloadBlob(blob, "Lembar-Kerja-" + slugify(prepared.project.name) + "-" + date + ".png");
    toast("Gambar HD (4800 × 2700 px) berhasil diunduh.");
  } catch (err) {
    console.error(err);
    toast("Gagal membuat gambar: " + err.message, "warn");
  } finally {
    cap.style.left = "";
    cap.style.top = "";
    if (stopBusy) stopBusy();
  }
}

/* ------------------------- Cetak / PDF ------------------------- */
async function printActiveReport() {
  if (!activeProject()) return;
  try {
    const prepared = await prepareReport();
    const area = $("#printArea");
    area.innerHTML = prepared.html;
    const oldTitle = document.title;
    document.title = "Lembar Kerja - " + prepared.project.name;
    toast("Di dialog cetak pilih 'Save as PDF' dan aktifkan 'Background graphics'.", "warn");
    setTimeout(() => {
      window.print();
      document.title = oldTitle;
      setTimeout(() => { area.innerHTML = ""; }, 800);
    }, 180);
  } catch (err) {
    console.error(err);
    toast("Gagal menyiapkan cetak: " + err.message, "warn");
  }
}
