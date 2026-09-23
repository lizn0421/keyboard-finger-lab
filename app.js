(() => {
  "use strict";

  const STORAGE_KEY = "ten-finger-lab-v1";
  const DEFAULT_PROGRESS = { completed: 0, bestWpm: 0, errorCounts: {}, completedLessons: [] };
  const FINGER_INFO = {
    "left-pinky": { name: "左手小指", hint: "Q、A、Z 及左侧边键", color: "var(--lp)" },
    "left-ring": { name: "左手无名指", hint: "W、S、X", color: "var(--lr)" },
    "left-middle": { name: "左手中指", hint: "E、D、C", color: "var(--lm)" },
    "left-index": { name: "左手食指", hint: "F、G、R、T、V、B", color: "var(--li)" },
    "right-index": { name: "右手食指", hint: "H、J、Y、U、N、M", color: "var(--ri)" },
    "right-middle": { name: "右手中指", hint: "I、K、,", color: "var(--rm)" },
    "right-ring": { name: "右手无名指", hint: "O、L、.", color: "var(--rr)" },
    "right-pinky": { name: "右手小指", hint: "P、;、/ 及右侧边键", color: "var(--rp)" },
    thumbs: { name: "拇指", hint: "空格键", color: "var(--accent)" }
  };

  const FINGER_BY_CODE = {
    Backquote: "left-pinky", Digit1: "left-pinky", KeyQ: "left-pinky", KeyA: "left-pinky", KeyZ: "left-pinky",
    Digit2: "left-ring", KeyW: "left-ring", KeyS: "left-ring", KeyX: "left-ring",
    Digit3: "left-middle", KeyE: "left-middle", KeyD: "left-middle", KeyC: "left-middle",
    Digit4: "left-index", Digit5: "left-index", KeyR: "left-index", KeyT: "left-index", KeyF: "left-index", KeyG: "left-index", KeyV: "left-index", KeyB: "left-index",
    Digit6: "right-index", Digit7: "right-index", KeyY: "right-index", KeyU: "right-index", KeyH: "right-index", KeyJ: "right-index", KeyN: "right-index", KeyM: "right-index",
    Digit8: "right-middle", KeyI: "right-middle", KeyK: "right-middle", Comma: "right-middle",
    Digit9: "right-ring", KeyO: "right-ring", KeyL: "right-ring", Period: "right-ring",
    Digit0: "right-pinky", Minus: "right-pinky", Equal: "right-pinky", KeyP: "right-pinky", BracketLeft: "right-pinky", BracketRight: "right-pinky", Backslash: "right-pinky", Semicolon: "right-pinky", Quote: "right-pinky", Slash: "right-pinky",
    Space: "thumbs"
  };

  const CODE_BY_CHAR = {
    "`": "Backquote", "1": "Digit1", "2": "Digit2", "3": "Digit3", "4": "Digit4", "5": "Digit5", "6": "Digit6", "7": "Digit7", "8": "Digit8", "9": "Digit9", "0": "Digit0",
    "-": "Minus", "=": "Equal", "q": "KeyQ", "w": "KeyW", "e": "KeyE", "r": "KeyR", "t": "KeyT", "y": "KeyY", "u": "KeyU", "i": "KeyI", "o": "KeyO", "p": "KeyP",
    "[": "BracketLeft", "]": "BracketRight", "\\": "Backslash", "a": "KeyA", "s": "KeyS", "d": "KeyD", "f": "KeyF", "g": "KeyG", "h": "KeyH", "j": "KeyJ", "k": "KeyK", "l": "KeyL", ";": "Semicolon", "'": "Quote", "z": "KeyZ", "x": "KeyX", "c": "KeyC", "v": "KeyV", "b": "KeyB", "n": "KeyN", "m": "KeyM", ",": "Comma", ".": "Period", "/": "Slash", " ": "Space"
  };

  const DISPLAY_BY_CODE = Object.fromEntries(Object.entries(CODE_BY_CHAR).map(([character, code]) => [code, character === " " ? "Space" : character.toUpperCase()]));
  DISPLAY_BY_CODE.Backspace = "⌫";
  DISPLAY_BY_CODE.Tab = "Tab";
  DISPLAY_BY_CODE.CapsLock = "Caps";
  DISPLAY_BY_CODE.Enter = "Enter";
  DISPLAY_BY_CODE.ShiftLeft = "Shift";
  DISPLAY_BY_CODE.ShiftRight = "Shift";

  const LESSONS = [
    { id: "home", step: "第 1 课 · 建立基准", title: "F 和 J 定位", subtitle: "左右食指", description: "先让左右食指记住基准键。每次按完，手指回到 F / J。", text: "f j f j f j d k f j d k" },
    { id: "home-row", step: "第 2 课 · 横向移动", title: "主键区", subtitle: "ASDF · JKL;", description: "保持手腕悬空或轻放，不要整只手横着挪。", text: "a s d f j k l ; a s d f j k l ;" },
    { id: "left-hand", step: "第 3 课 · 左手路线", title: "左手四指", subtitle: "QWER · ASDF · ZXCV", description: "每个键都从基准位伸出去，再自然回位。", text: "q w e r a s d f z x c v f d s a" },
    { id: "right-hand", step: "第 4 课 · 右手路线", title: "右手四指", subtitle: "YUIO · HJKL · NM", description: "右食指负责 Y、U、H、J、N、M，别让右手整体漂移。", text: "y u i o h j k l n m j h k l" },
    { id: "reach", step: "第 5 课 · 上下排", title: "跨排移动", subtitle: "食指扩展", description: "以食指为轴练习 R、T、Y、U 与 V、B、N、M。", text: "r t f g v b y u h j n m r t y u" },
    { id: "phrase", step: "第 6 课 · 节奏句", title: "轻松连贯", subtitle: "完整短句", description: "先稳住正确率，速度会在节奏稳定后自然上来。", text: "fast hands find home row" }
  ];

  const KEYBOARD_ROWS = [
    [ ["Backquote", "`"], ["Digit1", "1"], ["Digit2", "2"], ["Digit3", "3"], ["Digit4", "4"], ["Digit5", "5"], ["Digit6", "6"], ["Digit7", "7"], ["Digit8", "8"], ["Digit9", "9"], ["Digit0", "0"], ["Minus", "-"], ["Equal", "="], ["Backspace", "⌫", "wide-2"] ],
    [ ["Tab", "Tab", "wide-1-5"], ["KeyQ", "Q"], ["KeyW", "W"], ["KeyE", "E"], ["KeyR", "R"], ["KeyT", "T"], ["KeyY", "Y"], ["KeyU", "U"], ["KeyI", "I"], ["KeyO", "O"], ["KeyP", "P"], ["BracketLeft", "["], ["BracketRight", "]"], ["Backslash", "\\", "wide-1-5"] ],
    [ ["CapsLock", "Caps", "wide-1-75"], ["KeyA", "A"], ["KeyS", "S"], ["KeyD", "D"], ["KeyF", "F"], ["KeyG", "G"], ["KeyH", "H"], ["KeyJ", "J"], ["KeyK", "K"], ["KeyL", "L"], ["Semicolon", ";"], ["Quote", "'"], ["Enter", "Enter", "wide-2-25"] ],
    [ ["ShiftLeft", "Shift", "wide-2-25"], ["KeyZ", "Z"], ["KeyX", "X"], ["KeyC", "C"], ["KeyV", "V"], ["KeyB", "B"], ["KeyN", "N"], ["KeyM", "M"], ["Comma", ","], ["Period", "."], ["Slash", "/"], ["ShiftRight", "Shift", "wide-2-75"] ],
    [ ["Space", "Space", "space-key"] ]
  ];

  const $ = (id) => document.getElementById(id);
  const el = {
    lessonList: $("lesson-list"), lessonCount: $("lesson-count"), lessonKicker: $("lesson-kicker"), lessonTitle: $("lesson-title"), lessonDescription: $("lesson-description"),
    state: $("session-state"), fingerDot: $("finger-dot"), fingerName: $("finger-name"), fingerHint: $("finger-hint"), nextKey: $("next-key-label"), target: $("target-line"), feedback: $("feedback"),
    start: $("start-button"), restart: $("restart-button"), next: $("next-button"), keyboard: $("keyboard"), accuracy: $("accuracy-value"), speed: $("speed-value"), mistakes: $("mistakes-value"),
    progress: $("progress-value"), progressBar: $("progress-bar"), completed: $("completed-value"), bestSpeed: $("best-speed-value"), weakKeys: $("weak-keys-value"), coaching: $("coaching-text"),
    weakButton: $("weak-keys-button"), blindToggle: $("blind-toggle"), resetProgress: $("reset-progress")
  };

  let progress = loadProgress();
  let currentLesson = LESSONS[0];
  let sequence = [];
  let cursor = 0;
  let active = false;
  let startedAt = 0;
  let correct = 0;
  let mistakes = 0;
  let blindMode = false;
  let lastKeyTimer;

  function loadProgress() {
    try { return { ...DEFAULT_PROGRESS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") }; }
    catch { return { ...DEFAULT_PROGRESS }; }
  }
  function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
  function formatKey(code) { return DISPLAY_BY_CODE[code] || code.replace(/^Key|^Digit/, ""); }
  function sequenceFromText(text) { return [...text.toLowerCase()].map((char) => ({ char, code: CODE_BY_CHAR[char] })).filter((item) => item.code); }
  function getAccuracy() { const attempts = correct + mistakes; return attempts ? Math.round((correct / attempts) * 100) : 0; }
  function getWpm() { if (!startedAt || !correct) return 0; const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 600); return Math.round((correct / 5) / minutes); }
  function getWeakCodes() { return Object.entries(progress.errorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([code]) => code); }

  function renderKeyboard() {
    el.keyboard.innerHTML = "";
    KEYBOARD_ROWS.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "key-row";
      row.forEach(([code, label, size]) => {
        const key = document.createElement("div");
        key.className = `key ${size || ""} ${code === "KeyF" || code === "KeyJ" ? "home-key" : ""}`;
        key.dataset.code = code;
        key.dataset.finger = FINGER_BY_CODE[code] || "";
        key.textContent = label;
        rowEl.appendChild(key);
      });
      el.keyboard.appendChild(rowEl);
    });
  }

  function renderLessons() {
    el.lessonList.innerHTML = "";
    LESSONS.forEach((lesson, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `lesson-item ${lesson.id === currentLesson.id ? "active" : ""}`;
      button.innerHTML = `<span class="lesson-number">${String(index + 1).padStart(2, "0")}</span><span><strong>${lesson.title}</strong><span>${lesson.subtitle}</span></span>`;
      button.addEventListener("click", () => selectLesson(lesson));
      el.lessonList.appendChild(button);
    });
    el.lessonCount.textContent = `${progress.completedLessons.length} / ${LESSONS.length}`;
  }

  function renderHistory() {
    const weak = getWeakCodes();
    el.completed.textContent = `${progress.completed} 次`;
    el.bestSpeed.textContent = progress.bestWpm ? `${progress.bestWpm} WPM` : "—";
    el.weakKeys.textContent = weak.length ? weak.map(formatKey).join(" · ") : "还没有";
    if (progress.completed === 0) el.coaching.textContent = "先只盯住正确率。连续两次达到 96%，再追求速度。";
    else if (weak.length) el.coaching.textContent = `下次优先慢练 ${weak.map(formatKey).join("、")}；按错后不要着急补速度。`;
    else el.coaching.textContent = "很好，继续让每根手指从基准位出发，再回到基准位。";
  }

  function renderTarget() {
    el.target.innerHTML = "";
    sequence.forEach((item, index) => {
      const span = document.createElement("span");
      span.className = `target-char ${item.char === " " ? "space" : ""} ${index < cursor ? "correct" : index === cursor ? "current" : "pending"}`;
      span.textContent = item.char === " " ? "·" : item.char;
      el.target.appendChild(span);
    });
  }

  function setState(label, state) {
    el.state.textContent = label;
    el.state.dataset.state = state;
  }
  function setFeedback(message, tone = "neutral") { el.feedback.textContent = message; el.feedback.dataset.tone = tone; }
  function updateFocus() {
    document.querySelectorAll(".key.target").forEach((node) => node.classList.remove("target"));
    const item = sequence[cursor];
    if (!item) { el.nextKey.textContent = "✓"; return; }
    const finger = FINGER_INFO[FINGER_BY_CODE[item.code]] || FINGER_INFO["left-index"];
    el.nextKey.textContent = formatKey(item.code);
    el.fingerName.textContent = finger.name;
    el.fingerHint.textContent = finger.hint;
    el.fingerDot.style.background = finger.color;
    el.fingerDot.style.boxShadow = `0 0 0 5px color-mix(in srgb, ${finger.color} 15%, transparent), 0 0 22px ${finger.color}`;
    const key = document.querySelector(`.key[data-code="${item.code}"]`);
    if (key) key.classList.add("target");
  }
  function updateSessionStats() {
    const pct = sequence.length ? Math.round((cursor / sequence.length) * 100) : 0;
    el.accuracy.textContent = correct + mistakes ? `${getAccuracy()}%` : "—";
    el.speed.textContent = startedAt && correct ? `${getWpm()} WPM` : "—";
    el.mistakes.textContent = String(mistakes);
    el.progress.textContent = `${pct}%`;
    el.progressBar.style.width = `${pct}%`;
    el.progressBar.parentElement.setAttribute("aria-valuenow", String(pct));
  }
  function renderPractice() { renderTarget(); updateFocus(); updateSessionStats(); }

  function selectLesson(lesson) {
    currentLesson = lesson;
    sequence = sequenceFromText(lesson.text);
    cursor = 0; active = false; startedAt = 0; correct = 0; mistakes = 0;
    el.lessonKicker.textContent = lesson.step;
    el.lessonTitle.textContent = lesson.title;
    el.lessonDescription.textContent = lesson.description;
    el.start.textContent = "开始练习";
    setState("准备开始", "ready");
    setFeedback("点击“开始练习”，然后直接用键盘输入。");
    renderLessons(); renderPractice();
  }
  function startPractice() {
    if (cursor >= sequence.length) restartPractice();
    active = true;
    if (!startedAt) startedAt = Date.now();
    el.start.textContent = "练习中…";
    setState("正在练习", "active");
    setFeedback("只注意下一键和该用的手指。按错了就慢一点重来。", "neutral");
    renderPractice();
  }
  function restartPractice() {
    cursor = 0; active = false; startedAt = 0; correct = 0; mistakes = 0;
    el.start.textContent = "开始练习";
    setState("准备开始", "ready");
    setFeedback("已重置。按开始后，先把 F / J 摸准。", "neutral");
    renderPractice();
  }
  function completePractice() {
    active = false;
    const wpm = getWpm();
    const accuracy = getAccuracy();
    progress.completed += 1;
    progress.bestWpm = Math.max(progress.bestWpm || 0, wpm);
    if (!progress.completedLessons.includes(currentLesson.id)) progress.completedLessons.push(currentLesson.id);
    saveProgress();
    el.start.textContent = "再练一次";
    setState("本轮完成", "complete");
    setFeedback(`完成：${accuracy}% 正确率，${wpm} WPM。${accuracy >= 96 ? "可以进入下一课。" : "建议再来一遍，先把正确率提到 96%。"}`, "success");
    renderLessons(); renderHistory(); renderPractice();
  }
  function flashKey(code, kind) {
    const key = document.querySelector(`.key[data-code="${code}"]`);
    if (!key) return;
    key.classList.remove("key-correct", "key-wrong");
    void key.offsetWidth;
    key.classList.add(kind);
    window.clearTimeout(lastKeyTimer);
    lastKeyTimer = window.setTimeout(() => key.classList.remove(kind), 220);
  }

  function handleKeydown(event) {
    if (!active || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const expected = sequence[cursor];
    if (!expected) return;
    if (event.code === "Backspace") {
      event.preventDefault();
      setFeedback("本练习会立即标出错误，不需要退格；重新按亮起的键即可。", "neutral");
      return;
    }
    if (!FINGER_BY_CODE[event.code]) return;
    event.preventDefault();
    if (event.code === expected.code) {
      correct += 1;
      cursor += 1;
      flashKey(event.code, "key-correct");
      if (cursor === sequence.length) { completePractice(); return; }
      setFeedback("对，手指回到基准位，再准备下一键。", "success");
    } else {
      mistakes += 1;
      progress.errorCounts[event.code] = (progress.errorCounts[event.code] || 0) + 1;
      saveProgress();
      flashKey(event.code, "key-wrong");
      setFeedback(`这次按成了 ${formatKey(event.code)}。下一键仍是 ${formatKey(expected.code)}，放慢一点。`, "error");
      renderHistory();
    }
    renderPractice();
  }

  function startWeakKeyPractice() {
    const weak = getWeakCodes();
    if (!weak.length) {
      setFeedback("还没有错误记录。先完成一轮练习，系统会把容易按错的键收集起来。", "neutral");
      return;
    }
    const chars = weak.map((code) => (DISPLAY_BY_CODE[code] === "Space" ? " " : DISPLAY_BY_CODE[code].toLowerCase()));
    const expanded = chars.flatMap((char) => [char, "f", char, "j", char]).join(" ");
    const lesson = { id: "weak-keys", step: "针对练习 · 自动生成", title: "按错键复训", subtitle: weak.map(formatKey).join(" · "), description: "把常错键和 F / J 基准键交替练习。每次够到目标键后，都回到基准位。", text: expanded };
    selectLesson(lesson);
    setFeedback("已按你的错误记录生成一轮复训。", "success");
  }
  function nextLesson() {
    const index = LESSONS.findIndex((lesson) => lesson.id === currentLesson.id);
    selectLesson(LESSONS[(index + 1 + LESSONS.length) % LESSONS.length]);
  }
  function toggleBlindMode() {
    blindMode = !blindMode;
    document.body.classList.toggle("blind-mode", blindMode);
    el.blindToggle.textContent = `盲打模式：${blindMode ? "开" : "关"}`;
    el.blindToggle.setAttribute("aria-pressed", String(blindMode));
  }
  function resetAllProgress() {
    if (!window.confirm("确定清除累计完成次数、速度和错键记录吗？")) return;
    progress = { ...DEFAULT_PROGRESS };
    saveProgress();
    renderLessons(); renderHistory();
    setFeedback("累计进度已清除；当前这一轮练习仍可继续。", "neutral");
  }

  el.start.addEventListener("click", startPractice);
  el.restart.addEventListener("click", restartPractice);
  el.next.addEventListener("click", nextLesson);
  el.weakButton.addEventListener("click", startWeakKeyPractice);
  el.blindToggle.addEventListener("click", toggleBlindMode);
  el.resetProgress.addEventListener("click", resetAllProgress);
  document.addEventListener("keydown", handleKeydown);

  renderKeyboard();
  renderHistory();
  selectLesson(LESSONS[0]);
})();
