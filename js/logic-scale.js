// =============================================================
//  TOÁN TƯ DUY: CÂN ĐỒ VẬT & CÂN ĐỒNG HỒ
//  - Bộ câu chọn lọc (làm lại bằng emoji từ các dạng bài trong
//    phiếu bài tập bố mẹ gửi, chỉ giữ các câu có đáp án đúng,
//    các câu sai đã được sửa lại số cho đúng)
//  - Bộ tạo bài ngẫu nhiên, nhớ các bài đã ra để không lặp lại
// =============================================================

const LogicScale = (() => {
  // ---------- Danh mục đồ vật: emoji -> tên gọi (có loại từ) ----------
  const N = {
    "🍎": "quả táo", "🍊": "quả cam", "🍌": "quả chuối", "🍐": "quả lê", "🍉": "quả dưa hấu",
    "🥭": "quả xoài", "🍓": "quả dâu", "🍇": "chùm nho", "🍍": "quả dứa", "🥝": "quả kiwi",
    "🍑": "quả đào", "🍈": "quả bưởi", "🥥": "quả dừa", "🍋": "quả chanh",
    "🥕": "củ cà rốt", "🍆": "quả cà tím", "🌶️": "quả ớt", "🎃": "quả bí ngô", "🥔": "củ khoai tây",
    "🧅": "củ hành", "🫑": "quả ớt chuông", "🌽": "bắp ngô",
    "🧁": "cái bánh ngọt", "🍰": "miếng bánh kem", "🎂": "cái bánh sinh nhật", "🍬": "viên kẹo",
    "🍭": "cây kẹo mút", "🍫": "thanh sô cô la", "🍩": "cái bánh rán", "🍪": "cái bánh quy",
    "🍦": "cây kem", "🍯": "hũ mật ong", "🥛": "cốc sữa", "🧋": "cốc trà sữa", "🍕": "cái bánh pizza",
    "🍗": "cái đùi gà", "🥫": "hộp đậu", "🍼": "bình sữa", "🍿": "hộp bỏng ngô", "🧃": "hộp nước",
    "🐷": "con lợn", "🦔": "con nhím", "🐸": "con ếch", "🐿️": "con sóc", "🕊️": "con chim bồ câu",
    "🐞": "con bọ rùa", "🦆": "con vịt", "🐥": "con gà con", "🦢": "con ngỗng", "🐔": "con gà",
    "🐱": "con mèo", "🐰": "con thỏ", "🐭": "con chuột", "🦁": "con sư tử", "🦛": "con hà mã",
    "🦒": "con hươu cao cổ", "🐘": "con voi", "🐶": "con chó", "🐯": "con hổ", "🦌": "con hươu",
    "🦘": "con chuột túi", "🦅": "con đại bàng", "🦩": "con hồng hạc", "🪱": "con giun", "🐢": "con rùa",
    "🐟": "con cá", "🐻": "con gấu", "🐤": "con vịt con", "🐦": "con chim", "🦦": "con rái cá",
    "🧸": "con gấu bông", "🦖": "con khủng long", "🤖": "con rô bốt", "👾": "con quái vật",
    "🪇": "cái lúc lắc", "⚽": "quả bóng", "🏀": "quả bóng rổ", "🎾": "quả bóng tennis",
    "⚪": "quả bóng bàn", "🧩": "miếng ghép", "🪁": "con diều", "🎈": "quả bóng bay", "🪀": "con quay",
    "✈️": "máy bay", "🚗": "ô tô", "🚚": "xe tải", "🚤": "ca nô", "🚀": "tên lửa", "🚢": "tàu thủy",
    "🚁": "trực thăng", "🎁": "hộp quà", "🍄": "cây nấm", "🌰": "hạt dẻ",
    "❤️": "trái tim", "⭐": "ngôi sao", "🟩": "hình vuông xanh", "🔵": "hình tròn xanh",
    "🔺": "hình tam giác", "🟥": "hình vuông đỏ", "🟨": "hình vuông vàng", "🟣": "hình tròn tím",
    "🔶": "hình thoi cam", "🟪": "hình vuông tím", "🟢": "hình tròn lục",
  };
  const name = (e) => N[e] || "đồ vật";
  const NUM = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười",
    "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín", "hai mươi"];

  // Nhóm đồ vật để ghép bài cho tự nhiên (sắp từ nặng -> nhẹ)
  const GROUPS = [
    ["🍉", "🍈", "🍍", "🥥", "🍐", "🍎", "🍊", "🥭", "🍑", "🍋", "🥝", "🍓"],
    ["🎃", "🌽", "🍆", "🫑", "🥕", "🥔", "🧅", "🌶️"],
    ["🎂", "🍕", "🍯", "🍰", "🧁", "🍩", "🥛", "🍪", "🍫", "🍭", "🍬"],
    ["🐘", "🦛", "🦁", "🐯", "🦒", "🦌", "🐷", "🐶", "🐱", "🐔", "🦆", "🐰", "🐿️", "🦔", "🐸", "🐭", "🐞"],
    ["🚢", "✈️", "🚁", "🚚", "🚗", "🚤", "🚀", "🧸", "🤖", "⚽", "🪀", "🧩"],
    ["❤️", "🟪", "🟣", "🟥", "🔵", "🟩", "🔶", "🔺", "⭐"],
  ];

  // ---------- Bộ câu chọn lọc ----------
  // Mỗi bài: givens = các cân đã thăng bằng [[trái], [phải]], mỗi bên là [[emoji, số lượng], ...]
  // ask = bên trái của cân hỏi, unit = đơn vị cần tìm, w = khối lượng thử để tự kiểm tra đáp án
  const CURATED = [
    // --- Dạng gấp lên (1 cân) ---
    { givens: [[[["🍎", 1]], [["🍊", 2]]]], ask: [["🍎", 2]], unit: "🍊", w: { "🍎": 2, "🍊": 1 } },
    { givens: [[[["🍌", 1]], [["🍐", 2]]]], ask: [["🍌", 2]], unit: "🍐", w: { "🍌": 2, "🍐": 1 } },
    { givens: [[[["🍉", 1]], [["🥭", 3]]]], ask: [["🍉", 2]], unit: "🥭", w: { "🍉": 3, "🥭": 1 } },
    { givens: [[[["🍊", 1]], [["🍓", 2]]]], ask: [["🍊", 2]], unit: "🍓", w: { "🍊": 2, "🍓": 1 } },
    { givens: [[[["🍈", 1]], [["🥕", 4]]]], ask: [["🍈", 2]], unit: "🥕", w: { "🍈": 4, "🥕": 1 } },
    { givens: [[[["🎁", 1]], [["🧸", 4]]]], ask: [["🎁", 2]], unit: "🧸", w: { "🎁": 4, "🧸": 1 } },
    { givens: [[[["🍬", 2]], [["❤️", 2]]]], ask: [["🍬", 1]], unit: "❤️", w: { "🍬": 1, "❤️": 1 } },
    { givens: [[[["🧁", 2]], [["🍬", 6]]]], ask: [["🧁", 1]], unit: "🍬", w: { "🧁": 3, "🍬": 1 } },
    { givens: [[[["🍰", 3]], [["🍬", 6]]]], ask: [["🍰", 2]], unit: "🍬", w: { "🍰": 2, "🍬": 1 } },
    // --- Dạng bắc cầu (2 cân) ---
    { givens: [[[["🧸", 1]], [["🦖", 1]]], [[["🦖", 1]], [["🤖", 2]]]], ask: [["🧸", 1]], unit: "🤖", w: { "🧸": 2, "🦖": 2, "🤖": 1 } },
    { givens: [[[["🦆", 1]], [["🍼", 2]]], [[["🍼", 1]], [["🪇", 2]]]], ask: [["🦆", 1]], unit: "🪇", w: { "🦆": 4, "🍼": 2, "🪇": 1 } },
    { givens: [[[["🎂", 1]], [["🧁", 3]]], [[["🧁", 1]], [["🍬", 2]]]], ask: [["🎂", 1]], unit: "🍬", w: { "🎂": 6, "🧁": 2, "🍬": 1 } },
    { givens: [[[["🍭", 1]], [["🍬", 2]]], [[["🍫", 4]], [["🍭", 1]]]], ask: [["🍬", 1]], unit: "🍫", w: { "🍭": 4, "🍬": 2, "🍫": 1 } },
    { givens: [[[["🍦", 1]], [["🍬", 2]]], [[["🍪", 6]], [["🍦", 1]]]], ask: [["🍬", 1]], unit: "🍪", w: { "🍦": 6, "🍬": 3, "🍪": 1 } },
    { givens: [[[["🐷", 1]], [["🦔", 2]]], [[["🦔", 1]], [["🐸", 2]]]], ask: [["🐷", 1]], unit: "🐸", w: { "🐷": 4, "🦔": 2, "🐸": 1 } },
    { givens: [[[["🐿️", 1]], [["🕊️", 2]]], [[["🕊️", 1]], [["🐞", 3]]]], ask: [["🐿️", 2]], unit: "🕊️", w: { "🐿️": 6, "🕊️": 3, "🐞": 1 } },
    { givens: [[[["🦒", 1]], [["⚽", 2]]], [[["⚽", 1]], [["🧩", 2]]]], ask: [["🦒", 1]], unit: "🧩", w: { "🦒": 4, "⚽": 2, "🧩": 1 } },
    { givens: [[[["🏀", 1]], [["🪁", 2]]], [[["🪁", 1]], [["🎈", 1]]]], ask: [["🏀", 2]], unit: "🎈", w: { "🏀": 2, "🪁": 1, "🎈": 1 } },
    { givens: [[[["✈️", 1]], [["🐦", 2]]], [[["🐦", 1]], [["🍩", 2]]]], ask: [["✈️", 2]], unit: "🍩", w: { "✈️": 4, "🐦": 2, "🍩": 1 } },
    { givens: [[[["🚚", 1]], [["🚤", 1]]], [[["🚤", 1]], [["🚀", 2]]]], ask: [["🚚", 2]], unit: "🚀", w: { "🚚": 2, "🚤": 2, "🚀": 1 } },
    { givens: [[[["🍎", 4]], [["🍉", 1]]], [[["🥭", 1]], [["🍎", 2]]]], ask: [["🍉", 1]], unit: "🥭", w: { "🍎": 1, "🍉": 4, "🥭": 2 } },
    { givens: [[[["🍎", 1]], [["🍓", 3]]], [[["🍓", 9]], [["🥥", 1]]]], ask: [["🥥", 1]], unit: "🍎", w: { "🍎": 3, "🍓": 1, "🥥": 9 } },
    { givens: [[[["❤️", 1]], [["⭐", 1], ["🟩", 2]]], [[["🟩", 1]], [["⭐", 2]]]], ask: [["❤️", 1]], unit: "⭐", w: { "❤️": 5, "⭐": 1, "🟩": 2 } },
    { givens: [[[["🟣", 2]], [["🔵", 2]]], [[["🔵", 1]], [["🔶", 3]]]], ask: [["🟣", 2]], unit: "🔶", w: { "🟣": 3, "🔵": 3, "🔶": 1 } },
    { givens: [[[["🐥", 3]], [["🐤", 1]]], [[["🐤", 2]], [["🦢", 1]]]], ask: [["🦢", 1]], unit: "🐥", w: { "🐥": 1, "🐤": 3, "🦢": 6 } },
    { givens: [[[["🐔", 1]], [["🐿️", 2]]], [[["🐿️", 4]], [["🐷", 1]]]], ask: [["🐷", 1]], unit: "🐔", w: { "🐔": 2, "🐿️": 1, "🐷": 4 } },
    { givens: [[[["🐱", 1]], [["🐰", 2]]], [[["🐰", 3]], [["🐥", 4]]]], ask: [["🐱", 3]], unit: "🐥", w: { "🐱": 8, "🐰": 4, "🐥": 3 } },
    { givens: [[[["🍐", 1]], [["🥝", 2]]], [[["🥝", 1]], [["🍓", 4]]]], ask: [["🍐", 1]], unit: "🍓", w: { "🍐": 8, "🥝": 4, "🍓": 1 } },
    { givens: [[[["🍍", 1]], [["🍊", 3]]], [[["🍊", 2]], [["🍎", 4]]]], ask: [["🍍", 1]], unit: "🍎", w: { "🍍": 6, "🍊": 2, "🍎": 1 } },
    // (Câu 10/12 trong phiếu bị in nhầm hình quả lê ở cân hỏi -> đã sửa thành quả bóng)
    { givens: [[[["⚽", 1]], [["🚗", 2]]], [[["🚗", 1]], [["🚀", 4]]]], ask: [["⚽", 1]], unit: "🚀", w: { "⚽": 8, "🚗": 4, "🚀": 1 } },
    { givens: [[[["🐷", 1]], [["🐰", 3]]], [[["🐰", 1]], [["🐭", 2]]]], ask: [["🐷", 1]], unit: "🐭", w: { "🐷": 6, "🐰": 2, "🐭": 1 } },
    { givens: [[[["🦔", 4]], [["🦁", 1]]], [[["🦔", 2]], [["🦛", 1]]]], ask: [["🦁", 1]], unit: "🦛", w: { "🦔": 1, "🦁": 4, "🦛": 2 } },
    { givens: [[[["🎃", 1]], [["🍆", 3]]], [[["🍆", 2]], [["🌶️", 6]]]], ask: [["🎃", 1]], unit: "🌶️", w: { "🎃": 9, "🍆": 3, "🌶️": 1 } },
    { givens: [[[["🟪", 1]], [["🟥", 2]]], [[["🔺", 3]], [["🟥", 1]]]], ask: [["🟪", 1]], unit: "🔺", w: { "🟪": 6, "🟥": 3, "🔺": 1 } },
    { givens: [[[["🍈", 1]], [["🥭", 3]]], [[["🥭", 1]], [["🍊", 2]]]], ask: [["🍈", 1]], unit: "🍊", w: { "🍈": 6, "🥭": 2, "🍊": 1 } },
    // (Câu 18 trong phiếu không có đáp án đúng: 1 bóng rổ = 8 bóng bàn -> đã sửa đáp án)
    { givens: [[[["🏀", 1]], [["🎾", 2]]], [[["⚪", 4]], [["🎾", 1]]]], ask: [["🏀", 1]], unit: "⚪", w: { "🏀": 8, "🎾": 4, "⚪": 1 } },
    // --- Dạng nhiều cân (nâng cao) ---
    { givens: [[[["🍦", 2]], [["🍿", 3]]], [[["🍼", 1], ["🍿", 2]], [["🧋", 3]]], [[["🍼", 2]], [["🧋", 4]]]], ask: [["🍦", 4]], unit: "🧋", w: { "🍦": 3, "🍿": 2, "🍼": 8, "🧋": 4 } },
    { givens: [[[["👾", 2]], [["🤖", 1], ["🦦", 1]]], [[["🦦", 2]], [["🍄", 4]]], [[["🍄", 1], ["🦦", 1]], [["🤖", 3]]]], ask: [["👾", 4]], unit: "🍄", w: { "👾": 3, "🤖": 2, "🦦": 4, "🍄": 2 } },
    { givens: [[[["🚀", 3]], [["🚢", 1], ["🚁", 1]]], [[["🚁", 1], ["🚗", 3]], [["🚢", 1], ["🚗", 1]]], [[["🚁", 1]], [["🚗", 2]]]], ask: [["🚀", 4]], unit: "🚗", w: { "🚀": 2, "🚢": 4, "🚁": 2, "🚗": 1 } },
    { givens: [[[["🦌", 1], ["🐯", 2]], [["🦁", 2]]], [[["🐯", 2]], [["🦌", 5]]]], ask: [["🦌", 9]], unit: "🦁", w: { "🦌": 2, "🐯": 5, "🦁": 6 } },
    { givens: [[[["🍊", 1]], [["🍓", 2], ["🌰", 1]]], [[["🌰", 10]], [["🍊", 2]]], [[["🍓", 6]], [["🍎", 2]]]], ask: [["🍎", 1]], unit: "🌰", w: { "🍊": 5, "🍓": 2, "🌰": 1, "🍎": 6 } },
    { givens: [[[["🍉", 1], ["🍌", 2]], [["🍐", 4]]], [[["🍉", 2]], [["🍍", 4]]], [[["🍍", 2]], [["🍐", 3]]]], ask: [["🍐", 2]], unit: "🍌", w: { "🍉": 6, "🍌": 1, "🍐": 2, "🍍": 3 } },
    { givens: [[[["🍕", 2]], [["🥛", 4]]], [[["🍗", 4]], [["🥛", 3]]]], ask: [["🍗", 8]], unit: "🍕", w: { "🍕": 8, "🥛": 4, "🍗": 3 } },
    { givens: [[[["🥔", 1], ["🥕", 2]], [["🎃", 1], ["🥔", 2]]], [[["🥔", 5]], [["🥕", 2]]]], ask: [["🥔", 8]], unit: "🎃", w: { "🥔": 2, "🥕": 5, "🎃": 8 } },
    { givens: [[[["🍯", 3]], [["🎂", 1], ["🥛", 2]]], [[["🥛", 4]], [["🥫", 2]]], [[["🎂", 1]], [["🥫", 5]]]], ask: [["🍯", 2], ["🥫", 1]], unit: "🥛", w: { "🍯": 4, "🎂": 10, "🥛": 1, "🥫": 2 } },
    { givens: [[[["🟥", 1], ["🔵", 1]], [["🔺", 1], ["🟩", 1]]], [[["🟥", 2], ["🟩", 2]], [["🔺", 2]]]], ask: [["🔵", 2]], unit: "🟩", w: { "🟥": 1, "🔵": 2, "🔺": 2, "🟩": 1 } },
    { givens: [[[["🟪", 1]], [["🟨", 2], ["🔵", 1]]], [[["🔵", 4]], [["🟪", 2]]]], ask: [["🟨", 4]], unit: "🔵", w: { "🟪": 4, "🟨": 1, "🔵": 2 } },
    { givens: [[[["🫑", 1], ["🍐", 1]], [["🍋", 1], ["🧅", 1], ["🍊", 1], ["🫑", 1]]], [[["🧅", 1], ["🍐", 1]], [["🍊", 2], ["🧅", 1]]]], ask: [["🍋", 2], ["🧅", 2]], unit: "🍐", w: { "🫑": 5, "🍐": 4, "🍋": 1, "🧅": 1, "🍊": 2 } },
  ];

  // Bộ "cân đồng hồ": mỗi đồ vật có số cân, bé cộng lại
  const KITCHEN_SETS = [
    { "🍎": 3, "🍊": 1, "🍌": 2 }, { "🍉": 5, "🍓": 1, "🥭": 3 }, { "🚚": 4, "🚤": 4, "🐦": 2 },
    { "🦅": 3, "🦒": 5, "🐞": 2 }, { "🦘": 6, "🐦": 2, "🐸": 1 }, { "🪱": 1, "🦩": 3, "🦛": 5 },
  ];

  // ---------- Tiện ích ----------
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pickN = (arr, n) => arr.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).slice(0, n).map((x) => x[1]);
  const shuffle = (arr) => pickN(arr, arr.length);
  const sumW = (side, w) => side.reduce((s, [e, c]) => s + w[e] * c, 0);

  function options(answer, max = 20) {
    const set = new Set([answer]);
    let spread = 2;
    while (set.size < 4) {
      const c = answer + rand(-spread, spread);
      if (c >= 1 && c <= max) set.add(c);
      spread++;
    }
    return shuffle([...set]);
  }

  function sayCount(e, c) { return `${NUM[c] || c} ${name(e)}`; }
  function saySide(side) {
    const parts = side.map(([e, c]) => sayCount(e, c));
    return parts.length > 1 ? parts.slice(0, -1).join(", ") + " và " + parts[parts.length - 1] : parts[0];
  }

  /** Hoàn thiện một bài: tính đáp án, lời đọc, đáp án lựa chọn */
  function finish(p, kind) {
    const answer = sumW(p.ask, p.w) / p.w[p.unit];
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    const lines = p.givens.map(([l, r]) => cap(`${saySide(l)} nặng bằng ${saySide(r)}.`));
    const q = `${saySide(p.ask)} nặng bằng mấy ${name(p.unit)}?`;
    return {
      kind, givens: p.givens, ask: p.ask, unit: p.unit, answer,
      say: lines.join(" ") + " Vậy " + q, question: q,
      options: options(answer, Math.max(20, answer + 3)),
    };
  }

  // ---------- Nhớ bài đã ra (không lặp lại) ----------
  const SEEN_KEY = "bap-scale-seen";
  let seen = (() => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch { return []; } })();
  const sig = (p) => JSON.stringify([p.givens, p.ask, p.unit]);
  function remember(s) {
    seen.push(s);
    if (seen.length > 400) seen = seen.slice(-400);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch {}
  }
  const isSeen = (s) => seen.includes(s);

  // ---------- Bộ tạo bài ----------
  function pickChain(n) {
    // chọn n đồ vật cùng nhóm, theo thứ tự nặng -> nhẹ
    const g = GROUPS[rand(0, GROUPS.length - 1)];
    const idx = pickN(g.map((_, i) => i), n).sort((a, b) => a - b);
    return idx.map((i) => g[i]);
  }

  // Dạng 1: 1A = nB  ->  kA = ? B
  function genMultiply() {
    const [A, B] = pickChain(2);
    const n = rand(2, 5), k = rand(2, Math.min(4, Math.floor(20 / n)));
    return { givens: [[[[A, 1]], [[B, n]]]], ask: [[A, k]], unit: B, w: { [A]: n, [B]: 1 } };
  }
  // Dạng 2: kA = mB (m chia hết cho k)  ->  1A = ? B ; có thể đảo bên
  function genDivide() {
    const [A, B] = pickChain(2);
    const per = rand(1, 4), k = rand(2, 3), m = per * k;
    const g = Math.random() < 0.5 ? [[[A, k]], [[B, m]]] : [[[B, m]], [[A, k]]];
    return { givens: [g], ask: [[A, 1]], unit: B, w: { [A]: per, [B]: 1 } };
  }
  // Dạng 3: A = mB ; B = nC  ->  kA = ? C
  function genChain() {
    const [A, B, C] = pickChain(3);
    const m = rand(1, 3), n = rand(2, 4);
    const k = m * n <= 10 && Math.random() < 0.4 ? 2 : 1;
    if (k * m * n > 20) return genChain();
    const flip = () => Math.random() < 0.3;
    const g1 = flip() ? [[[B, m]], [[A, 1]]] : [[[A, 1]], [[B, m]]];
    const g2 = flip() ? [[[C, n]], [[B, 1]]] : [[[B, 1]], [[C, n]]];
    return { givens: [g1, g2], ask: [[A, k]], unit: C, w: { [A]: m * n, [B]: n, [C]: 1 } };
  }
  // Dạng 4: A = B + nC ; B = mC  ->  A = ? C
  function genMixed() {
    const [A, B, C] = pickChain(3);
    const n = rand(1, 3), m = rand(2, 4);
    return {
      givens: [[[[A, 1]], [[B, 1], [C, n]]], [[[B, 1]], [[C, m]]]],
      ask: [[A, 1]], unit: C, w: { [A]: m + n, [B]: m, [C]: 1 },
    };
  }
  // Dạng 5: kA = mB ; B = nC  (cần chia trước) -> A = ? C
  function genChainDivide() {
    const [A, B, C] = pickChain(3);
    const per = rand(1, 3), k = 2, n = rand(2, 3);
    if (per * n > 20) return genChainDivide();
    return {
      givens: [[[[A, k]], [[B, per * k]]], [[[B, 1]], [[C, n]]]],
      ask: [[A, 1]], unit: C, w: { [A]: per * n, [B]: n, [C]: 1 },
    };
  }

  const GENS = [genMultiply, genDivide, genChain, genMixed, genChainDivide];

  function generate() {
    for (let t = 0; t < 60; t++) {
      const p = GENS[rand(0, GENS.length - 1)]();
      const ans = sumW(p.ask, p.w) / p.w[p.unit];
      if (!Number.isInteger(ans) || ans < 1 || ans > 20) continue;
      const s = sig(p);
      if (isSeen(s) && t < 50) continue;
      remember(s);
      return finish(p, "logic");
    }
    return finish(genMultiply(), "logic");
  }

  // Lần lượt ra các câu chọn lọc chưa làm, xen với câu tự tạo
  function next() {
    const fresh = CURATED.filter((p) => !isSeen(sig(p)));
    if (fresh.length && Math.random() < 0.6) {
      const p = fresh[0];
      remember(sig(p));
      return finish(p, "logic");
    }
    return generate();
  }

  // ---------- Cân đồng hồ ----------
  function kitchen() {
    for (let t = 0; t < 60; t++) {
      let set;
      if (Math.random() < 0.5) set = KITCHEN_SETS[rand(0, KITCHEN_SETS.length - 1)];
      else {
        // đồ vật to (đứng trước trong nhóm) luôn nặng hơn đồ vật nhỏ
        set = {};
        const g = GROUPS[rand(0, GROUPS.length - 1)];
        const items3 = pickN(g, 3).sort((a, b) => g.indexOf(a) - g.indexOf(b));
        const ws = pickN([1, 2, 3, 4, 5, 6], 3).sort((a, b) => b - a);
        items3.forEach((e, i) => (set[e] = ws[i]));
      }
      const items = Object.keys(set);
      const nTypes = rand(1, Math.min(3, items.length));
      const chosen = pickN(items, nTypes).map((e) => [e, rand(1, nTypes === 1 ? 3 : 2)]);
      const total = sumW(chosen, set);
      if (total > 20 || (chosen.length === 1 && chosen[0][1] === 1)) continue;
      const s = JSON.stringify(["k", set, chosen]);
      if (isSeen(s) && t < 50) continue;
      remember(s);
      return {
        kind: "kitchen", weights: set, items: chosen, answer: total,
        say: items.map((e) => `Một ${name(e)} nặng ${NUM[set[e]]} cân.`).join(" ") +
          ` Trên cân có ${saySide(chosen)}. Cân chỉ số mấy?`,
        options: options(total),
      };
    }
    return kitchen();
  }

  /** Tự kiểm tra: mọi cân trong bộ chọn lọc đều thăng bằng và đáp án là số nguyên */
  function selfCheck() {
    const errors = [];
    CURATED.forEach((p, i) => {
      p.givens.forEach(([l, r], j) => { if (sumW(l, p.w) !== sumW(r, p.w)) errors.push(`câu ${i + 1} cân ${j + 1} lệch`); });
      const a = sumW(p.ask, p.w) / p.w[p.unit];
      if (!Number.isInteger(a) || a < 1 || a > 20) errors.push(`câu ${i + 1} đáp án ${a}`);
      [...p.givens.flat(2), ...p.ask].forEach(([e]) => { if (!N[e]) errors.push(`câu ${i + 1} thiếu tên ${e}`); });
    });
    return errors;
  }

  return { next, generate, kitchen, selfCheck, name, CURATED, finish, resetSeen() { seen = []; try { localStorage.removeItem(SEEN_KEY); } catch {} } };
})();

if (typeof module !== "undefined") module.exports = LogicScale;
