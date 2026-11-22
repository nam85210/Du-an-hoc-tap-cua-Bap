// =============================================================
//  GIỌNG NÓI: đọc (Text-to-Speech) và nghe bé đọc (Speech-to-Text)
//  Dùng Web Speech API có sẵn trong Chrome (Android) và Safari (iPhone)
// =============================================================

const Speech = (() => {
  const synth = window.speechSynthesis;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voices = [];
  let settings = loadSettings();

  function loadSettings() {
    try {
      return Object.assign({ rate: 0.8, pitch: 1.15, preset: "co-giao", voiceURI: "" }, JSON.parse(localStorage.getItem("bap-speech") || "{}"));
    } catch { return { rate: 0.8, pitch: 1.15, preset: "co-giao", voiceURI: "" }; }
  }
  function saveSettings() {
    try { localStorage.setItem("bap-speech", JSON.stringify(settings)); } catch {}
  }

  function refreshVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter((v) => /^vi/i.test(v.lang));
  }
  if (synth) {
    refreshVoices();
    synth.onvoiceschanged = refreshVoices;
  }

  // Ưu tiên giọng chất lượng cao / giọng nữ nếu máy có (Linh, Hoài My, An...)
  const FEMALE = /linh|my|an\b|female|nữ|gft|vif|vie|hoai|mai|lan/i;
  const QUALITY = /enhanced|premium|nâng cao|cao cấp|neural|natural|network|online/i;
  function rankVoice(v) { return (QUALITY.test(v.name) ? 2 : 0) + (FEMALE.test(v.name + v.voiceURI) ? 1 : 0); }
  function currentVoice() {
    const chosen = voices.find((v) => v.voiceURI === settings.voiceURI);
    if (chosen) return chosen;
    return voices.slice().sort((a, b) => rankVoice(b) - rankVoice(a))[0] || null;
  }

  // Các kiểu giọng nữ: cùng giọng tiếng Việt của máy, chỉnh cao độ và tốc độ cho dễ nghe
  const PRESETS = [
    { id: "co-giao", name: "Cô giáo dịu dàng", icon: "👩‍🏫", pitch: 1.15, rate: 0.8 },
    { id: "chi-gai", name: "Chị gái vui tươi", icon: "👧", pitch: 1.35, rate: 0.92 },
    { id: "me-cham", name: "Mẹ đọc chậm rãi", icon: "👩", pitch: 1.05, rate: 0.65 },
    { id: "ban-nho", name: "Bạn nhỏ tinh nghịch", icon: "🧒", pitch: 1.6, rate: 0.85 },
    { id: "ba-ke", name: "Bà kể chuyện", icon: "👵", pitch: 0.9, rate: 0.7 },
  ];

  /** Đọc 1 đoạn văn bản, trả về Promise khi đọc xong */
  function speak(text, opts = {}) {
    return new Promise((resolve) => {
      if (!synth) return resolve();
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "vi-VN";
      const v = currentVoice();
      try { if (v) u.voice = v; } catch {}
      u.rate = opts.rate || settings.rate;
      u.pitch = opts.pitch || settings.pitch || 1.15;
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      u.onend = finish;
      u.onerror = finish;
      // Một số máy không gọi onend -> tự kết thúc sau thời gian ước lượng
      setTimeout(finish, 1500 + text.length * 180 / u.rate);
      synth.speak(u);
    });
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /** Đọc lần lượt nhiều phần (dùng để đánh vần), gọi onStep(i) trước mỗi phần */
  async function speakSteps(parts, onStep, gap = 350) {
    for (let i = 0; i < parts.length; i++) {
      if (onStep) onStep(i);
      await speak(parts[i], { rate: Math.max(0.5, settings.rate - 0.15) });
      await sleep(gap);
    }
    if (onStep) onStep(-1);
  }

  function stop() { if (synth) synth.cancel(); }

  /**
   * Nghe bé đọc. Trả về Promise<string[]> (các khả năng máy nghe được).
   * Lỗi: reject(Error) với message là mã lỗi: not-supported, not-allowed, no-speech, network...
   */
  let active = null;
  function listen() {
    return new Promise((resolve, reject) => {
      if (!Recognition) return reject(new Error("not-supported"));
      stop();
      const rec = new Recognition();
      active = rec;
      rec.lang = "vi-VN";
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 5;
      let results = null;
      let error = null;
      rec.onresult = (e) => {
        const r = e.results[0];
        results = [];
        for (let i = 0; i < r.length; i++) results.push(r[i].transcript);
      };
      rec.onerror = (e) => { error = e.error || "error"; };
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        active = null;
        if (results && results.length) resolve(results);
        else reject(new Error(error || "no-speech"));
      };
      rec.onend = finish;
      try { rec.start(); } catch (err) { settled = true; return reject(new Error("start-failed")); }
      // tối đa 8 giây nghe; nếu máy không báo kết thúc thì tự dừng sau 10 giây
      setTimeout(() => { try { rec.stop(); } catch {} }, 8000);
      setTimeout(finish, 10000);
    });
  }
  function stopListening() { if (active) try { active.stop(); } catch {} }

  return {
    speak, speakSteps, stop, listen, stopListening,
    get canSpeak() { return !!synth; },
    get canListen() { return !!Recognition; },
    get voices() { refreshVoices(); return voices; },
    get settings() { return settings; },
    setRate(r) { settings.rate = r; saveSettings(); },
    PRESETS,
    setPreset(id) {
      const p = PRESETS.find((x) => x.id === id) || PRESETS[0];
      settings.preset = p.id; settings.pitch = p.pitch; settings.rate = p.rate; saveSettings();
    },
    previewPreset(id, text) {
      const p = PRESETS.find((x) => x.id === id) || PRESETS[0];
      return speak(text, { pitch: p.pitch, rate: p.rate });
    },
    get currentVoiceName() { const v = currentVoice(); return v ? v.name : ""; },
    setVoice(uri) { settings.voiceURI = uri; saveSettings(); },
  };
})();

// ---------- Âm thanh hiệu ứng (không cần file mp3) ----------
const Sfx = (() => {
  let ctx = null;
  function tone(freq, start, dur, type = "sine", vol = 0.25) {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur);
  }
  return {
    good() { try { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.25)); } catch {} },
    bad() { try { tone(300, 0, 0.2, "triangle"); tone(220, 0.18, 0.3, "triangle"); } catch {} },
    tap() { try { tone(880, 0, 0.06, "sine", 0.1); } catch {} },
  };
})();
