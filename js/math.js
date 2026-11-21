// =============================================================
//  TẠO BÀI TOÁN: cộng, trừ, điền số, cân thăng bằng (phạm vi 20)
// =============================================================

const MathGen = (() => {
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  const FRUITS = ["🍎", "🍊", "🍓", "🐟", "⭐", "🌸", "🐥", "🎈"];

  /** 4 đáp án: 1 đúng + 3 gần đúng, nằm trong 0..max */
  function options(answer, max = 20) {
    const set = new Set([answer]);
    let spread = 2;
    while (set.size < 4) {
      const c = answer + rand(-spread, spread);
      if (c >= 0 && c <= max) set.add(c);
      spread++;
    }
    return shuffle([...set]);
  }

  function addition(max) {
    const a = rand(1, max - 1), b = rand(1, max - a);
    const sum = a + b;
    const icon = FRUITS[rand(0, FRUITS.length - 1)];
    if (Math.random() < 0.3) {
      // điền số còn thiếu: a + ? = sum
      return {
        kind: "add-missing", text: [a, "+", "?", "=", sum], answer: b,
        say: `${a} cộng mấy bằng ${VN.numberToWords(sum)}?`, visual: { type: "add", a, b: null, icon },
        options: options(b, max),
      };
    }
    return {
      kind: "add", text: [a, "+", b, "=", "?"], answer: sum,
      say: `${a} cộng ${b} bằng mấy?`, visual: { type: "add", a, b, icon }, options: options(sum, max),
    };
  }

  function subtraction(max) {
    const a = rand(2, max), b = rand(1, a - 1);
    const diff = a - b;
    const icon = FRUITS[rand(0, FRUITS.length - 1)];
    if (Math.random() < 0.3) {
      return {
        kind: "sub-missing", text: [a, "−", "?", "=", diff], answer: b,
        say: `${a} trừ mấy bằng ${VN.numberToWords(diff)}?`, visual: { type: "sub", a, b: null, icon },
        options: options(b, max),
      };
    }
    return {
      kind: "sub", text: [a, "−", b, "=", "?"], answer: diff,
      say: `${a} trừ ${b} bằng mấy?`, visual: { type: "sub", a, b, icon }, options: options(diff, max),
    };
  }

  /**
   * Cân thăng bằng: trái = a + b ; phải = c + ?
   * (hoặc trái = một số ; phải = c + ?)
   */
  function balance(max) {
    const total = rand(4, max);
    let left;
    if (Math.random() < 0.6) {
      const a = rand(1, total - 1);
      left = { label: `${a} + ${total - a}`, value: total, say: `${a} cộng ${total - a}` };
    } else {
      left = { label: `${total}`, value: total, say: `${total}` };
    }
    const c = rand(0, total - 1);
    const answer = total - c;
    const right = c === 0
      ? { label: "?", known: 0, say: "mấy" }
      : { label: `${c} + ?`, known: c, say: `${c} cộng mấy` };
    return {
      kind: "balance", left, right, answer,
      say: `Bên trái là ${left.say}. Bên phải là ${right.say} thì cân thăng bằng?`,
      options: options(answer, max),
    };
  }

  function make(mode, max = 20) {
    if (mode === "mix") mode = ["add", "sub", "balance"][rand(0, 2)];
    if (mode === "add") return addition(max);
    if (mode === "sub") return subtraction(max);
    return balance(max);
  }

  return { make };
})();
