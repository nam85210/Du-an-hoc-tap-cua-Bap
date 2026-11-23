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
    // "gi" trước phụ âm (gìn, gì): phụ âm đầu là "gi", vần bắt đầu bằng "i"
    const giBeforeConsonant = /^gi[^aăâeêioôơuưy]*$/.test(plain) || /^gi[bcdđghklmnpqrstvx]/.test(plain);
    for (const [o, name] of ONSETS) {
      if (giBeforeConsonant) { onset = "gi"; onsetName = "giờ"; break; }
      if (plain.startsWith(o) && plain.length > o.length) {
        onset = o; onsetName = name; break;
      }
    }
    // "gi" đứng một mình (vd: "gì") -> gi + i
    let rhyme = giBeforeConsonant ? "i" + plain.slice(2) : plain.slice(onset.length);
    return { word: syl, onset, onsetName, rhyme, tone, toneName: TONE_NAMES[tone], plain };
  }

  // Âm cuối của vần và cách đọc khi đánh vần
  const FINALS = [
    ["ng", "ngờ"], ["nh", "nhờ"], ["ch", "chờ"], ["c", "cờ"], ["m", "mờ"], ["n", "nờ"],
    ["p", "pờ"], ["t", "tờ"], ["i", "i"], ["y", "i"], ["o", "o"], ["u", "u"],
  ];
  // Cách đọc một nguyên âm đứng riêng.
  // "ă", "â" để nguyên chữ cái: giọng đọc sẽ đọc đúng tên chữ (á, ớ).
  // Nếu đưa "á"/"ớ" thì máy đọc tách thành "a sắc"/"ơ sắc" -> sai.
  const VOWEL_SAY = { a: "a", "ă": "ă", "â": "â", e: "e", "ê": "ê", i: "i", o: "o", "ô": "ô", "ơ": "ơ", u: "u", "ư": "ư", y: "i" };
  // Nguyên âm đôi đọc theo cách dạy lớp 1: iê/yê -> "ia", uô -> "ua", ươ -> "ưa"
  const DIPHTHONG_SAY = { "iê": "ia", "yê": "ia", "uô": "ua", "ươ": "ưa" };
  const sayChunk = (c) => (c.length === 1 && VOWEL_SAY[c]) || DIPHTHONG_SAY[c] || c;

  /** Tách vần: "am" -> ["a", "mờ"], "uôi" -> ["uô", "i"], "oa" -> ["o", "a"], "a" -> [] */
  function splitRhyme(rhyme) {
    if (rhyme.length < 2) return [];
    for (const [f, sayF] of FINALS) {
      if (rhyme.endsWith(f) && rhyme.length > f.length) {
        const nucleus = rhyme.slice(0, -f.length);
        // Hiện đúng chữ cái (m, ng, y...), máy đọc theo âm (mờ, ngờ, i...)
        return [{ show: nucleus, say: sayChunk(nucleus) }, { show: f, say: sayF }];
      }
    }
    // vần chỉ có nguyên âm đôi (oa, ua, ưa, ia...): tách nguyên âm đầu
    return [{ show: rhyme[0], say: sayChunk(rhyme[0]) }, { show: rhyme.slice(1), say: sayChunk(rhyme.slice(1)) }];
  }

  /**
   * Kế hoạch đánh vần 1 tiếng (đánh vần vần trước, rồi ghép phụ âm):
   *  "cam" -> a – m – am – c – am – cam   (máy đọc: a – mờ – am – cờ – am – cam)
   *  "cây" -> â – y – ây – c – ây – cây   (máy đọc: ớ – i – ây – cờ – ây – cây)
   *  "bà"  -> b – a – ba – huyền – bà
   *  "ổi"  -> ô – i – ôi – hỏi – ổi
   * Mỗi bước: { show: chữ hiện, say: chữ đọc, part: "rh" (vần) | "on" (phụ âm) | "all" (cả tiếng) }
   */
  function spellPlan(syl) {
    const a = analyzeSyllable(syl);
    const plan = [];
    const parts = splitRhyme(a.rhyme);
    parts.forEach((p) => plan.push({ ...p, part: "rh" }));
    if (parts.length) plan.push({ show: a.rhyme, say: a.rhyme, part: "rh" });
    if (a.onset) {
      // Hiện chữ cái phụ âm (c, ch, ngh...), máy đọc theo âm (cờ, chờ, ngờ...)
      plan.push({ show: a.onset, say: a.onsetName, part: "on" });
      if (!parts.length) plan.push({ show: a.rhyme, say: sayChunk(a.rhyme), part: "rh" });
      else plan.push({ show: a.rhyme, say: a.rhyme, part: "rh" });
      plan.push({ show: a.plain, say: a.plain, part: "all" });
    } else if (!parts.length) {
      plan.push({ show: a.plain, say: sayChunk(a.plain), part: "all" });
    }
    if (a.tone) plan.push({ show: a.toneName, say: a.toneName, part: "tone" }, { show: a.word, say: a.word, part: "all" });
    return plan;
  }

  /** Các chữ đọc khi đánh vần (dạng chuỗi) */
  function spellSteps(syl) { return spellPlan(syl).map((p) => p.show); }

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

  return { numberToWords, analyzeSyllable, spellSteps, spellPlan, stripTones, normalize, evaluate, syllables, TONE_NAMES };
})();

if (typeof module !== "undefined") module.exports = VN;
