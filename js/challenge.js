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
  if (!st.roundStart) st.roundStart = null; // gán ở dưới khi đã có hàm ngày
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };

  // ---------- Tuần thử thách tính từ THỨ 7 ----------
  // (đủ sao vào cuối tuần thì bé được đi chơi luôn, không vướng ngày đi học)
  function lastSaturday(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 1) % 7)); // getDay: 6 = thứ 7
    return x;
  }
  function nextSaturday(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + ((6 - x.getDay() + 7) % 7)); // hôm nay là thứ 7 thì lấy hôm nay
    return x;
  }
  function fromKey(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
  function niceDate(k) { const d = fromKey(k); return `${d.getDate()}/${d.getMonth() + 1}`; }

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

  if (!st.roundStart) { st.roundStart = dateKey(lastSaturday()); save(); }

  // Bố mẹ yêu cầu làm lại thử thách từ đầu: chỉ chạy MỘT lần trên mỗi máy
  try {
    if (!localStorage.getItem("bap-challenge-reset-1")) {
      const reward = st.reward;
      st = defaults(); st.reward = reward; st.roundStart = dateKey(lastSaturday()); save();
      localStorage.setItem("bap-challenge-reset-1", "1");
    }
    // Bố mẹ muốn thử: đặt sẵn 19 sao (chỉ MỘT lần trên mỗi máy).
    // Hôm nay chưa tính là đã làm, để bé làm xong thử thách sẽ được sao thứ 20.
    if (!localStorage.getItem("bap-test-19-sao")) {
      st.stars = 19; st.fullDate = null;
      if (st.roundStart > dateKey()) st.roundStart = dateKey(lastSaturday());
      delete st.days[dateKey()];
      if (st.today && st.today.date !== dateKey()) st.today = null;
      save();
      localStorage.setItem("bap-test-19-sao", "1");
    }
  } catch {}

  /** Hôm nay đã được tính sao chưa (vòng mới bắt đầu từ thứ 7) */
  function canEarn() { return dateKey() >= st.roundStart; }

  function doneToday() { return !!(st.days[dateKey()] && st.days[dateKey()].done); }

  /** Ghi lại tiến độ câu hiện tại */
  function progress(idx, score) { if (st.today) { st.today.idx = idx; st.today.score = score; save(); } }

  /** Hoàn thành thử thách: trả về true nếu được cộng sao */
  function complete(score) {
    const d = dateKey();
    const first = !doneToday();
    st.days[d] = { done: true, score: Math.max(score, (st.days[d] && st.days[d].score) || 0) };
    const earned = first && canEarn() && st.stars < GOAL;
    if (earned) {
      st.stars++;
      if (st.stars >= GOAL) st.fullDate = d;
    }
    st.today = null;
    save();
    return earned;
  }

  /** 7 ngày trong tuần này (Thứ 2 -> CN) */
  function week() {
    // Tuần thử thách: Thứ 7 -> Thứ 6
    const start = lastSaturday();
    const today = dateKey();
    const names = ["T7", "CN", "T2", "T3", "T4", "T5", "T6"];
    return names.map((n, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = dateKey(d);
      return { name: n, date: `${d.getDate()}/${d.getMonth() + 1}`, key: k, done: !!(st.days[k] && st.days[k].done), isToday: k === today, future: k > today };
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
    // Vòng mới bắt đầu từ thứ 7 (hôm nay là thứ 7 thì tính luôn hôm nay)
    newRound() { st.stars = 0; st.rounds++; st.fullDate = null; st.roundStart = dateKey(nextSaturday()); save(); },
    canEarn,
    get roundStartText() { return niceDate(st.roundStart); },
    /** Ngày nhận thưởng: thứ 7 đầu tiên kể từ ngày bé đủ sao */
    get rewardDayText() { return st.fullDate ? niceDate(dateKey(nextSaturday(fromKey(st.fullDate)))) : ""; },
    restartToday() { st.today = null; save(); },
    /** Xoá toàn bộ thử thách: 0 sao, xoá lịch, tính lại từ thứ 7 vừa qua (giữ phần thưởng bố mẹ đặt) */
    resetAll() {
      const reward = st.reward;
      st = defaults(); st.reward = reward; st.roundStart = dateKey(lastSaturday()); save();
    },
  };
})();
