// =============================================================
//  GIAO DIỆN ỨNG DỤNG "BẮP HỌC VUI"
// =============================================================

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
    <div class="hero"><div class="mascot">🌽</div>
      <h1>Bắp Học Vui</h1><p>Chuẩn bị vào lớp 1</p></div>
    <button class="big-card math" data-go="mathMenu"><span class="emoji">🔢</span><span>Toán</span><small>Cộng · Trừ · Cân thăng bằng</small></button>
    <button class="big-card viet" data-go="vietMenu"><span class="emoji">📚</span><span>Tiếng Việt</span><small>Chữ cái · Từ đơn · Từ ghép · Câu</small></button>
    <button class="install-btn ${Install.isInstalled() ? "hidden" : ""}">📲 Cài app lên màn hình chính</button>
    <button class="link-btn" data-go="settings">⚙️ Cài đặt cho bố mẹ</button>
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
  { id: "balance", icon: "⚖️", title: "Cân thăng bằng", sub: "Tìm số để 2 bên bằng nhau" },
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
    const q = MathGen.make(mode, max);
    let firstTry = true;
    body.innerHTML = `
      <div class="progress"><div style="width:${((n - 1) / TOTAL) * 100}%"></div></div>
      <div class="qcount">Câu ${n}/${TOTAL} · ⭐ ${score}</div>
      <div class="question">
        ${q.kind === "balance"
          ? `<p class="hint">Bé chọn số để cân thăng bằng nhé!</p><div class="scale-box">${balanceSVG(q, null)}</div>`
          : `${mathVisual(q.visual)}<div class="equation">${q.text.map((t) => `<span class="${t === "?" ? "qbox" : ""}">${t}</span>`).join("")}</div>`}
        <button class="speak-btn small" aria-label="Nghe đề bài">🔊 Nghe đề</button>
      </div>
      <div class="answers">${q.options.map((o) => `<button class="ans" data-v="${o}">${o}</button>`).join("")}</div>`;
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
          <span class="syl-text">${esc(s)}</span><span class="syl-spk">🔊</span></button>`).join("")}
      </div>
      <button class="speak-btn" aria-label="Nghe cả từ">🔊</button>
    </div>
    <div class="spell-area" aria-live="polite"></div>
    <div class="actions">
      <button class="act spell"><span>🐢</span>Đánh vần</button>
      <button class="act mic"><span>🎤</span>Bé đọc</button>
    </div>
    <div class="heard"></div>
    <div class="parent-check hidden">
      <p>Máy này chưa nghe được giọng nói. Bố mẹ chấm giúp bé nhé:</p>
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
    const steps = VN.spellSteps(syls[i]);
    const els = line ? [...line.querySelectorAll(".step")] : [];
    sylBtns.forEach((b, j) => b.classList.toggle("active", j === i));
    await Speech.speakSteps(steps, (k) => els.forEach((e, j) => e.classList.toggle("hl", j === k)));
    sylBtns.forEach((b) => b.classList.remove("active"));
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
  // 🔊 từng tiếng: đọc tiếng đó + đánh vần
  sylBtns.forEach((b, i) => (b.onclick = async () => {
    if (busy) return; busy = true;
    await Speech.speak(syls[i]);
    if (!isSentence) await spellSyllable(i);
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

// =============================================================
//  CÀI ĐẶT (cho bố mẹ)
// =============================================================
routes.settings = () => {
  $app.appendChild(topbar("Cài đặt cho bố mẹ"));
  const wrap = h(`<div class="settings">
    <section><h3>🗣️ Giọng đọc tiếng Việt</h3>
      <select class="voice"></select>
      <p class="note voice-note"></p>
      <label>Tốc độ đọc: <b class="rate-val"></b></label>
      <input type="range" class="rate" min="0.5" max="1.2" step="0.05">
      <button class="primary test-voice">Nghe thử</button></section>
    <section><h3>🎤 Kiểm tra micro</h3>
      <p class="note">${Speech.canListen ? "Máy hỗ trợ nhận giọng nói. Bấm nút rồi nói “con gà”." : "⚠️ Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy dùng Chrome (Android) hoặc Safari (iPhone, iOS 14.5+)."}</p>
      <button class="primary test-mic" ${Speech.canListen ? "" : "disabled"}>Thử micro</button>
      <p class="mic-result"></p></section>
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
    wrap.querySelector(".voice-note").textContent = vs.length ? `Tìm thấy ${vs.length} giọng tiếng Việt.`
      : "⚠️ Chưa thấy giọng tiếng Việt. Android: Cài đặt › Ngôn ngữ › Chuyển văn bản thành giọng nói › tải Tiếng Việt. iPhone: Cài đặt › Trợ năng › Nội dung được đọc › Giọng nói › Tiếng Việt.";
  }
  fillVoices();
  setTimeout(fillVoices, 800);
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
  wrap.querySelector(".reset").onclick = () => {
    if (confirm("Xoá toàn bộ sao của bé?")) { Progress.reset(); render("settings"); }
  };
};

// ---------------- Khởi động ----------------
history.replaceState({ name: "home", args: [] }, "", "#home");
render("home");

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
