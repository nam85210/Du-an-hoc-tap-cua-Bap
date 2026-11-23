// =============================================================
//  LỌ SAO: các ngôi sao rơi, chồng lên nhau lộn xộn như thật.
//  Lắc điện thoại (hoặc chạm vào lọ) thì sao bị xáo trộn.
// =============================================================

const StarJar = (() => {
  const R = 17;          // bán kính một ngôi sao (px)
  const G = 0.45;        // trọng lực
  const CORNER = 46;     // bo tròn đáy lọ
  let active = null;     // lọ đang hiển thị (để nhận sự kiện lắc)

  function mount(body, n, { drop = false, onLand } = {}) {
    if (active) active.destroy();
    const W = body.clientWidth, H = body.clientHeight;
    const layer = document.createElement("div");
    layer.className = "jar-stars-phys";
    body.appendChild(layer);

    const stars = [];
    function addStar(x, y, vy = 0) {
      const el = document.createElement("span");
      el.className = "pstar";
      el.textContent = "⭐";
      layer.appendChild(el);
      const s = { x, y, vx: (Math.random() - 0.5) * 2, vy, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 8, el, inside: y > R };
      stars.push(s);
      return s;
    }

    // Vật lý đơn giản: trọng lực, va chạm giữa các sao, va vào thành lọ
    function step() {
      for (const s of stars) {
        s.vy += G;
        s.vx *= 0.99; s.vy *= 0.99; s.vr *= 0.97;
        s.x += s.vx; s.y += s.vy; s.rot += s.vr;
        if (s.y > R + 2) s.inside = true;
      }
      for (let it = 0; it < 4; it++) {
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const a = stars[i], b = stars[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const d = Math.hypot(dx, dy) || 0.01, min = R * 1.85;
            if (d < min) {
              const nx = dx / d, ny = dy / d, push = (min - d) / 2;
              a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
              const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
              if (rel < 0) {
                const imp = rel * 0.6;
                a.vx += nx * imp; a.vy += ny * imp; b.vx -= nx * imp; b.vy -= ny * imp;
                a.vr += (Math.random() - 0.5) * 2; b.vr += (Math.random() - 0.5) * 2;
              }
            }
          }
        }
        for (const s of stars) walls(s);
      }
    }
    function walls(s) {
      const left = R + 2, right = W - R - 2, bottom = H - R - 4;
      if (s.x < left) { s.x = left; s.vx = Math.abs(s.vx) * 0.4; }
      if (s.x > right) { s.x = right; s.vx = -Math.abs(s.vx) * 0.4; }
      if (s.inside && s.y < R + 2) { s.y = R + 2; s.vy = Math.abs(s.vy) * 0.4; }
      if (s.y > bottom) { s.y = bottom; s.vy = -Math.abs(s.vy) * 0.3; s.vx *= 0.85; s.vr *= 0.8; }
      // đáy bo tròn
      for (const cx of [CORNER, W - CORNER]) {
        const cy = H - CORNER;
        const onSide = cx === CORNER ? s.x < cx : s.x > cx;
        if (onSide && s.y > cy) {
          const dx = s.x - cx, dy = s.y - cy, d = Math.hypot(dx, dy), max = CORNER - R - 4;
          if (d > max) {
            const nx = dx / d, ny = dy / d;
            s.x = cx + nx * max; s.y = cy + ny * max;
            const vn = s.vx * nx + s.vy * ny;
            if (vn > 0) { s.vx -= 1.3 * vn * nx; s.vy -= 1.3 * vn * ny; }
          }
        }
      }
    }
    function draw() {
      for (const s of stars) s.el.style.transform = `translate(${s.x - R}px, ${s.y - R}px) rotate(${s.rot}deg)`;
    }

    // Sao có sẵn: thả ngẫu nhiên rồi cho rơi trước khi hiện ra -> nằm lộn xộn
    for (let i = 0; i < n - (drop ? 1 : 0); i++) {
      addStar(R + Math.random() * (W - 2 * R), H * 0.15 + Math.random() * H * 0.6, 0).inside = true;
    }
    for (let k = 0; k < 260; k++) step();
    draw();

    let raf = 0, calm = 0, alive = true;
    function loop() {
      if (!alive) return;
      step(); draw();
      const moving = stars.some((s) => Math.abs(s.vx) + Math.abs(s.vy) > 0.25);
      calm = moving ? 0 : calm + 1;
      if (calm > 40) { raf = 0; return; }   // đứng yên thì dừng cho đỡ tốn pin
      raf = requestAnimationFrame(loop);
    }
    function wake() { calm = 0; if (!raf) raf = requestAnimationFrame(loop); }

    // Ngôi sao mới rơi từ miệng lọ xuống
    if (drop) {
      setTimeout(() => {
        const s = addStar(W / 2 + (Math.random() - 0.5) * 40, -170, 2);
        s.vr = 14;
        draw(); wake();
        let landed = false;
        const check = () => {
          if (!alive || landed) return;
          if (s.inside && Math.abs(s.vy) < 1.2 && s.y > H * 0.3) { landed = true; if (onLand) onLand(); return; }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      }, 350);
    }

    const ctl = {
      /** Xáo trộn sao. strength ~ 1..3 */
      shake(strength = 1.5, dirX = 0) {
        for (const s of stars) {
          s.vx += (Math.random() - 0.5) * 10 * strength + dirX * 3;
          s.vy -= 3 + Math.random() * 8 * strength;
          s.vr += (Math.random() - 0.5) * 30 * strength;
        }
        wake();
      },
      destroy() { alive = false; cancelAnimationFrame(raf); layer.remove(); if (active === ctl) active = null; },
    };
    active = ctl;
    wake();
    body.addEventListener("click", () => { ctl.shake(1.4); try { Sfx.tap(); } catch {} });
    return ctl;
  }

  // ---------- Lắc điện thoại ----------
  let lastShake = 0, listening = false;
  function onMotion(e) {
    if (!active || !document.body.contains(document.querySelector(".jar-stars-phys"))) return;
    const a = e.acceleration && e.acceleration.x != null ? e.acceleration : null;
    let mag, ax = 0;
    if (a) { ax = a.x || 0; mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0); }
    else if (e.accelerationIncludingGravity) {
      const g = e.accelerationIncludingGravity; ax = g.x || 0;
      mag = Math.abs(Math.hypot(g.x || 0, g.y || 0, g.z || 0) - 9.8);
    } else return;
    const now = Date.now();
    if (mag > 7 && now - lastShake > 120) {
      lastShake = now;
      active.shake(Math.min(3, mag / 9), Math.max(-1, Math.min(1, ax / 10)));
    }
  }
  function listen() {
    if (listening) return;
    listening = true;
    window.addEventListener("devicemotion", onMotion);
  }
  /** iPhone cần bé/bố mẹ bấm cho phép một lần */
  const needsPermission = () => typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function";
  async function enableShake() {
    if (needsPermission()) {
      try {
        const r = await DeviceMotionEvent.requestPermission();
        if (r !== "granted") return false;
      } catch { return false; }
    }
    listen();
    return true;
  }
  // Android/máy không cần xin quyền: nghe luôn
  if (typeof window !== "undefined" && "DeviceMotionEvent" in window && !needsPermission()) listen();

  return { mount, enableShake, needsPermission: () => needsPermission() && !listening };
})();
