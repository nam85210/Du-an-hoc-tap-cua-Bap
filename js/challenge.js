// =============================================================
//  THỬ THÁCH MỖI NGÀY
//  - Mỗi ngày 20 câu trộn Toán + Tiếng Việt
//  - Làm xong thử thách trong ngày: +1 sao (mỗi ngày tối đa 1 sao)
//  - Đủ 20 sao: bé được phần thưởng (bố mẹ đặt trong Cài đặt)
// =============================================================

const Challenge = (() => {
  const KEY = "bap-challenge";
  const GOAL = 20;      // số sao để nhận thưởng
  const TOTAL = 20;     // số câu mỗi ngày

  const defaults = () => ({ stars: 0, rounds: 0, reward: "Một món quà bất ngờ từ bố mẹ 🎁", days: {}, today: null });
  let st = (() => {
    try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { return defaults(); }
  })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };

  function dateKey(d = new Date()) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  // ---------- Câu hỏi Tiếng Việt ----------
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

  function wordPool(type) {
    return Object.values(VIET_LESSONS).filter((L) => !type || L.type === type).flatMap((L) => L.items);
  }
  // 3 từ gây nhiễu khác chữ, khác hình, cùng loại (đơn/ghép)
  function distractors(item, pool, n = 3) {
    const out = [];
    for (const it of shuffle(pool)) {
      if (out.length >= n) break;
      if (it.w === item.w || it.e === item.e || out.some((o) => o.w === it.w || o.e === it.e)) continue;
      out.push(it);
    }
    return out;
  }

  function vietQuestion(kind, used) {
    const type = Math.random() < 0.55 ? "don" : "ghep";
    const pool = wordPool(type);
    let item;
    for (let t = 0; t < 50; t++) {
      item = pool[rand(0, pool.length - 1)];
      if (used.has(item.w)) continue;
      if (kind === "vletter") {
        const a = VN.analyzeSyllable(item.w);
        if (item.w.includes(" ") || !a.onset) continue;
      }
      break;
    }
    used.add(item.w);

    if (kind === "vread") return { kind, word: item.w, e: item.e, say: item.w };
    if (kind === "vletter") {
      // Chọn phụ âm đầu còn thiếu: "_am" + 🍊 -> c
      const a = VN.analyzeSyllable(item.w);
      const letters = ["b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "s", "t", "v", "x", "ch", "nh", "kh", "th", "tr", "ng", "ph", "qu", "gi"];
      // tránh các cặp đọc giống nhau (c/k/q, g/gh, ng/ngh) để chỉ có 1 đáp án đúng
      const SAME = [["c", "k", "qu"], ["g", "gh", "gi"], ["ng", "ngh"], ["d", "gi"]];
      const clash = (x) => SAME.some((grp) => grp.includes(a.onset) && grp.includes(x));
      const opts = new Set([a.onset]);
      for (const l of shuffle(letters)) { if (opts.size >= 4) break; if (!clash(l)) opts.add(l); }
      return {
        kind, word: item.w, e: item.e, answer: a.onset, rest: item.w.slice(a.onset.length),
        options: shuffle([...opts]), say: `Chữ ${item.w} bắt đầu bằng chữ gì?`,
      };
    }
    const options = shuffle([item, ...distractors(item, pool)]).map((o) => o.w);
    if (kind === "vpic") return { kind, word: item.w, e: item.e, answer: item.w, options, say: "Hình này là chữ nào?" };
    return { kind: "vlisten", word: item.w, e: item.e, answer: item.w, options, say: `Bé tìm chữ: ${item.w}` };
  }

  // ---------- Tạo bộ 20 câu ----------
  function build() {
    let max = 10;
    try { max = +localStorage.getItem("bap-range") || 10; } catch {}
    const math = [
      MathGen.make("add", max), MathGen.make("add", max), MathGen.make("sub", max), MathGen.make("sub", max),
      MathGen.make("balance", max), MathGen.make("balance", max),
      LogicScale.next(), LogicScale.next(), LogicScale.next(), LogicScale.kitchen(),
    ];
    const used = new Set();
    const viet = ["vread", "vread", "vread", "vpic", "vpic", "vpic", "vlisten", "vlisten", "vletter", "vletter"]
      .map((k) => vietQuestion(k, used));
    // xen kẽ: Toán – Tiếng Việt – Toán – ...
    const m = shuffle(math), v = shuffle(viet), qs = [];
    for (let i = 0; i < TOTAL / 2; i++) qs.push(m[i], v[i]);
    return qs;
  }

  /** Lấy (hoặc tạo) thử thách hôm nay */
  function today() {
    const d = dateKey();
    if (!st.today || st.today.date !== d) {
      st.today = { date: d, idx: 0, score: 0, questions: build() };
      save();
    }
    return st.today;
  }

  function doneToday() { return !!(st.days[dateKey()] && st.days[dateKey()].done); }

  /** Ghi lại tiến độ câu hiện tại */
  function progress(idx, score) { if (st.today) { st.today.idx = idx; st.today.score = score; save(); } }

  /** Hoàn thành thử thách: trả về true nếu được cộng sao */
  function complete(score) {
    const d = dateKey();
    const first = !doneToday();
    st.days[d] = { done: true, score: Math.max(score, (st.days[d] && st.days[d].score) || 0) };
    if (first) st.stars = Math.min(GOAL, st.stars + 1);
    st.today = null;
    save();
    return first;
  }

  /** 7 ngày trong tuần này (Thứ 2 -> CN) */
  function week() {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7; // 0 = thứ 2
    const names = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    return names.map((n, i) => {
      const d = new Date(now); d.setDate(now.getDate() - dow + i);
      const k = dateKey(d);
      return { name: n, key: k, done: !!(st.days[k] && st.days[k].done), isToday: i === dow, future: i > dow };
    });
  }

  return {
    GOAL, TOTAL, build, today, doneToday, progress, complete, week, dateKey,
    get stars() { return st.stars; },
    get reward() { return st.reward; },
    get rounds() { return st.rounds; },
    get inProgress() { return !!(st.today && st.today.date === dateKey() && st.today.idx > 0); },
    setReward(t) { st.reward = t; save(); },
    setStars(n) { st.stars = Math.max(0, Math.min(GOAL, n)); save(); },
    newRound() { st.stars = 0; st.rounds++; save(); },
    restartToday() { st.today = null; save(); },
  };
})();
