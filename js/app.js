// =============================================================
//  GIAO DIỆN ỨNG DỤNG "BẮP HỌC VUI"
// =============================================================

const APP_VERSION = "8 · micro chỉ hỏi 1 lần"; // tăng số này mỗi lần cập nhật
const $app = document.getElementById("app");
const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---------------- Lưu tiến độ (số sao) ----------------
const Progress = {
  data: (() => { try { return JSON.parse(localStorage.getItem("bap-progress") || "{}"); } catch { return {}; } })(),
  save() { try { localStorage.setItem("bap-progress", JSON.stringify(this.data)); } catch {} },
  star(key, word) { (this.data[key] = this.data[key] || {})[word] = true; this.save(); },
  has(key, word) { return !!(this.data[key] && this.data[key][word]); },
  count(key) { return Object.keys(this.data[key] || {}).length; },
  reset() { this.data = {}; this.save(); },
};

// ---------------- Điều hướng ----------------
const routes = {};
function go(name, ...args) {
  Speech.stop(); Speech.stopListening();
  history.pushState({ name, args }, "", "#" + name);
  render(name, args);
}
function render(name, args = []) {
  $app.innerHTML = "";
  (routes[name] || routes.home)(...args);
  window.scrollTo(0, 0);
}
window.addEventListener("popstate", (e) => {
  Speech.stop(); Speech.stopListening();
  const st = e.state || { name: "home", args: [] };
  render(st.name, st.args);
});

function topbar(title, back = "home", backArgs = []) {
  const el = h(`<header class="topbar">
      <button class="icon-btn back" aria-label="Quay lại">⬅</button>
      <h1>${esc(title)}</h1><span class="spacer"></span></header>`);
  el.querySelector(".back").onclick = () => { Sfx.tap(); history.length > 1 ? history.back() : go(back, ...backArgs); };
  return el;
}

// ---------------- Lớp phủ kết quả ✓ / ✗ ----------------
function showFeedback(ok, message) {
  const el = h(`<div class="feedback ${ok ? "ok" : "no"}" role="alert">
      <div class="fb-icon">${ok ? "✓" : "✗"}</div>
      <div class="fb-msg">${esc(message)}</div></div>`);
  document.body.appendChild(el);
  if (ok) confetti();
  const close = () => el.remove();
  el.onclick = close;
  setTimeout(close, ok ? 2200 : 1800);
}
function confetti() {
  const box = h(`<div class="confetti"></div>`);
  const emo = ["⭐", "🎉", "🌟", "💖", "🎈"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.textContent = pick(emo);
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = Math.random() * 0.5 + "s";
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2500);
}

// =============================================================
//  TRANG CHỦ
// =============================================================
routes.home = () => {
  $app.appendChild(h(`<div class="home">
    <div class="hero small"><div class="mascot">🌽</div>
      <h1>Bắp Học Vui</h1><p>Chuẩn bị vào lớp 1</p></div>
    ${challengeCardHTML()}
    <div class="subject-row">
      <button class="sub-card math" data-go="mathMenu"><span class="emoji">🔢</span><span>Toán</span></button>
      <button class="sub-card viet" data-go="vietMenu"><span class="emoji">📚</span><span>Tiếng Việt</span></button>
    </div>
    <button class="install-btn ${Install.isInstalled() ? "hidden" : ""}">📲 Cài app lên màn hình chính</button>
    <button class="link-btn" data-go="settings">⚙️ Cài đặt cho bố mẹ</button>
    <p class="version">Phiên bản ${APP_VERSION}</p>
  </div>`));
  $app.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => { Sfx.tap(); go(b.dataset.go); }));
  $app.querySelector(".install-btn").onclick = () => { Sfx.tap(); Install.run(); };
};

// =============================================================
//  CÀI APP LÊN MÀN HÌNH CHÍNH
//  Android/Chrome: hiện hộp "Cài đặt" của hệ thống.
//  iPhone/Safari: Apple không cho web tự cài, nên hiện hướng dẫn 3 bước.
// =============================================================
const Install = (() => {
  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    document.querySelectorAll(".install-btn").forEach((b) => b.classList.add("hidden"));
  });
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isInstalled = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  function guide(title, steps) {
    const el = h(`<div class="install-guide" role="dialog">
      <div class="ig-box"><h2>${title}</h2>
        <ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
        <button class="primary ig-close">Đã hiểu</button></div></div>`);
    el.querySelector(".ig-close").onclick = () => el.remove();
    el.onclick = (e) => { if (e.target === el) el.remove(); };
    document.body.appendChild(el);
  }

  async function run() {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch {}
      deferred = null;
      return;
    }
    if (isIOS()) {
      const inSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
      guide("Cài app trên iPhone / iPad", [
        inSafari ? "Đang mở bằng <b>Safari</b> là đúng rồi 👍" : "Mở trang này bằng <b>Safari</b> (Apple chỉ cho cài từ Safari).",
        'Bấm nút <b>Chia sẻ</b> <span class="ig-icon">⬆️</span> ở thanh dưới cùng.',
        "Kéo xuống, chọn <b>Thêm vào MH chính</b> ➕.",
        "Bấm <b>Thêm</b> ở góc trên bên phải. Biểu tượng 🌽 sẽ hiện ra!",
      ]);
      return;
    }
    guide("Cài app trên Android", [
      "Mở trang này bằng <b>Chrome</b>.",
      'Bấm nút <b>⋮</b> ở góc trên bên phải.',
      "Chọn <b>Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b>.",
      "Bấm <b>Cài đặt</b>. Biểu tượng 🌽 sẽ hiện ra!",
    ]);
  }
  return { run, isInstalled };
})();

// =============================================================
//  TOÁN
// =============================================================
const MATH_MODES = [
  { id: "add", icon: "➕", title: "Phép cộng", sub: "Trong phạm vi 20" },
  { id: "sub", icon: "➖", title: "Phép trừ", sub: "Trong phạm vi 20" },
  { id: "balance", icon: "⚖️", title: "Cân số", sub: "Tìm số để 2 bên bằng nhau" },
  { id: "logic", icon: "🍎", title: "Cân đồ vật", sub: "1 quả táo nặng bằng mấy quả cam?" },
  { id: "kitchen", icon: "⏲️", title: "Cân đồng hồ", sub: "Cộng số cân của các đồ vật" },
  { id: "mix", icon: "🎲", title: "Trộn lẫn", sub: "Tất cả các dạng" },
];

routes.mathMenu = () => {
  $app.appendChild(topbar("Toán"));
  const range = (() => { try { return +localStorage.getItem("bap-range") || 10; } catch { return 10; } })();
  const wrap = h(`<div class="menu">
    <div class="range-pick">Phạm vi:
      <button data-r="10" class="${range === 10 ? "on" : ""}">10</button>
      <button data-r="20" class="${range === 20 ? "on" : ""}">20</button></div></div>`);
  MATH_MODES.forEach((m) => {
    const b = h(`<button class="menu-item"><span class="emoji">${m.icon}</span>
      <span class="mi-text"><b>${m.title}</b><small>${m.sub}</small></span><span class="arrow">›</span></button>`);
    b.onclick = () => { Sfx.tap(); go("mathPlay", m.id); };
    wrap.appendChild(b);
  });
  wrap.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => {
    try { localStorage.setItem("bap-range", b.dataset.r); } catch {}
    wrap.querySelectorAll("[data-r]").forEach((x) => x.classList.toggle("on", x === b));
  }));
  $app.appendChild(wrap);
};

function mathVisual(v) {
  const dots = (n, cls = "") => Array.from({ length: n }, () => `<span class="obj ${cls}">${v.icon}</span>`).join("");
  if (v.type === "add") {
    return `<div class="visual"><div class="grp">${dots(v.a)}</div><div class="op">+</div>
      <div class="grp">${v.b == null ? '<span class="qbox">?</span>' : dots(v.b)}</div></div>`;
  }
  if (v.type === "sub") {
    if (v.b == null) return `<div class="visual"><div class="grp">${dots(v.a)}</div></div>`;
    return `<div class="visual"><div class="grp">${dots(v.a - v.b)}${dots(v.b, "gone")}</div></div>`;
  }
  return "";
}

function balanceSVG(q, picked) {
  const rightVal = picked == null ? q.right.known : q.right.known + picked;
  const diff = rightVal - q.left.value;
  const angle = Math.max(-14, Math.min(14, diff * 2.5)); // dương: bên phải nặng hơn -> nghiêng phải
  const rightLabel = picked == null ? q.right.label : q.right.label.replace("?", picked);
  const rad = (angle * Math.PI) / 180;
  const lx = 160 - 120 * Math.cos(rad), ly = 90 - 120 * Math.sin(rad);
  const rx = 160 + 120 * Math.cos(rad), ry = 90 + 120 * Math.sin(rad);
  const pan = (x, y, label, color) => `
    <line x1="${x}" y1="${y}" x2="${x - 45}" y2="${y + 60}" class="rope"/>
    <line x1="${x}" y1="${y}" x2="${x + 45}" y2="${y + 60}" class="rope"/>
    <path d="M${x - 55} ${y + 60} Q${x} ${y + 95} ${x + 55} ${y + 60} Z" fill="${color}" class="pan"/>
    <text x="${x}" y="${y + 52}" class="pan-label">${esc(label)}</text>`;
  return `<svg viewBox="0 0 320 250" class="scale ${diff === 0 && picked != null ? "balanced" : ""}" aria-label="Cái cân">
    <rect x="120" y="225" width="80" height="14" rx="7" class="base"/>
    <polygon points="160,90 145,225 175,225" class="stand"/>
    <line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" class="beam"/>
    <circle cx="160" cy="90" r="9" class="pivot"/>
    ${pan(lx, ly, q.left.label, "#ffd6a5")}
    ${pan(rx, ry, rightLabel, "#bde0fe")}
  </svg>`;
}

// ---------- Cân đồ vật / cân đồng hồ ----------
const panItems = (side) => side.map(([e, c]) => Array.from({ length: c }, () => `<span class="it">${e}</span>`).join("")).join("");
function logicScale(left, right, cls = "") {
  return `<div class="lscale ${cls}"><div class="lpans"><div class="lpan">${left}</div><div class="lpan">${right}</div></div>
    <div class="lbeam"></div><div class="lpost"></div></div>`;
}
function logicHTML(q) {
  return `<p class="hint">Các cân dưới đây đều thăng bằng. Bé đếm và suy nghĩ nhé!</p>
    <div class="lgivens">${q.givens.map(([l, r]) => logicScale(panItems(l), panItems(r))).join("")}</div>
    <div class="lquestion">${logicScale(panItems(q.ask), '<span class="qmark">?</span>', "ask")}</div>
    <p class="lq">${esc(q.question.charAt(0).toUpperCase() + q.question.slice(1))}</p>`;
}
function kitchenHTML(q) {
  return `<p class="hint">Mỗi đồ vật nặng bấy nhiêu cân:</p>
    <div class="kweights">${Object.entries(q.weights).map(([e, w]) => `<div class="kw"><span>${e}</span><b>${w}</b></div>`).join("")}</div>
    <div class="kscale"><div class="ktop">${panItems(q.items)}</div><div class="kplate"></div>
      <div class="kbody"><div class="kdial">?</div></div></div>
    <p class="lq">Cân chỉ số mấy?</p>`;
}
function makeQuestion(mode, max) {
  let m = mode;
  if (m === "mix") m = pick(["add", "sub", "balance", "logic", "kitchen"]);
  if (m === "logic") return LogicScale.next();
  if (m === "kitchen") return LogicScale.kitchen();
  return MathGen.make(m, max);
}

function mathQuestionHTML(q) {
  return q.kind === "logic" ? logicHTML(q) : q.kind === "kitchen" ? kitchenHTML(q) : q.kind === "balance"
    ? `<p class="hint">Bé chọn số để cân thăng bằng nhé!</p><div class="scale-box">${balanceSVG(q, null)}</div>`
    : `${mathVisual(q.visual)}<div class="equation">${q.text.map((t) => `<span class="${t === "?" ? "qbox" : ""}">${t}</span>`).join("")}</div>`;
}
function mathShowAnswer(q, v, body) {
  if (q.kind === "balance") body.querySelector(".scale-box").innerHTML = balanceSVG(q, v);
  if (v !== q.answer) return;
  const eq = body.querySelector(".equation .qbox");
  if (eq) { eq.textContent = v; eq.classList.add("filled"); }
  const qm = body.querySelector(".qmark");
  if (qm) qm.outerHTML = panItems([[q.unit, v]]);
  const dial = body.querySelector(".kdial");
  if (dial) { dial.textContent = v; dial.classList.add("filled"); }
}

routes.mathPlay = (mode) => {
  const TOTAL = 10;
  let max = 10;
  try { max = +localStorage.getItem("bap-range") || 10; } catch {}
  const modeInfo = MATH_MODES.find((m) => m.id === mode) || MATH_MODES[0];
  $app.appendChild(topbar(modeInfo.title, "mathMenu"));
  const body = h(`<div class="math-play"></div>`);
  $app.appendChild(body);
  let n = 0, score = 0;

  function next() {
    if (n >= TOTAL) return finish();
    n++;
    const q = makeQuestion(mode, max);
    let firstTry = true;
    body.innerHTML = `
      <div class="progress"><div style="width:${((n - 1) / TOTAL) * 100}%"></div></div>
      <div class="qcount">Câu ${n}/${TOTAL} · ⭐ ${score}</div>
      <div class="question">
        ${q.kind === "logic" ? logicHTML(q) : q.kind === "kitchen" ? kitchenHTML(q) : q.kind === "balance"
          ? `<p class="hint">Bé chọn số để cân thăng bằng nhé!</p><div class="scale-box">${balanceSVG(q, null)}</div>`
          : `${mathVisual(q.visual)}<div class="equation">${q.text.map((t) => `<span class="${t === "?" ? "qbox" : ""}">${t}</span>`).join("")}</div>`}
        <button class="speak-btn small" aria-label="Nghe đề bài">🔊 Nghe đề</button>
      </div>
      <div class="answers">${answerButtons(q.options)}</div>`;
    bindAnswerSpeakers(body, q, null);
    const say = () => Speech.speak(q.say);
    body.querySelector(".speak-btn").onclick = say;
    say();
    body.querySelectorAll(".ans").forEach((b) => (b.onclick = () => {
      const v = +b.dataset.v;
      if (q.kind === "balance") body.querySelector(".scale-box").innerHTML = balanceSVG(q, v);
      if (v === q.answer) {
        if (firstTry) score++;
        b.classList.add("right");
        body.querySelectorAll(".ans").forEach((x) => (x.disabled = true));
        const eq = body.querySelector(".equation .qbox");
        if (eq) { eq.textContent = v; eq.classList.add("filled"); }
        const qm = body.querySelector(".qmark");
        if (qm) qm.outerHTML = panItems([[q.unit, v]]);
        const dial = body.querySelector(".kdial");
        if (dial) { dial.textContent = v; dial.classList.add("filled"); }
        Sfx.good();
        const msg = pick(MATH_PRAISES);
        showFeedback(true, msg);
        Speech.speak(msg);
        setTimeout(next, 2300);
      } else {
        firstTry = false;
        b.classList.add("wrong");
        b.disabled = true;
        Sfx.bad();
        const msg = pick(MATH_RETRY);
        showFeedback(false, msg);
        Speech.speak(msg);
      }
    }));
  }

  function finish() {
    const stars = score >= 9 ? 3 : score >= 6 ? 2 : 1;
    body.innerHTML = `<div class="finish"><div class="big-stars">${"⭐".repeat(stars)}</div>
      <h2>Bé làm đúng ${score}/${TOTAL} câu!</h2>
      <button class="primary again">Chơi lại</button>
      <button class="link-btn menu">Chọn bài khác</button></div>`;
    Speech.speak(`Bé làm đúng ${score} trên ${TOTAL} câu. ${score >= 6 ? "Giỏi lắm!" : "Cố gắng lên nhé!"}`);
    if (score >= 6) confetti();
    body.querySelector(".again").onclick = () => { n = 0; score = 0; next(); };
    body.querySelector(".menu").onclick = () => history.back();
  }
  next();
};

// =============================================================
//  TIẾNG VIỆT
// =============================================================
routes.vietMenu = () => {
  $app.appendChild(topbar("Tiếng Việt"));
  const wrap = h(`<div class="menu"></div>`);
  const abc = h(`<button class="menu-item"><span class="emoji">🔠</span>
    <span class="mi-text"><b>Bảng chữ cái</b><small>Nghe và đọc 29 chữ cái</small></span><span class="arrow">›</span></button>`);
  abc.onclick = () => { Sfx.tap(); go("alphabet"); };
  wrap.appendChild(abc);
  VIET_MENU.forEach((g) => {
    wrap.appendChild(h(`<h2 class="group-title">${g.icon} ${g.group}</h2>`));
    g.keys.forEach((k) => {
      const L = VIET_LESSONS[k];
      const done = L.items.filter((it) => Progress.has(k, it.w)).length;
      const b = h(`<button class="menu-item"><span class="emoji">${L.items[0].e}</span>
        <span class="mi-text"><b>${esc(L.title)}</b><small>${esc(L.sub)}</small>
        <span class="mini-bar"><i style="width:${(done / L.items.length) * 100}%"></i></span></span>
        <span class="stars-count">⭐ ${done}/${L.items.length}</span></button>`);
      b.onclick = () => { Sfx.tap(); go("lesson", k); };
      wrap.appendChild(b);
    });
  });
  $app.appendChild(wrap);
};

routes.alphabet = () => {
  $app.appendChild(topbar("Bảng chữ cái", "vietMenu"));
  const grid = h(`<div class="abc-grid"></div>`);
  ALPHABET.forEach(([ch, say]) => {
    const b = h(`<button class="abc"><span class="up">${ch.toUpperCase()}</span><span class="lo">${ch}</span><span class="say">${say}</span></button>`);
    b.onclick = () => { b.classList.add("pulse"); Speech.speak(say).then(() => b.classList.remove("pulse")); };
    grid.appendChild(b);
  });
  $app.appendChild(h(`<p class="hint center">Bé chạm vào chữ để nghe cô đọc nhé!</p>`));
  $app.appendChild(grid);
};

// Danh sách từ trong 1 bài
routes.lesson = (key) => {
  const L = VIET_LESSONS[key];
  $app.appendChild(topbar(L.title, "vietMenu"));
  const grid = h(`<div class="word-grid ${L.type}"></div>`);
  L.items.forEach((it, i) => {
    const b = h(`<button class="word-tile ${Progress.has(key, it.w) ? "done" : ""}">
      <span class="emoji">${it.e}</span><span class="w">${esc(it.w)}</span>
      ${Progress.has(key, it.w) ? '<span class="tick">✓</span>' : ""}</button>`);
    b.onclick = () => { Sfx.tap(); go("card", key, i); };
    grid.appendChild(b);
  });
  $app.appendChild(h(`<p class="hint center">Chọn một từ để học. Đọc đúng được ⭐ nhé!</p>`));
  $app.appendChild(grid);
};

// Tách tiếng thành phụ âm đầu + vần để tô màu khi đánh vần
function sylParts(s) {
  const a = VN.analyzeSyllable(s);
  const n = a.onset.length;
  if (!n) return `<span class="rh">${esc(s)}</span>`;
  return `<span class="on">${esc(s.slice(0, n))}</span><span class="rh">${esc(s.slice(n))}</span>`;
}

// Thẻ học 1 từ: nghe – đánh vần – bé đọc – chấm
routes.card = (key, index) => {
  const L = VIET_LESSONS[key];
  index = Math.max(0, Math.min(L.items.length - 1, index));
  const item = L.items[index];
  const syls = VN.syllables(item.w);
  const isSentence = L.type === "cau";

  $app.appendChild(topbar(`${L.title} · ${index + 1}/${L.items.length}`, "lesson", [key]));
  const card = h(`<div class="card">
    <div class="pic">${item.e}</div>
    <div class="word-row">
      <div class="syllables ${isSentence ? "sentence" : ""}">
        ${syls.map((s, i) => `<button class="syl" data-i="${i}" aria-label="Nghe tiếng ${esc(s)}">
          <span class="syl-text">${sylParts(s)}</span><span class="syl-spk">🔊</span></button>`).join("")}
      </div>
      <button class="speak-btn" aria-label="Nghe cả từ">🔊</button>
    </div>
    <div class="spell-area" aria-live="polite"></div>
    <div class="actions">
      <button class="act spell"><span>🐢</span>Đánh vần</button>
      <button class="act mic"><span>🎤</span>Bé đọc</button>
    </div>
    <div class="heard"></div>
    <div class="parent-check ${Speech.canListen ? "hidden" : ""}">
      <p>${Speech.hasRecognition && Speech.micOn ? "Máy chưa nghe được giọng nói." : "Bố mẹ nghe bé đọc rồi chấm nhé:"}</p>
      <button class="pc-ok">✓ Bé đọc đúng</button><button class="pc-no">✗ Chưa đúng</button>
    </div>
    <div class="nav">
      <button class="nav-btn prev" ${index === 0 ? "disabled" : ""}>◀ Trước</button>
      <span class="star-slot">${Progress.has(key, item.w) ? "⭐" : "☆"}</span>
      <button class="nav-btn next" ${index === L.items.length - 1 ? "disabled" : ""}>Tiếp ▶</button>
    </div>
  </div>`);
  $app.appendChild(card);

  const spellArea = card.querySelector(".spell-area");
  const heardEl = card.querySelector(".heard");
  const micBtn = card.querySelector(".mic");
  const sylBtns = [...card.querySelectorAll(".syl")];
  let busy = false;

  // Vẽ các bước đánh vần cho từng tiếng
  function drawSpelling(onlyIdx = null) {
    spellArea.innerHTML = syls.map((s, i) => {
      if (onlyIdx != null && i !== onlyIdx) return "";
      const steps = VN.spellSteps(s);
      return `<div class="spell-line" data-i="${i}">${steps.map((p, j) =>
        `<span class="step ${j === steps.length - 1 ? "final" : ""}">${esc(p)}</span>`).join('<span class="dash">–</span>')}</div>`;
    }).join("");
  }

  async function spellSyllable(i) {
    drawSpelling(isSentence ? i : null);
    const line = spellArea.querySelector(`.spell-line[data-i="${i}"]`);
    const plan = VN.spellPlan(syls[i]);
    const els = line ? [...line.querySelectorAll(".step")] : [];
    const chip = sylBtns[i];
    sylBtns.forEach((b, j) => b.classList.toggle("active", j === i));
    // Đánh vần vần trước (sáng xanh), rồi phụ âm (sáng đỏ), rồi ghép cả tiếng: a – mờ – am – cờ – am – cam
    await Speech.speakSteps(plan.map((p) => p.say), (k) => {
      els.forEach((e, j) => e.classList.toggle("hl", j === k));
      const part = k >= 0 ? plan[k].part : "";
      chip.classList.toggle("hl-on", part === "on");
      chip.classList.toggle("hl-rh", part === "rh");
    });
    sylBtns.forEach((b) => b.classList.remove("active", "hl-on", "hl-rh"));
  }

  async function spellAll() {
    if (busy) return; busy = true;
    if (isSentence) {
      // câu: đọc từng tiếng chậm
      for (let i = 0; i < syls.length; i++) {
        sylBtns.forEach((b, j) => b.classList.toggle("active", j === i));
        await Speech.speak(syls[i], { rate: 0.6 });
      }
      sylBtns.forEach((b) => b.classList.remove("active"));
    } else {
      for (let i = 0; i < syls.length; i++) await spellSyllable(i);
      if (syls.length > 1) await Speech.speak(item.w);
    }
    busy = false;
  }

  // 🔊 cả từ
  card.querySelector(".speak-btn").onclick = async () => {
    if (busy) return;
    sylBtns.forEach((b) => b.classList.add("active"));
    await Speech.speak(item.w);
    sylBtns.forEach((b) => b.classList.remove("active"));
  };
  // 🔊 từng tiếng: đánh vần vần trước rồi ghép phụ âm (a – mờ – am – cờ – am – cam)
  sylBtns.forEach((b, i) => (b.onclick = async () => {
    if (busy) return; busy = true;
    await spellSyllable(i);
    busy = false;
  }));
  card.querySelector(".spell").onclick = spellAll;

  function markSyllables(per) {
    sylBtns.forEach((b, i) => {
      b.classList.remove("ok", "no");
      if (per) b.classList.add(per[i] ? "ok" : "no");
    });
  }

  function onCorrect() {
    Progress.star(key, item.w);
    card.querySelector(".star-slot").textContent = "⭐";
    markSyllables(syls.map(() => true));
    Sfx.good();
    const msg = pick(PRAISES);
    showFeedback(true, msg);
    Speech.speak(msg);
  }
  async function onWrong(msg, wrongIdx) {
    Sfx.bad();
    showFeedback(false, msg);
    await Speech.speak(msg);
    // nhắc bé đánh vần lại: đánh vần các tiếng sai (hoặc cả từ)
    busy = true;
    const targets = wrongIdx && wrongIdx.length ? wrongIdx : syls.map((_, i) => i);
    if (isSentence) {
      for (const i of targets) { sylBtns[i].classList.add("active"); await Speech.speak(syls[i], { rate: 0.6 }); sylBtns[i].classList.remove("active"); }
    } else {
      for (const i of targets) await spellSyllable(i);
    }
    await Speech.speak("Bây giờ bé đọc lại nhé!");
    busy = false;
  }

  // 🎤 Bé đọc
  micBtn.onclick = async () => {
    if (busy) return;
    if (!Speech.canListen) { card.querySelector(".parent-check").classList.remove("hidden"); return; }
    busy = true;
    micBtn.classList.add("listening");
    micBtn.innerHTML = "<span>👂</span>Đang nghe...";
    heardEl.textContent = "Bé đọc to và rõ nhé!";
    markSyllables(null);
    let alts;
    try {
      alts = await Speech.listen();
    } catch (err) {
      micBtn.classList.remove("listening");
      micBtn.innerHTML = "<span>🎤</span>Bé đọc";
      busy = false;
      const code = err.message;
      if (code === "not-allowed" || code === "service-not-allowed") {
        heardEl.textContent = "Chưa được phép dùng micro. Bố mẹ vào Cài đặt trình duyệt cho phép Micro nhé.";
        card.querySelector(".parent-check").classList.remove("hidden");
      } else if (code === "network") {
        heardEl.textContent = "Cần có mạng Internet để máy nghe bé đọc.";
        card.querySelector(".parent-check").classList.remove("hidden");
      } else {
        heardEl.textContent = "Máy chưa nghe thấy. Bé bấm 🎤 và đọc to hơn nhé!";
        Speech.speak("Cô chưa nghe thấy. Bé đọc to hơn nhé!");
      }
      return;
    }
    micBtn.classList.remove("listening");
    micBtn.innerHTML = "<span>🎤</span>Bé đọc";
    busy = false;

    const r = VN.evaluate(item.w, alts);
    heardEl.innerHTML = `Máy nghe được: <b>“${esc(r.heard || alts[0])}”</b>`;
    if (r.status === "correct") return onCorrect();
    markSyllables(r.perSyllable);
    const wrongIdx = r.perSyllable.map((ok, i) => (ok ? -1 : i)).filter((i) => i >= 0);
    if (r.status === "tone") {
      const s = r.wrongTone && r.wrongTone[0];
      const a = s ? VN.analyzeSyllable(s) : null;
      const toneHint = a ? (a.tone ? `Tiếng “${s}” có dấu ${a.toneName}.` : `Tiếng “${s}” không có dấu.`) : "";
      onWrong(`Gần đúng rồi! Bé chú ý dấu nhé. ${toneHint}`, wrongIdx);
    } else {
      onWrong(pick(RETRY_MSGS), wrongIdx);
    }
  };

  // Bố mẹ chấm (khi máy không hỗ trợ nhận giọng nói)
  card.querySelector(".pc-ok").onclick = onCorrect;
  card.querySelector(".pc-no").onclick = () => onWrong(pick(RETRY_MSGS));

  card.querySelector(".prev").onclick = () => { Speech.stop(); history.replaceState({ name: "card", args: [key, index - 1] }, ""); render("card", [key, index - 1]); };
  card.querySelector(".next").onclick = () => { Speech.stop(); history.replaceState({ name: "card", args: [key, index + 1] }, ""); render("card", [key, index + 1]); };

  drawSpelling();
  setTimeout(() => card.querySelector(".speak-btn").click(), 400);
};

// ---------- Loa đáp án & đánh vần dùng chung ----------
/** Đánh vần cả một từ, hiện dòng đánh vần vào khung `area` (nếu có) */
async function spellWord(word, area) {
  for (const syl of VN.syllables(word)) {
    const plan = VN.spellPlan(syl);
    if (area) area.innerHTML = `<div class="spell-line">${plan.map((p) => `<span class="step">${esc(p.show)}</span>`).join('<span class="dash">–</span>')}</div>`;
    const els = area ? [...area.querySelectorAll(".step")] : [];
    await Speech.speakSteps(plan.map((p) => p.say), (k) => els.forEach((e, j) => e.classList.toggle("hl", j === k)));
  }
  if (VN.syllables(word).length > 1) await Speech.speak(word);
}
/** Câu đọc cho một đáp án */
function optionSpeech(q, v) {
  if (q.kind === "vletter") return VN.analyzeSyllable(v + "a").onsetName || v;
  if (q.kind === "logic") return `${v} ${LogicScale.name(q.unit)}`;
  if (q.kind === "kitchen") return `${v} cân`;
  return String(v);
}
/** Nút đáp án kèm loa nhỏ */
function answerButtons(opts, extraCls = "") {
  return opts.map((o) => `<div class="ans-wrap"><button class="ans ${extraCls}" data-v="${esc(o)}">${esc(o)}</button>
    <button class="ans-spk" data-v="${esc(o)}" aria-label="Nghe đáp án ${esc(o)}">🔊</button></div>`).join("");
}
/** Gắn loa cho đáp án: chữ thì đọc + đánh vần, số thì đọc số */
function bindAnswerSpeakers(root, q, area) {
  root.querySelectorAll(".ans-spk").forEach((b) => (b.onclick = async (e) => {
    e.stopPropagation();
    const v = b.dataset.v;
    b.classList.add("playing");
    if (q.kind === "vpic" || q.kind === "vlisten") { await Speech.speak(v); await spellWord(v, area); }
    else await Speech.speak(optionSpeech(q, v));
    b.classList.remove("playing");
  }));
}

// =============================================================
//  THỬ THÁCH MỖI NGÀY
// =============================================================
function starBar() {
  const n = Challenge.stars, G = Challenge.GOAL;
  return `<div class="star-bar"><div class="sb-fill" style="width:${(n / G) * 100}%"></div>
    <span class="sb-text">⭐ ${n}/${G} sao</span><span class="sb-gift">🎁</span></div>`;
}
function weekStrip() {
  return `<div class="week">${Challenge.week().map((d) => `<div class="wd ${d.done ? "done" : ""} ${d.isToday ? "today" : ""} ${d.future ? "future" : ""}">
    <span>${d.name}</span><b>${d.done ? "⭐" : d.isToday ? "?" : "·"}</b><small>${d.date}</small></div>`).join("")}</div>`;
}
function challengeCardHTML() {
  const done = Challenge.doneToday();
  const label = done ? "Hôm nay bé đã xong! ✓" : !Challenge.canEarn() ? `Vòng mới từ thứ 7 (${Challenge.roundStartText})` : Challenge.inProgress ? `Tiếp tục thử thách (câu ${Challenge.today().idx + 1}/${Challenge.TOTAL})` : "Bắt đầu thử thách";
  return `<button class="challenge-card ${done ? "done" : ""}" data-go="challenge">
    <span class="cc-icon">🏆</span>
    <span class="cc-title">${label}</span>
    <span class="cc-sub">20 câu Toán + Tiếng Việt · xong được 1 ⭐</span>
    ${starBar()}
  </button>`;
}

routes.challenge = () => {
  $app.appendChild(topbar("Thử thách mỗi ngày"));
  const done = Challenge.doneToday();
  const full = Challenge.stars >= Challenge.GOAL;
  const wrap = h(`<div class="ch-intro">
    <div class="ch-trophy">${full ? "🎁" : "🏆"}</div>
    ${starBar()}
    <p class="ch-reward">Đủ ${Challenge.GOAL} sao bé được: <b>${esc(Challenge.reward)}</b></p>
    <h3>Tuần này (Thứ 7 → Thứ 6)</h3>
    ${weekStrip()}
    <div class="ch-actions"></div>
    <p class="hint center">Mỗi ngày 20 câu: 10 câu Toán, 10 câu Tiếng Việt.<br>Làm xong được 1 ngôi sao (mỗi ngày 1 sao).<br>Tuần thử thách tính từ thứ 7, đủ sao thì nhận thưởng vào thứ 7 để bé đi chơi được.</p>
  </div>`);
  const actions = wrap.querySelector(".ch-actions");
  if (full) {
    actions.appendChild(h(`<div class="ch-full">🎉 Bé đã đủ ${Challenge.GOAL} sao!<br>Bé nhận thưởng vào <b>thứ 7 (${Challenge.rewardDayText})</b> nhé!</div>`));
  }
  if (!Challenge.canEarn() && !full) {
    actions.appendChild(h(`<div class="ch-done">Vòng thử thách mới bắt đầu từ <b>thứ 7 (${Challenge.roundStartText})</b>. Trước đó bé vẫn luyện thêm được nhé!</div>`));
    const b = h(`<button class="primary big-go">▶ Luyện thêm</button>`);
    b.onclick = () => go("challengePlay", true);
    actions.appendChild(b);
    $app.appendChild(wrap);
    return;
  }
  if (done) {
    actions.appendChild(h(`<div class="ch-done">✓ Hôm nay bé đã hoàn thành thử thách. Mai quay lại nhé!</div>`));
    const b = h(`<button class="link-btn">Luyện thêm (không tính sao)</button>`);
    b.onclick = () => go("challengePlay", true);
    actions.appendChild(b);
  } else {
    const t = Challenge.today();
    const label = full ? "▶ Luyện thêm" : t.idx > 0 ? `▶ Tiếp tục (câu ${t.idx + 1}/${Challenge.TOTAL})` : "▶ Bắt đầu";
    const b = h(`<button class="primary big-go">${label}</button>`);
    b.onclick = () => { Sfx.tap(); go("challengePlay", full); };
    actions.appendChild(b);
  }
  $app.appendChild(wrap);
  if (full) confetti();
};

routes.challengePlay = (practice) => {
  $app.appendChild(topbar(practice ? "Luyện thêm" : "Thử thách hôm nay", "challenge"));
  const body = h(`<div class="math-play ch-play"></div>`);
  $app.appendChild(body);
  // Luyện thêm: bộ câu mới, không lưu
  // Luyện thêm: bộ 20 câu mới, không lưu, không tính sao
  const state = practice ? { idx: 0, score: 0, questions: Challenge.build() } : Challenge.today();
  let idx = state.idx, score = state.score;
  const T = state.questions.length;

  function header() {
    return `<div class="progress"><div style="width:${(idx / T) * 100}%"></div></div>
      <div class="qcount">Câu ${idx + 1}/${T} · ✅ ${score}</div>`;
  }
  function nextQ(gotIt) {
    if (gotIt) score++;
    idx++;
    if (!practice) Challenge.progress(idx, score);
    if (idx >= T) return finish();
    setTimeout(show, 0);
  }
  function praise() { Sfx.good(); const m = pick(PRAISES.concat(MATH_PRAISES)); showFeedback(true, m); Speech.speak(m); }
  function oops(msg) { Sfx.bad(); showFeedback(false, msg); return Speech.speak(msg); }

  // Câu chọn đáp án (Toán và các dạng Tiếng Việt có lựa chọn)
  function choice(q, inner, opts, isRight, onPick) {
    let first = true;
    const isViet = q.kind.startsWith("v");
    body.innerHTML = `${header()}<div class="question">${inner}
      ${isViet ? '<div class="spell-area q-spell"></div>' : ""}
      <button class="speak-btn small">🔊 Nghe đề</button></div>
      <div class="answers ${isViet ? "words" : ""}">${answerButtons(opts)}</div>`;
    const area = body.querySelector(".q-spell");
    bindAnswerSpeakers(body, q, area);
    const say = () => Speech.speak(q.say);
    body.querySelector(".speak-btn").onclick = say;
    say();
    body.querySelectorAll(".ans").forEach((b) => (b.onclick = () => {
      const v = b.dataset.v;
      const ok = isRight(v);
      if (onPick) onPick(v, ok);
      if (ok) {
        b.classList.add("right");
        body.querySelectorAll(".ans, .ans-spk").forEach((x) => (x.disabled = true));
        praise();
        if (isViet) {
          // Đọc đúng rồi thì cùng đánh vần lại chữ đó cho nhớ
          setTimeout(async () => { await spellWord(q.word, area); setTimeout(() => nextQ(first), 600); }, 1900);
        } else setTimeout(() => nextQ(first), 2200);
      } else {
        first = false;
        b.classList.add("wrong"); b.disabled = true;
        oops(q.kind.startsWith("v") ? "Chưa đúng, bé thử lại nhé!" : pick(MATH_RETRY));
      }
    }));
  }

  // Câu đọc to: AI nghe bé đọc
  function readAloud(q) {
    let tries = 0;
    body.innerHTML = `${header()}<div class="question">
      <p class="hint">Bé đọc to chữ này nhé!</p>
      <div class="pic small">${q.e}</div>
      <div class="syllables">${VN.syllables(q.word).map((s) => `<span class="syl static">${sylParts(s)}</span>`).join("")}</div>
      <div class="spell-area">${VN.syllables(q.word).map((s) => `<div class="spell-line">${VN.spellPlan(s).map((p) => `<span class="step">${esc(p.show)}</span>`).join('<span class="dash">–</span>')}</div>`).join("")}</div>
      <div class="actions three">
        <button class="act listen"><span>🔊</span>Nghe</button>
        <button class="act spell"><span>🐢</span>Đánh vần</button>
        <button class="act mic"><span>🎤</span>Bé đọc</button>
      </div>
      <div class="heard"></div>
      <div class="parent-check ${Speech.canListen ? "hidden" : ""}"><p>Bố mẹ chấm giúp bé nhé:</p>
        <button class="pc-ok">✓ Bé đọc đúng</button><button class="pc-no">✗ Chưa đúng</button></div>
      <button class="link-btn skip hidden">Câu tiếp theo ▶</button>
    </div>`;
    const mic = body.querySelector(".mic"), heard = body.querySelector(".heard");
    const spellArea = body.querySelector(".spell-area");
    body.querySelector(".listen").onclick = () => Speech.speak(q.word);
    body.querySelector(".spell").onclick = () => spellWord(q.word, spellArea);
    const right = () => { praise(); setTimeout(() => nextQ(tries === 0), 2200); };
    const wrong = async (msg) => {
      tries++;
      await oops(msg);
      // đánh vần lại cho bé
      await spellWord(q.word, spellArea);
      if (tries >= 2) body.querySelector(".skip").classList.remove("hidden");
      Speech.speak("Bé đọc lại nhé!");
    };
    body.querySelector(".skip").onclick = () => nextQ(false);
    body.querySelector(".pc-ok").onclick = right;
    body.querySelector(".pc-no").onclick = () => wrong(pick(RETRY_MSGS));
    mic.onclick = async () => {
      if (!Speech.canListen) { body.querySelector(".parent-check").classList.remove("hidden"); return; }
      mic.classList.add("listening"); mic.innerHTML = "<span>👂</span>Đang nghe...";
      let alts;
      try { alts = await Speech.listen(); }
      catch (e) {
        mic.classList.remove("listening"); mic.innerHTML = "<span>🎤</span>Bé đọc";
        heard.textContent = e.message === "no-speech" ? "Máy chưa nghe thấy, bé đọc to hơn nhé!" : "Micro chưa dùng được, bố mẹ chấm giúp nhé.";
        if (e.message !== "no-speech") body.querySelector(".parent-check").classList.remove("hidden");
        return;
      }
      mic.classList.remove("listening"); mic.innerHTML = "<span>🎤</span>Bé đọc";
      const r = VN.evaluate(q.word, alts);
      heard.innerHTML = `Máy nghe được: <b>“${esc(r.heard || alts[0])}”</b>`;
      if (r.status === "correct") right();
      else wrong(r.status === "tone" ? "Gần đúng rồi! Bé chú ý dấu nhé." : pick(RETRY_MSGS));
    };
    Speech.speak("Bé đọc to chữ này nhé!");
  }

  function show() {
    const q = state.questions[idx];
    if (!q) return finish();
    if (q.kind === "vread") return readAloud(q);
    if (q.kind === "vpic") return choice(q, `<p class="hint">Hình này là chữ nào?</p><div class="pic small">${q.e}</div>`,
      q.options, (v) => v === q.answer);
    if (q.kind === "vlisten") return choice(q, `<p class="hint">Bé nghe rồi chọn đúng chữ nhé!</p><div class="big-ear">👂</div>`,
      q.options, (v) => v === q.answer);
    if (q.kind === "vletter") return choice(q, `<p class="hint">Chữ còn thiếu là chữ gì?</p><div class="pic small">${q.e}</div>
      <div class="missing"><span class="qbox">?</span>${esc(q.rest)}</div>`, q.options, (v) => v === q.answer,
      (v, ok) => { if (ok) { const m = body.querySelector(".missing .qbox"); m.textContent = v; m.classList.add("filled"); } });
    // Toán
    return choice(q, mathQuestionHTML(q), q.options.map(String), (v) => +v === q.answer,
      (v) => mathShowAnswer(q, +v, body));
  }

  function finish() {
    let gotStar = false;
    if (!practice) gotStar = Challenge.complete(score);
    const full = Challenge.stars >= Challenge.GOAL;
    body.innerHTML = `<div class="finish">
      <div class="big-stars ${gotStar ? "pop" : ""}">${gotStar ? "⭐" : "🎉"}</div>
      <h2>Bé làm xong ${T} câu! Đúng ngay ${score} câu.</h2>
      ${gotStar ? `<p class="ch-got">Bé nhận được 1 ngôi sao!</p>` : ""}
      ${starBar()}
      ${full ? `<div class="ch-full">🎁 Bé đã đủ ${Challenge.GOAL} sao! Phần thưởng: <b>${esc(Challenge.reward)}</b><br>Bé nhận thưởng vào thứ 7 (${Challenge.rewardDayText}) nhé!</div>`
        : `<p class="hint">Còn ${Challenge.GOAL - Challenge.stars} sao nữa là bé có quà 🎁</p>`}
      <button class="primary home-btn">Về trang chủ</button></div>`;
    confetti();
    Speech.speak(gotStar
      ? (full ? `Hoan hô! Bé đã đủ ${Challenge.GOAL} ngôi sao. Bé được nhận phần thưởng!` : `Giỏi quá! Bé nhận được một ngôi sao. Bé đã có ${Challenge.stars} ngôi sao.`)
      : `Bé làm xong rồi, đúng ${score} câu. Giỏi lắm!`);
    body.querySelector(".home-btn").onclick = () => go("home");
  }
  show();
};

// =============================================================
//  CÀI ĐẶT (cho bố mẹ)
// =============================================================
routes.settings = () => {
  $app.appendChild(topbar("Cài đặt cho bố mẹ"));
  const wrap = h(`<div class="settings">
    <section><h3>👩 Kiểu giọng đọc</h3>
      <div class="presets">${Speech.PRESETS.map((p) => `<div class="preset ${Speech.settings.preset === p.id ? "on" : ""}" data-id="${p.id}">
        <button class="pick"><span>${p.icon}</span>${p.name}</button><button class="try" aria-label="Nghe thử">🔊</button></div>`).join("")}</div>
      <p class="note">Bấm 🔊 để nghe thử, bấm tên giọng để chọn.</p></section>
    <section><h3>🗣️ Giọng đọc tiếng Việt của máy</h3>
      <select class="voice"></select>
      <p class="note voice-note"></p>
      <label>Tốc độ đọc: <b class="rate-val"></b></label>
      <input type="range" class="rate" min="0.5" max="1.2" step="0.05">
      <button class="primary test-voice">Nghe thử</button></section>
    <section><h3>🎤 Micro chấm đọc</h3>
      <label class="switch-row"><input type="checkbox" id="mic-on" ${Speech.micOn ? "checked" : ""} ${Speech.hasRecognition ? "" : "disabled"}>
        <span><b>Dùng micro để máy chấm bé đọc</b><br><small>Tắt đi thì app không hỏi micro nữa, bố mẹ nghe và bấm ✓ / ✗ để chấm.</small></span></label>
      <details class="mic-help"><summary>📱 iPhone hỏi micro nhiều lần? Xem cách cho phép luôn</summary>
        <ol>
          <li>Mở <b>Cài đặt</b> của iPhone → <b>Safari</b> → kéo xuống mục <b>Cài đặt cho trang web</b> → <b>Micrô</b> → chọn <b>Cho phép</b>.</li>
          <li>Cũng trong Cài đặt → <b>Quyền riêng tư & Bảo mật</b> → <b>Nhận dạng giọng nói</b> → bật cho <b>Safari</b> (hoặc Bắp Học Vui).</li>
          <li>Khi app hỏi, bấm <b>Cho phép</b>. Từ bản này, mỗi lần mở app máy chỉ hỏi <b>một lần</b>.</li>
          <li>Nếu vẫn bị hỏi mỗi lần mở app: đây là giới hạn của Apple với app thêm từ màn hình chính. Bạn có thể <b>tắt micro</b> ở trên để bố mẹ chấm, hoặc mở app bằng <b>tab Safari</b> (Safari nhớ quyền micro tốt hơn).</li>
        </ol></details>
      <p class="note">${Speech.hasRecognition ? "Bấm “Thử micro” rồi nói “con gà”." : "⚠️ Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy dùng Chrome (Android) hoặc Safari (iPhone, iOS 14.5+)."}</p>
      <button class="primary test-mic" ${Speech.canListen ? "" : "disabled"}>Thử micro</button>
      <p class="mic-result"></p></section>
    <section><h3>🏆 Thử thách mỗi ngày</h3>
      <label for="reward">Phần thưởng khi bé đủ ${Challenge.GOAL} sao:</label>
      <input id="reward" class="reward-input" maxlength="80">
      <p class="note">Bé đang có <b class="ch-stars">${Challenge.stars}</b>/${Challenge.GOAL} sao · đã nhận thưởng ${Challenge.rounds} lần.</p>
      <div class="row-btns"><button class="primary star-minus">− 1 sao</button><button class="primary star-plus">+ 1 sao</button></div>
      <button class="primary new-round">Đã trao thưởng → bắt đầu vòng mới</button>
      <p class="note">Vòng mới tính sao từ thứ 7 gần nhất. Vòng hiện tại tính từ thứ 7 (${Challenge.roundStartText}).</p></section>
    <section><h3>⭐ Tiến độ</h3>
      <p class="note">Bé đã có <b>${Object.keys(VIET_LESSONS).reduce((s, k) => s + Progress.count(k), 0)}</b> ngôi sao Tiếng Việt.</p>
      <button class="danger reset">Xoá tiến độ</button></section>
  </div>`);
  $app.appendChild(wrap);

  const sel = wrap.querySelector(".voice");
  function fillVoices() {
    const vs = Speech.voices;
    sel.innerHTML = vs.length ? vs.map((v) => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === Speech.settings.voiceURI ? "selected" : ""}>${esc(v.name)}</option>`).join("")
      : `<option>Mặc định (vi-VN)</option>`;
    wrap.querySelector(".voice-note").textContent = vs.length ? `Máy có ${vs.length} giọng tiếng Việt, đang dùng: ${Speech.currentVoiceName}. Muốn thêm giọng nữ hay hơn: iPhone vào Cài đặt › Trợ năng › Nội dung được đọc › Giọng nói › Tiếng Việt và tải giọng Linh (bản Nâng cao nếu có). Android vào Cài đặt › Chuyển văn bản thành giọng nói › Công cụ của Google › Tiếng Việt › chọn giọng nữ.`
      : "⚠️ Chưa thấy giọng tiếng Việt. Android: Cài đặt › Ngôn ngữ › Chuyển văn bản thành giọng nói › tải Tiếng Việt. iPhone: Cài đặt › Trợ năng › Nội dung được đọc › Giọng nói › Tiếng Việt.";
  }
  fillVoices();
  setTimeout(fillVoices, 800);
  const micToggle = wrap.querySelector("#mic-on");
  micToggle.onchange = () => {
    Speech.setMic(micToggle.checked);
    wrap.querySelector(".test-mic").disabled = !Speech.canListen;
  };
  wrap.querySelectorAll(".preset").forEach((el) => {
    el.querySelector(".try").onclick = () => Speech.previewPreset(el.dataset.id, "Chào bé Bắp! A, mờ, am, cờ, am, cam. Bé giỏi quá!");
    el.querySelector(".pick").onclick = () => {
      Speech.setPreset(el.dataset.id);
      wrap.querySelectorAll(".preset").forEach((x) => x.classList.toggle("on", x === el));
      rate.value = Speech.settings.rate; rv.textContent = Speech.settings.rate;
      Speech.speak("Bé học cùng mình nhé!");
    };
  });
  sel.onchange = () => Speech.setVoice(sel.value);
  const rate = wrap.querySelector(".rate"), rv = wrap.querySelector(".rate-val");
  rate.value = Speech.settings.rate; rv.textContent = Speech.settings.rate;
  rate.oninput = () => { Speech.setRate(+rate.value); rv.textContent = rate.value; };
  wrap.querySelector(".test-voice").onclick = () => Speech.speak("Xin chào bé Bắp! Mình cùng học nhé. Bờ a ba huyền bà.");
  wrap.querySelector(".test-mic").onclick = async () => {
    const out = wrap.querySelector(".mic-result");
    out.textContent = "👂 Đang nghe...";
    try { const a = await Speech.listen(); out.textContent = "Máy nghe được: " + a.join(" | "); }
    catch (e) { out.textContent = "Lỗi: " + e.message; }
  };
  const rw = wrap.querySelector(".reward-input");
  rw.value = Challenge.reward;
  rw.onchange = () => Challenge.setReward(rw.value.trim() || "Một món quà bất ngờ từ bố mẹ 🎁");
  const upd = () => (wrap.querySelector(".ch-stars").textContent = Challenge.stars);
  wrap.querySelector(".star-plus").onclick = () => { Challenge.setStars(Challenge.stars + 1); upd(); };
  wrap.querySelector(".star-minus").onclick = () => { Challenge.setStars(Challenge.stars - 1); upd(); };
  wrap.querySelector(".new-round").onclick = () => {
    if (confirm("Bé đã nhận thưởng? Số sao sẽ về 0 để bắt đầu vòng mới.")) { Challenge.newRound(); render("settings"); }
  };
  wrap.querySelector(".reset").onclick = () => {
    if (confirm("Xoá toàn bộ sao của bé?")) { Progress.reset(); render("settings"); }
  };
};

// ---------------- Khởi động ----------------
history.replaceState({ name: "home", args: [] }, "", "#home");
render("home");

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  // Có bản mới thì tự tải lại trang một lần
  let reloaded = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloaded) { reloaded = true; location.reload(); }
  });
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
    .then((reg) => {
      reg.update().catch(() => {});
      // kiểm tra bản mới mỗi khi bé mở lại app
      document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
    })
    .catch(() => {});
}
