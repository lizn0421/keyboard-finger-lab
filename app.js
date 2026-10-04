(() => {
  "use strict";

  const STORAGE_KEY = "ten-finger-lab-v1";
  const DEFAULT_PROGRESS = { completed: 0, bestWpm: 0, bestCpm: 0, errorCounts: {}, completedLessons: [] };
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
  const SHIFTED_CODE_BY_CHAR = {
    "~": "Backquote", "!": "Digit1", "@": "Digit2", "#": "Digit3", "$": "Digit4", "%": "Digit5", "^": "Digit6", "&": "Digit7", "*": "Digit8", "(": "Digit9", ")": "Digit0",
    "_": "Minus", "+": "Equal", "{": "BracketLeft", "}": "BracketRight", "|": "Backslash", ":": "Semicolon", '"': "Quote", "<": "Comma", ">": "Period", "?": "Slash"
  };

  const DISPLAY_BY_CODE = Object.fromEntries(Object.entries(CODE_BY_CHAR).map(([character, code]) => [code, character === " " ? "Space" : character.toUpperCase()]));
  DISPLAY_BY_CODE.Backspace = "⌫";
  DISPLAY_BY_CODE.Tab = "Tab";
  DISPLAY_BY_CODE.CapsLock = "Caps";
  DISPLAY_BY_CODE.Enter = "Enter";
  DISPLAY_BY_CODE.ShiftLeft = "左 Shift";
  DISPLAY_BY_CODE.ShiftRight = "右 Shift";

  const BASE_LESSONS = [
    { id: "home", step: "第 1 课 · 建立基准", title: "F 和 J 定位", subtitle: "左右食指", description: "先让左右食指记住基准键。每次按完，手指回到 F / J。", text: "f j f j f j d k f j d k" },
    { id: "home-row", step: "第 2 课 · 横向移动", title: "主键区", subtitle: "ASDF · JKL;", description: "保持手腕悬空或轻放，不要整只手横着挪。", text: "a s d f j k l ; a s d f j k l ;" },
    { id: "left-hand", step: "第 3 课 · 左手路线", title: "左手四指", subtitle: "QWER · ASDF · ZXCV", description: "每个键都从基准位伸出去，再自然回位。", text: "q w e r a s d f z x c v f d s a" },
    { id: "right-hand", step: "第 4 课 · 右手路线", title: "右手四指", subtitle: "YUIO · HJKL · NM", description: "右食指负责 Y、U、H、J、N、M，别让右手整体漂移。", text: "y u i o h j k l n m j h k l" },
    { id: "reach", step: "第 5 课 · 上下排", title: "跨排移动", subtitle: "食指扩展", description: "以食指为轴练习 R、T、Y、U 与 V、B、N、M。", text: "r t f g v b y u h j n m r t y u" },
    { id: "phrase", step: "第 6 课 · 节奏句", title: "轻松连贯", subtitle: "完整短句", description: "先稳住正确率，速度会在节奏稳定后自然上来。", text: "fast hands find home row" },
    { id: "numbers", step: "第 7 课 · 数字行", title: "数字基础", subtitle: "1 到 0", description: "数字行要由对应手指直接够到，不要整只手上移。", text: "1234567890 0987654321 1357902468" },
    { id: "number-rhythm", step: "第 8 课 · 数字节奏", title: "数字与常用格式", subtitle: "日期 · 小数 · 地址", description: "把数字、连字符和句点连成稳定节奏。", text: "2026-09-23 0830 3.14159 192.168.1.1" },
    { id: "symbols-basic", step: "第 9 课 · 常用符号", title: "基础符号", subtitle: "[] \\ ; ' / , . - =", description: "先识别每个符号所在键位，再建立稳定的手指路线。", text: "[]\\;'/,.-= []\\;'/,.-=" },
    { id: "symbols-shift", step: "第 10 课 · Shift 组合", title: "上档符号", subtitle: "! @ # … ?", description: "主键由原手指按下，另一只手按住高亮的 Shift。", text: "!@#$%^&*()_+{}|:\"<>?" },
    { id: "mixed", step: "第 11 课 · 综合挑战", title: "数字符号混合", subtitle: "版本 · 标签 · 邮箱", description: "让数字、符号和字母在同一段节奏里衔接起来。", text: "v2.6.1 @keyboard #build_2026? 100% ready!" },
    { id: "english-article", step: "第 12 课 · 长文挑战", title: "英文长文挑战", subtitle: "约 300 键", long: true, description: "不用追求一口气打完，先用稳定的速度保持正确率。", text: "steady typing begins with relaxed shoulders and quiet hands. keep every finger close to its home key, look at the screen, and let accuracy lead speed. when a mistake appears, slow down for one breath, correct the next movement, and return to the rhythm. a long passage is not a sprint. it is a series of small, reliable decisions that gradually become automatic." },
    { id: "chinese-article", step: "第 13 课 · 长文挑战", title: "中文长文挑战", subtitle: "输入法 · 原创文章", mode: "ime", long: true, description: "使用你习惯的拼音或双拼输入法，逐字完成一段原创文章。", text: "在安静的清晨，先把双手轻放在键盘的基准位置。不要急着追求速度，先让每一次敲击都准确而均匀。屏幕上的文字像一条缓慢延伸的道路，眼睛看着前方，手指负责完成熟悉的动作。当一个词输入错误时，停下来确认，再继续向前。长期练习并不依赖一次很长的冲刺，而是依赖每天十分钟稳定的重复。真正可靠的速度，来自放松的肩膀、清楚的节奏和对错误的耐心修正。" }
  ];

  // Each stage introduces a new movement. Rotate phrase order between rounds
  // so practice reinforces the same fingers without looping one fixed string.
  const STAGE_PATTERNS = {
    home: [ ["ff jj", "fj jf", "f j f j", "jf fj"], ["fd jk", "df kj", "fj dk", "df jk"], ["fjdk kjdf", "ffj ddkk", "dfjk fjkd", "jfk dkj fjd"] ],
    "home-row": [ ["asdf jkl;", "fdsa ;lkj", "aa ss dd ff", "jj kk ll ;;"], ["aj sk dl f;", "as jk df l;", "fj dk sl a;", "fads j;kl"], ["sad flask", "ask dad", "all falls;", "a lad asks;", "jkl; asdf"] ],
    "left-hand": [ ["qa ws ed rf", "az sx dc fv", "qaz wsx edc", "rfv fvr"], ["qwer asdf", "zxcv fdsa", "qaz fdc wsx", "qf wa es rd"], ["red wax", "far sad", "a few faces", "were aware", "we race fast"] ],
    "right-hand": [ ["yj uh ij ok", "pl jm hn", "yhn ujm ik", "olp lpo"], ["yuio hjkl", "nm jk ui", "yujh ikol", "poli mn ju"], ["you join", "my opinion", "only him", "milk moon", "look up"] ],
    reach: [ ["fr ft gv gb", "jy ju hn hm", "rf vf tg bg", "yj nj uh mh"], ["rtfg vbgt", "yuhj nmju", "fvjt gbhn", "truy vmnb"], ["try turn", "run rhythm", "very hungry", "tiny trumpet", "bring my bag"] ],
    phrase: [ ["fast hands", "find home", "slow and steady", "rest then type"], ["keep your hands relaxed", "return to the home row", "look ahead and type calmly", "accuracy comes before speed"], ["small changes make a steady rhythm", "each finger follows its own path", "read the next word before you move", "practice patiently and keep going"] ],
    numbers: [ ["1122 3344", "5566 7788", "9900 0011", "12345 67890"], ["13579 24680", "10203 40506", "90807 60504", "121 343 565 787"], ["19028 37465", "60291 85347", "314159 265358", "20261004 08301945"] ],
    "number-rhythm": [ ["12 34 56 78", "2026-10-04", "08:30 19:45", "3.14 0.25"], ["192.168.1.1", "10.0.0.254", "2026-12-23 21:05", "128.50 1024.75"], ["order-2048: 39.95", "2027-01-06 07:35:20", "v3.14.159 100.00%", "192.168.10.128:8080"] ],
    "symbols-basic": [ ["[] []", ";; ''", ",. /-", "== \\ \\"], ["[a] [s] [d]", "a=b; c=d;", "one/two", "a,b.c-d"], ["[name='sam'];", "path=a/b/c;", "list=[1,2,3];", "x=0.25; y=-1;", "c:\\data\\logs"] ],
    "symbols-shift": [ ["!! @@ ##", "$$ %% ^^", "&& ** ()", "__ ++ {}"], ["!@ #$ %^", "&* () _+", "{} |: \"?", "<> ?: +_"], ["{a+b} != 0", "\"yes?\" 100%", "<x> & <y>", "#tag @user!", "a:b | c:d"] ],
    mixed: [ ["v2.6.1", "@keyboard", "#build_2026", "100% ready!"], ["user_01@mail.com", "score=98.5%;", "[id:2048]", "time=08:30:15"], ["if (x>0) {y=x+1;}", "total=$129.95; tax=6%;", "https://example.com/v3?id=42", "\"release_2026\" #ready!"] ]
  };
  const STAGE_NAMES = ["建立节奏", "交替组合", "连续挑战"];
  function expandPatterns(patterns, stage) {
    return Array.from({ length: stage + 3 }, (_, round) => {
      const ordered = patterns.map((_, index) => patterns[(index + round) % patterns.length]);
      return (round % 2 ? ordered.reverse() : ordered).join(" ");
    }).join(" ");
  }
  const LESSONS = BASE_LESSONS.map((lesson) => {
    let stages;
    if (STAGE_PATTERNS[lesson.id]) {
      stages = STAGE_PATTERNS[lesson.id].map(expandPatterns);
    } else if (lesson.mode === "ime") {
      stages = [lesson.text,
        "午后的阳光落在书桌上，窗外传来很轻的脚步声。我打开一份旧笔记，试着把零散的想法整理成完整的句子。开始时，每个字都需要仔细确认；慢慢地，手指找到了自己的节奏，眼睛也能提前看向下一个词。练习中最容易忽略的，并不是某个复杂的词语，而是简单动作之间的衔接。遇到不熟悉的标点，先看清它的位置，再从容输入。短暂的停顿并不会破坏进步，仓促的动作反而容易让错误连续发生。",
        "今天的任务是整理一次出行计划：早上八点半出发，先到公园散步，再去图书馆归还两本书。出门前，需要检查钥匙、雨伞和相机；回家后，还要记录当天的花费与见闻。这些看似普通的事情，写成文章以后，就包含了不同长度的词语、数字和标点。有人问：“练习多久才能变快？”我更愿意观察另一个变化——当注意力放在内容上时，双手是否仍然能够准确完成动作。完成最后一句话后，放松肩膀，回顾刚才最容易出错的地方，下一次再有针对性地练习。"];
    } else {
      stages = [lesson.text,
        "on a quiet afternoon, a traveler opened an old notebook beside the window. the first page held a simple plan: walk through the park, visit the library, and write about one small discovery. as the sentences grew longer, the hands had to connect familiar movements in unfamiliar orders. pause at the end of a thought, breathe easily, and begin the next line with the same calm attention. a comfortable rhythm can change without falling apart. the goal is to read ahead while each finger returns to a reliable starting point.",
        "the next task adds details: meet at 08:30, bring 2 notebooks, and record the total cost of $24.50. check the address twice; then send a short message to alex@example.com. is every item ready? use a checklist [keys, water, camera] and mark each step when it is done! words, numbers, and symbols now share the same passage, so the movement changes more often. accuracy should stay steady through these transitions. when the last line is complete, relax your hands and notice which combinations deserve a little more practice tomorrow."];
    }
    const separator = lesson.mode === "ime" ? "" : " ";
    const text = stages.join(separator);
    let offset = 0;
    const stageEnds = stages.map((stage, index) => {
      offset += [...stage].length + (index < stages.length - 1 ? separator.length : 0);
      return offset;
    });
    return { ...lesson, text, long: true, stageEnds,
      subtitle: `3 阶段 · ${[...text].length} ${lesson.mode === "ime" ? "字" : "键"}` };
  });

  const KEYBOARD_ROWS = [
    [ ["Backquote", "`", "", "~"], ["Digit1", "1", "", "!"], ["Digit2", "2", "", "@"], ["Digit3", "3", "", "#"], ["Digit4", "4", "", "$"], ["Digit5", "5", "", "%"], ["Digit6", "6", "", "^"], ["Digit7", "7", "", "&"], ["Digit8", "8", "", "*"], ["Digit9", "9", "", "("], ["Digit0", "0", "", ")"], ["Minus", "-", "", "_"], ["Equal", "=", "", "+"], ["Backspace", "⌫", "wide-2"] ],
    [ ["Tab", "Tab", "wide-1-5"], ["KeyQ", "Q"], ["KeyW", "W"], ["KeyE", "E"], ["KeyR", "R"], ["KeyT", "T"], ["KeyY", "Y"], ["KeyU", "U"], ["KeyI", "I"], ["KeyO", "O"], ["KeyP", "P"], ["BracketLeft", "[", "", "{"], ["BracketRight", "]", "", "}"], ["Backslash", "\\", "wide-1-5", "|"] ],
    [ ["CapsLock", "Caps", "wide-1-75"], ["KeyA", "A"], ["KeyS", "S"], ["KeyD", "D"], ["KeyF", "F"], ["KeyG", "G"], ["KeyH", "H"], ["KeyJ", "J"], ["KeyK", "K"], ["KeyL", "L"], ["Semicolon", ";", "", ":"], ["Quote", "'", "", '"'], ["Enter", "Enter", "wide-2-25"] ],
    [ ["ShiftLeft", "Shift", "wide-2-25"], ["KeyZ", "Z"], ["KeyX", "X"], ["KeyC", "C"], ["KeyV", "V"], ["KeyB", "B"], ["KeyN", "N"], ["KeyM", "M"], ["Comma", ",", "", "<"], ["Period", ".", "", ">"], ["Slash", "/", "", "?"], ["ShiftRight", "Shift", "wide-2-75"] ],
    [ ["Space", "Space", "space-key"] ]
  ];

  const $ = (id) => document.getElementById(id);
  const el = {
    lessonList: $("lesson-list"), lessonCount: $("lesson-count"), lessonKicker: $("lesson-kicker"), lessonTitle: $("lesson-title"), lessonDescription: $("lesson-description"),
    state: $("session-state"), focusLabel: $("focus-label"), fingerDot: $("finger-dot"), fingerName: $("finger-name"), fingerHint: $("finger-hint"), nextKey: $("next-key-label"), targetLabel: $("target-label"), target: $("target-line"), feedback: $("feedback"), notice: $("notice-text"),
    start: $("start-button"), restart: $("restart-button"), next: $("next-button"), keyboard: $("keyboard"), accuracy: $("accuracy-value"), speed: $("speed-value"), mistakes: $("mistakes-value"),
    progress: $("progress-value"), progressBar: $("progress-bar"), completed: $("completed-value"), bestSpeed: $("best-speed-value"), weakKeys: $("weak-keys-value"), coaching: $("coaching-text"),
    weakButton: $("weak-keys-button"), blindToggle: $("blind-toggle"), resetProgress: $("reset-progress"), imePractice: $("ime-practice"), imeInput: $("ime-input"), imeProgressHint: $("ime-progress-hint"), imeInputCount: $("ime-input-count")
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
  let imeComposing = false;
  let lastImeValue = "";
  const keyFlashTimers = new Map();

  function loadProgress() {
    try { return { ...DEFAULT_PROGRESS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") }; }
    catch { return { ...DEFAULT_PROGRESS }; }
  }
  function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
  function isImeLesson() { return currentLesson.mode === "ime"; }
  function formatKey(code) { return DISPLAY_BY_CODE[code] || code.replace(/^Key|^Digit/, ""); }
  function formatExpected(item) {
    const label = item.char === " " ? "Space" : item.char;
    return item.requiresShift ? `Shift + ${label}` : label;
  }
  function sequenceFromText(text) {
    return [...text.toLowerCase()]
      .map((char) => {
        const code = CODE_BY_CHAR[char] || SHIFTED_CODE_BY_CHAR[char];
        return code ? { char, code, requiresShift: Boolean(SHIFTED_CODE_BY_CHAR[char]) } : null;
      })
      .filter(Boolean);
  }
  function getAccuracy() { const attempts = correct + mistakes; return attempts ? Math.round((correct / attempts) * 100) : 0; }
  function getWpm() { if (!startedAt || !correct) return 0; const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 600); return Math.round((correct / 5) / minutes); }
  function getCpm() { if (!startedAt || !correct) return 0; const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 600); return Math.round(correct / minutes); }
  function getWeakCodes() { return Object.entries(progress.errorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([code]) => code); }
  function getShiftCode(code) { return (FINGER_BY_CODE[code] || "").startsWith("left") ? "ShiftRight" : "ShiftLeft"; }
  function renderHands() {
    const fingers = [
      ["pinky", 20, 35, 60, "小指", -20], ["ring", 47, 15, 80, "无名指", -8],
      ["middle", 74, 4, 91, "中指", 3], ["index", 101, 20, 75, "食指", 17]
    ];
    $("hand-guide").innerHTML = ["left", "right"].map((side) => {
      const content = fingers.map(([name, x, y, height, label, angle]) => {
        const id = `${side}-${name}`;
        return `<g transform="rotate(${angle} ${x + 10.5} ${y + height})"><g class="hand-finger" data-hand-finger="${id}" style="--hand-color:${FINGER_INFO[id].color}"><title>${side === "left" ? "左手" : "右手"}${label}</title><rect x="${x}" y="${y}" width="21" height="${height}" rx="10.5"/><circle class="hand-tip" cx="${x + 10.5}" cy="${y + 13}" r="5"/></g></g>`;
      }).join("");
      return `<svg viewBox="-15 0 210 170" aria-hidden="true"><g ${side === "right" ? 'transform="translate(180 0) scale(-1 1)"' : ""}><path class="hand-palm" d="M20 85 Q20 76 34 78 L111 78 L133 69 Q148 63 151 77 Q154 85 144 96 L127 119 Q121 131 112 139 L111 157 L44 157 L42 135 Q19 119 18 101 Z"/>${content}<g transform="rotate(55 137 96)"><g class="hand-finger" data-hand-finger="${side}-thumb" style="--hand-color:var(--accent)"><title>${side === "left" ? "左手" : "右手"}拇指</title><rect x="126" y="59" width="23" height="57" rx="11.5"/><circle class="hand-tip" cx="137.5" cy="72" r="5"/></g></g><path class="hand-crease" d="M43 108 Q79 96 107 111 M54 140 L99 140"/></g></svg>`;
    }).join("");
  }

  function updateHands(item) {
    const guide = $("hand-guide");
    guide.querySelectorAll(".hand-finger.active").forEach((node) => node.classList.remove("active"));
    if (isImeLesson()) {
      guide.setAttribute("aria-label", "中文输入法模式，不指定拼音键位手指");
      return;
    }
    if (!item) { guide.setAttribute("aria-label", "练习完成，双手回到基准位"); return; }
    const fingerId = FINGER_BY_CODE[item.code];
    const ids = fingerId === "thumbs" ? ["left-thumb", "right-thumb"] : [fingerId];
    if (item.requiresShift) ids.push(getShiftCode(item.code) === "ShiftLeft" ? "left-pinky" : "right-pinky");
    ids.forEach((id) => guide.querySelector(`[data-hand-finger="${id}"]`)?.classList.add("active"));
    guide.setAttribute("aria-label", `${FINGER_INFO[fingerId]?.name || "手指"}输入${formatExpected(item)}${item.requiresShift ? "，另一只手小指按住 Shift" : ""}${fingerId === "thumbs" ? "，左右拇指任选一只" : ""}`);
  }

  function renderKeyboard() {
    el.keyboard.innerHTML = "";
    KEYBOARD_ROWS.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "key-row";
      row.forEach(([code, label, size, shiftLabel]) => {
        const key = document.createElement("div");
        key.className = `key ${size || ""} ${code === "KeyF" || code === "KeyJ" ? "home-key" : ""}`;
        key.dataset.code = code;
        key.dataset.finger = FINGER_BY_CODE[code] || "";
        if (shiftLabel) {
          const main = document.createElement("span");
          const shifted = document.createElement("span");
          main.className = "key-main";
          shifted.className = "key-shift-label";
          main.textContent = label;
          shifted.textContent = shiftLabel;
          key.append(main, shifted);
        } else {
          key.textContent = label;
        }
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
    const speeds = [progress.bestWpm ? `${progress.bestWpm} WPM` : "", progress.bestCpm ? `${progress.bestCpm} 字/分` : ""].filter(Boolean);
    el.completed.textContent = `${progress.completed} 次`;
    el.bestSpeed.textContent = speeds.join(" · ") || "—";
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
      span.textContent = item.char === " " ? "\u00a0" : item.char;
      el.target.appendChild(span);
    });
  }

  function renderImeTarget() {
    const targetChars = [...currentLesson.text];
    el.target.innerHTML = "";
    targetChars.forEach((char, index) => {
      const span = document.createElement("span");
      span.className = `target-char ${char === " " ? "space" : ""} ${index < cursor ? "correct" : index === cursor ? "current" : "pending"}`;
      span.textContent = char === " " ? "\u00a0" : char;
      el.target.appendChild(span);
    });
  }

  function followTargetProgress(force = false) {
    if (!currentLesson.long) return;
    const focus = el.target.querySelector(".target-char.current") || (cursor ? el.target.lastElementChild : null);
    if (!focus) {
      if (force) el.target.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const targetBox = el.target.getBoundingClientRect();
    const focusBox = focus.getBoundingClientRect();
    const focusTop = focusBox.top - targetBox.top + el.target.scrollTop;
    const focusBottom = focusTop + focusBox.height;
    const safeGap = Math.max(18, Math.round(el.target.clientHeight * .2));
    const viewportTop = el.target.scrollTop;
    const viewportBottom = viewportTop + el.target.clientHeight;
    const outOfView = focusTop < viewportTop + safeGap || focusBottom > viewportBottom - safeGap;
    if (!force && !outOfView) return;
    const nextTop = Math.max(0, focusTop - (el.target.clientHeight - focusBox.height) / 2);
    el.target.scrollTop = nextTop;
  }

  function setState(label, state) {
    el.state.textContent = label;
    el.state.dataset.state = state;
  }
  function setFeedback(message, tone = "neutral") { el.feedback.textContent = message; el.feedback.dataset.tone = tone; }
  function clearKeyboardTargets() { document.querySelectorAll(".key.target").forEach((node) => node.classList.remove("target")); }

  function updateFocus() {
    clearKeyboardTargets();
    const item = sequence[cursor];
    updateHands(item);
    if (!item) { el.nextKey.textContent = "✓"; return; }
    const finger = FINGER_INFO[FINGER_BY_CODE[item.code]] || FINGER_INFO["left-index"];
    const shiftCode = item.requiresShift ? getShiftCode(item.code) : "";
    el.focusLabel.textContent = "当前该用";
    el.nextKey.textContent = formatExpected(item);
    el.fingerName.textContent = finger.name;
    el.fingerHint.textContent = item.requiresShift ? `${finger.hint} · 另一只手按住${formatKey(shiftCode)}` : finger.hint;
    el.fingerDot.style.background = finger.color;
    el.fingerDot.style.boxShadow = `0 0 0 5px color-mix(in srgb, ${finger.color} 15%, transparent), 0 0 22px ${finger.color}`;
    const key = document.querySelector(`.key[data-code="${item.code}"]`);
    if (key) key.classList.add("target");
    if (shiftCode) document.querySelector(`.key[data-code="${shiftCode}"]`)?.classList.add("target");
  }

  function updateImeFocus() {
    clearKeyboardTargets();
    updateHands(null);
    el.focusLabel.textContent = "当前模式";
    el.fingerName.textContent = "中文输入法";
    el.fingerHint.textContent = "使用拼音或双拼，在输入区逐字校验";
    el.nextKey.textContent = active ? "输入中" : "中文";
    el.fingerDot.style.background = "var(--accent)";
    el.fingerDot.style.boxShadow = "0 0 0 5px rgba(233,168,76,.14), 0 0 22px rgba(233,168,76,.45)";
  }

  function updateImeProgress() {
    const total = [...currentLesson.text].length;
    el.imeInputCount.textContent = `${cursor} / ${total}`;
    if (!active) el.imeProgressHint.textContent = "点击开始后，可用拼音或双拼输入。";
    else if (cursor === total) el.imeProgressHint.textContent = "文章已完成。";
    else el.imeProgressHint.textContent = `已核对 ${cursor} 个字，保持自然节奏。`;
  }

  function updateSessionStats() {
    const pct = sequence.length ? Math.round((cursor / sequence.length) * 100) : 0;
    el.accuracy.textContent = correct + mistakes ? `${getAccuracy()}%` : "—";
    el.speed.textContent = startedAt && correct ? (isImeLesson() ? `${getCpm()} 字/分` : `${getWpm()} WPM`) : "—";
    el.mistakes.textContent = String(mistakes);
    el.progress.textContent = `${pct}%`;
    el.progressBar.style.width = `${pct}%`;
    el.progressBar.parentElement.setAttribute("aria-valuenow", String(pct));
  }

  function renderPractice(followTarget = false) {
    if (currentLesson.stageEnds) {
      const stage = Math.min(2, currentLesson.stageEnds.findIndex((end) => cursor < end) === -1
        ? 2 : currentLesson.stageEnds.findIndex((end) => cursor < end));
      el.lessonKicker.textContent = `${currentLesson.step} · ${stage + 1}/3 ${STAGE_NAMES[stage]}`;
    }
    if (isImeLesson()) {
      renderImeTarget();
      updateImeFocus();
      updateImeProgress();
    } else {
      renderTarget();
      updateFocus();
    }
    updateSessionStats();
    if (currentLesson.long && (active || followTarget)) {
      window.requestAnimationFrame(() => followTargetProgress(followTarget));
    }
  }

  function updateLessonModeUi() {
    const ime = isImeLesson();
    document.body.classList.toggle("ime-mode", ime);
    el.imePractice.hidden = !ime;
    el.imeInput.disabled = true;
    el.imeInput.value = "";
    el.targetLabel.textContent = ime
      ? "切换中文输入法后，在下方输入框逐字输入。全文可滚动阅读，练习时会自动跟随。"
      : currentLesson.long
        ? "全文可滚动阅读；开始练习后会自动跟随当前字符。"
        : "跟着节奏按，不必用力。";
    el.notice.textContent = ime
      ? "中文长文请切换到中文输入法。拼音和双拼方案不同，因此本模式校验最终输入文字，不高亮具体拼音键位。"
      : "英文、数字和符号课程请使用英文 QWERTY 键盘。符号课程会要求正确使用 Shift；网页会判断按键位置，无法直接识别你实际用了哪根手指。";
  }

  function selectLesson(lesson) {
    $("lesson-dialog").close();
    currentLesson = lesson;
    sequence = isImeLesson() ? [...lesson.text] : sequenceFromText(lesson.text);
    cursor = 0; active = false; startedAt = 0; correct = 0; mistakes = 0;
    imeComposing = false; lastImeValue = "";
    updateLessonModeUi();
    el.lessonKicker.textContent = lesson.step;
    el.lessonTitle.textContent = lesson.title;
    el.lessonDescription.textContent = lesson.description;
    el.start.textContent = "开始练习";
    setState("准备开始", "ready");
    setFeedback(isImeLesson() ? "点击“开始练习”，然后在输入框中输入文章。" : "点击“开始练习”，然后直接用键盘输入。");
    el.target.scrollTop = 0;
    renderLessons(); renderPractice();
  }

  function startPractice() {
    if (cursor >= sequence.length) restartPractice();
    active = true;
    if (!startedAt) startedAt = Date.now();
    el.start.textContent = "练习中…";
    setState("正在练习", "active");
    if (isImeLesson()) {
      el.imeInput.disabled = false;
      window.setTimeout(() => el.imeInput.focus(), 0);
      setFeedback("使用你的中文输入法逐字输入；若不一致，修改后再继续。", "neutral");
    } else {
      setFeedback("只注意下一键和该用的手指。按错了就慢一点重来。", "neutral");
    }
    renderPractice(true);
  }

  function restartPractice() {
    cursor = 0; active = false; startedAt = 0; correct = 0; mistakes = 0;
    imeComposing = false; lastImeValue = "";
    el.imeInput.value = "";
    el.imeInput.disabled = true;
    el.start.textContent = "开始练习";
    setState("准备开始", "ready");
    setFeedback(isImeLesson() ? "已重置。开始后，在输入框中从第一个字输入。" : "已重置。按开始后，先把 F / J 摸准。");
    el.target.scrollTop = 0;
    renderPractice();
  }

  function completePractice() {
    active = false;
    el.imeInput.disabled = true;
    const speed = isImeLesson() ? getCpm() : getWpm();
    const speedLabel = isImeLesson() ? `${speed} 字/分` : `${speed} WPM`;
    const accuracy = getAccuracy();
    progress.completed += 1;
    if (isImeLesson()) progress.bestCpm = Math.max(progress.bestCpm || 0, speed);
    else progress.bestWpm = Math.max(progress.bestWpm || 0, speed);
    if (!progress.completedLessons.includes(currentLesson.id)) progress.completedLessons.push(currentLesson.id);
    saveProgress();
    el.start.textContent = "再练一次";
    setState("本轮完成", "complete");
    setFeedback(`完成：${accuracy}% 正确率，${speedLabel}。${accuracy >= 96 ? "可以进入下一课。" : "建议再来一遍，先把正确率提到 96%。"}`, "success");
    renderLessons(); renderHistory(); renderPractice(true);
  }

  function flashKey(code, kind) {
    const key = document.querySelector(`.key[data-code="${code}"]`);
    if (!key) return;
    window.clearTimeout(keyFlashTimers.get(code));
    key.classList.remove("key-correct", "key-wrong");
    void key.offsetWidth;
    key.classList.add(kind);
    const timer = window.setTimeout(() => {
      key.classList.remove(kind);
      if (keyFlashTimers.get(code) === timer) keyFlashTimers.delete(code);
    }, 220);
    keyFlashTimers.set(code, timer);
  }

  function handleKeydown(event) {
    if ($("lesson-dialog").open) return;
    if (isImeLesson() || !active || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const expected = sequence[cursor];
    if (!expected) return;
    if (event.code === "Backspace") {
      event.preventDefault();
      setFeedback("本练习会立即标出错误，不需要退格；重新按亮起的键即可。", "neutral");
      return;
    }
    if (!FINGER_BY_CODE[event.code]) return;
    event.preventDefault();
    const shiftMatches = Boolean(event.shiftKey) === Boolean(expected.requiresShift);
    if (event.code === expected.code && shiftMatches) {
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
      if (event.code === expected.code) {
        setFeedback(expected.requiresShift ? `这个符号需要按住 Shift：${formatExpected(expected)}。` : `这一键不需要 Shift：${formatExpected(expected)}。`, "error");
      } else {
        setFeedback(`这次按成了 ${event.shiftKey ? "Shift + " : ""}${formatKey(event.code)}。下一键仍是 ${formatExpected(expected)}，放慢一点。`, "error");
      }
      renderHistory();
    }
    renderPractice();
  }

  function getImeMatchLength(typed, expected) {
    const typedChars = [...typed];
    const expectedChars = [...expected];
    let matched = 0;
    while (matched < typedChars.length && matched < expectedChars.length && typedChars[matched] === expectedChars[matched]) matched += 1;
    return { matched, typedChars, expectedChars };
  }

  function handleImeInput() {
    if (!active || !isImeLesson() || imeComposing) return;
    const { matched, typedChars, expectedChars } = getImeMatchLength(el.imeInput.value, currentLesson.text);
    const added = Math.max(0, typedChars.length - [...lastImeValue].length);
    if (matched < typedChars.length && added) {
      mistakes += added;
      setFeedback(`第 ${matched + 1} 个字应为「${expectedChars[matched] || "结束"}」，请修改后继续。`, "error");
    } else if (matched > cursor) {
      setFeedback("正确，保持自然节奏继续。", "success");
    }
    cursor = matched;
    correct = matched;
    lastImeValue = el.imeInput.value;
    renderPractice();
    if (matched === expectedChars.length && typedChars.length === expectedChars.length) completePractice();
  }

  function startWeakKeyPractice() {
    const weak = getWeakCodes();
    if (!weak.length) {
      setFeedback("还没有错误记录。先完成一轮英文键位练习，系统会把容易按错的键收集起来。", "neutral");
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
  $("choose-lesson").addEventListener("click", () => $("lesson-dialog").showModal());
  $("close-lessons").addEventListener("click", () => $("lesson-dialog").close());
  el.restart.addEventListener("click", restartPractice);
  el.next.addEventListener("click", nextLesson);
  el.weakButton.addEventListener("click", startWeakKeyPractice);
  el.blindToggle.addEventListener("click", toggleBlindMode);
  el.resetProgress.addEventListener("click", resetAllProgress);
  el.imeInput.addEventListener("compositionstart", () => { imeComposing = true; });
  el.imeInput.addEventListener("compositionend", () => {
    imeComposing = false;
    window.setTimeout(handleImeInput, 0);
  });
  el.imeInput.addEventListener("input", handleImeInput);
  el.imeInput.addEventListener("paste", (event) => {
    if (!isImeLesson()) return;
    event.preventDefault();
    setFeedback("长文挑战不支持粘贴，请逐字输入。", "error");
  });
  document.addEventListener("keydown", handleKeydown);

  renderHands();
  renderKeyboard();
  renderHistory();
  selectLesson(LESSONS[0]);
})();
