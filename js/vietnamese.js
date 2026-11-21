// =============================================================
//  XỬ LÝ TIẾNG VIỆT: tách dấu, đánh vần, so sánh câu bé đọc
// =============================================================

const VN = (() => {
  // nguyên âm gốc -> [không dấu, huyền, sắc, hỏi, ngã, nặng]
  const TONE_TABLE = {
    a: "aàáảãạ", "ă": "ăằắẳẵặ", "â": "âầấẩẫậ", e: "eèéẻẽẹ", "ê": "êềếểễệ",
    i: "iìíỉĩị", o: "oòóỏõọ", "ô": "ôồốổỗộ", "ơ": "ơờớởỡợ", u: "uùúủũụ",
    "ư": "ưừứửữự", y: "yỳýỷỹỵ",
  };
  const TONE_NAMES = ["", "huyền", "sắc", "hỏi", "ngã", "nặng"];

  // ký tự có dấu -> { base, tone }
  const CHAR_INFO = {};
  for (const [base, row] of Object.entries(TONE_TABLE)) {
    [...row].forEach((ch, tone) => (CHAR_INFO[ch] = { base, tone }));
  }

  // Phụ âm đầu (dài trước, ngắn sau) và tên gọi khi đánh vần
  const ONSETS = [
    ["ngh", "ngờ"], ["gh", "gờ"], ["ng", "ngờ"], ["nh", "nhờ"], ["ch", "chờ"],
    ["th", "thờ"], ["tr", "trờ"], ["ph", "phờ"], ["kh", "khờ"], ["gi", "giờ"],
    ["qu", "quờ"], ["b", "bờ"], ["c", "cờ"], ["k", "ca"], ["d", "dờ"], ["đ", "đờ"],
    ["g", "gờ"], ["h", "hờ"], ["l", "lờ"], ["m", "mờ"], ["n", "nờ"], ["p", "pờ"],
    ["r", "rờ"], ["s", "sờ"], ["t", "tờ"], ["v", "vờ"], ["x", "xờ"],
  ];

  /** Tách 1 tiếng: "bà" -> {onset:"b", rhyme:"a", tone:1, plain:"ba"} */
  function analyzeSyllable(syl) {
    syl = syl.toLowerCase().normalize("NFC");
    let tone = 0;
    let plain = "";
    for (const ch of syl) {
      const info = CHAR_INFO[ch];
      if (info) {
        if (info.tone) tone = info.tone;
        plain += info.base;
      } else plain += ch;
    }
    let onset = "", onsetName = "";
    for (const [o, name] of ONSETS) {
      if (plain.startsWith(o) && plain.length > o.length) {
        onset = o; onsetName = name; break;
      }
    }
    // "gi" đứng một mình (vd: "gì") -> gi + i
    let rhyme = plain.slice(onset.length);
    if (!onset && plain === "gi") { onset = "gi"; onsetName = "giờ"; rhyme = "i"; }
    return { word: syl, onset, onsetName, rhyme, tone, toneName: TONE_NAMES[tone], plain };
  }

  /**
   * Các bước đánh vần 1 tiếng theo cách dạy lớp 1:
   *  "bà"  -> ["bờ", "a", "ba", "huyền", "bà"]
   *  "cam" -> ["cờ", "am", "cam"]
   *  "ổi"  -> ["ôi", "hỏi", "ổi"]
   */
  function spellSteps(syl) {
    const a = analyzeSyllable(syl);
    const steps = [];
    if (a.onset) steps.push(a.onsetName, a.rhyme, a.plain);
    else steps.push(a.plain);
    if (a.tone) steps.push(a.toneName, a.word);
    return steps;
  }

  /** Bỏ hết dấu thanh (giữ ă â ê ô ơ ư) */
  function stripTones(s) {
    let out = "";
    for (const ch of s.normalize("NFC")) out += CHAR_INFO[ch] ? CHAR_INFO[ch].base : ch;
    return out;
  }

  const NUMBER_WORDS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười"];
  function numberToWords(n) {
    if (n <= 10) return NUMBER_WORDS[n];
    if (n < 20) return "mười " + (n === 15 ? "lăm" : NUMBER_WORDS[n - 10]);
    if (n === 20) return "hai mươi";
    return String(n);
  }

  /** Chuẩn hoá văn bản để so sánh: chữ thường, bỏ dấu câu, số -> chữ */
  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFC")
      .replace(/\d+/g, (n) => " " + numberToWords(+n) + " ")
      .replace(/[.,!?;:"'“”…\-–()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(s) { return normalize(s).split(" ").filter(Boolean); }

  /** Dãy target có xuất hiện liên tiếp trong dãy heard không */
  function containsSeq(heard, target) {
    for (let i = 0; i + target.length <= heard.length; i++) {
      if (target.every((t, j) => heard[i + j] === t)) return true;
    }
    return false;
  }

  /**
   * So sánh điều bé đọc với chữ cần đọc.
   * alternatives: các câu máy nghe được (nhiều khả năng).
   * Trả về:
   *   { status: "correct" | "tone" | "wrong", heard, perSyllable: [true/false...] }
   *   - "tone": đọc đúng âm nhưng sai dấu thanh
   */
  function evaluate(target, alternatives) {
    const tgt = tokens(target);
    const alts = (alternatives || []).map(tokens).filter((a) => a.length);
    const heardBest = alts[0] || [];

    for (const alt of alts) {
      if (containsSeq(alt, tgt)) {
        return { status: "correct", heard: alt.join(" "), perSyllable: tgt.map(() => true) };
      }
    }

    // Đánh dấu từng tiếng: tiếng nào có trong lời bé đọc (ở bất kỳ khả năng nào)
    const allHeard = new Set(alts.flat());
    const perSyllable = tgt.map((t) => allHeard.has(t));

    // Đúng âm, sai dấu?
    const tgtPlain = tgt.map(stripTones);
    for (const alt of alts) {
      if (containsSeq(alt.map(stripTones), tgtPlain)) {
        // tìm tiếng sai dấu
        const altSet = new Set(alt);
        const wrongTone = tgt.filter((t) => !altSet.has(t));
        return { status: "tone", heard: alt.join(" "), perSyllable, wrongTone };
      }
    }
    return { status: "wrong", heard: heardBest.join(" "), perSyllable };
  }

  /** Tách một chuỗi thành các tiếng (bỏ dấu câu) để hiển thị/đánh vần */
  function syllables(text) {
    return text.split(/\s+/).map((s) => s.replace(/[.,!?;:]/g, "")).filter(Boolean);
  }

  return { numberToWords, analyzeSyllable, spellSteps, stripTones, normalize, evaluate, syllables, TONE_NAMES };
})();

if (typeof module !== "undefined") module.exports = VN;
