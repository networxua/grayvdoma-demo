(function () {
  const GAMES = [
    { id: "diablo-4", name: "Diablo 4", cover: "assets/covers/diablo-4.webp", free: true, spine: "#ffe14a" },
    { id: "god-of-war-ragnarok", name: "God of War Ragnarök", cover: "assets/covers/god-of-war-ragnarok.webp", free: false, spine: "#7cf5c8" },
    { id: "elden-ring", name: "Elden Ring", cover: "assets/covers/elden-ring.webp", free: false, spine: "#ff4f8b" },
    { id: "ghost-of-tsushima", name: "Ghost of Tsushima", cover: "assets/covers/ghost-of-tsushima.webp", free: false, spine: "#7a5cff" },
    { id: "cyberpunk-2077", name: "Cyberpunk 2077", cover: "assets/covers/cyberpunk-2077.webp", free: false, spine: "#ff7a1a" },
    { id: "black-myth-wukong", name: "Black Myth: Wukong", cover: "assets/covers/black-myth-wukong.webp", free: false, spine: "#fff6ea" },
    { id: "horizon-forbidden-west", name: "Horizon Forbidden West", cover: "assets/covers/horizon-forbidden-west.webp", free: false, spine: "#3ddcff" },
    { id: "astro-bot", name: "Astro Bot", cover: "assets/covers/astro-bot.webp", free: false, spine: "#c6f54a" }
  ];

  const track = document.getElementById("track");
  const scene = document.getElementById("scene");
  GAMES.forEach((game, i) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.style.setProperty("--i", i);
    slot.dataset.id = game.id;
    slot.innerHTML =
      '<div class="pivot"><div class="box" style="--spine:' + game.spine + '">' +
      '<div class="hinge">' +
      '<div class="front"><img src="' + game.cover + '" alt=""></div>' +
      '<div class="back"><span class="seal ' + (game.free ? "free" : "") + '">' + (game.free ? "Вільно" : "Зайнято") + "</span>" +
      "<p>" + (game.free ? "7 днів" : "В підписці") + "</p>" +
      "<strong>" + (game.free ? "від 100 ₴" : game.name) + "</strong>" +
      '<button class="take" type="button">Взяти</button></div>' +
      '<div class="spine"></div></div></div>' +
      '<div class="shadow"></div></div>';
    track.appendChild(slot);
  });

  let offset = 0;
  let drag = null;
  const max = () => Math.max(0, track.scrollWidth - scene.clientWidth + 8);
  const move = (x) => {
    offset = Math.max(0, Math.min(max(), x));
    track.style.transform = "translate3d(" + -offset + "px,0,0)";
  };

  scene.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".take")) return;
    drag = { x: e.clientX, start: offset, moved: false, pointer: e.pointerId };
    scene.setPointerCapture(e.pointerId);
  });
  scene.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 8) drag.moved = true;
    move(drag.start - dx);
    const tilt = Math.max(-14, Math.min(14, -dx * 0.08));
    track.style.setProperty("--tilt", tilt + "deg");
    track.querySelectorAll(".box").forEach((box) => box.style.setProperty("--tilt", tilt + "deg"));
  });
  const endDrag = (e) => {
    if (!drag) return;
    const moved = drag.moved;
    const target = e.target.closest(".slot");
    drag = null;
    track.querySelectorAll(".box").forEach((box) => box.style.setProperty("--tilt", "0deg"));
    if (!moved && target && !e.target.closest(".take")) {
      const open = target.classList.contains("is-open");
      track.querySelectorAll(".slot").forEach((slot) => slot.classList.remove("is-open"));
      if (!open) target.classList.add("is-open");
    }
  };
  scene.addEventListener("pointerup", endDrag);
  scene.addEventListener("pointercancel", endDrag);
  track.addEventListener("click", (e) => {
    const btn = e.target.closest(".take");
    if (!btn) return;
    e.stopPropagation();
    const id = btn.closest(".slot").dataset.id;
    openBot({ gameId: id });
  });

  scene.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    if (max() <= 0) return;
    move(offset + e.deltaY);
  }, { passive: true });

  const sheet = document.getElementById("sheet");
  const backdrop = document.getElementById("backdrop");
  const log = document.getElementById("log");
  const money = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  const rentOf = (days) => Math.round(100 * (days / 7) * (days === 14 ? 0.9 : days === 28 ? 0.8 : 1));

  function closeBot() {
    sheet.hidden = true;
    backdrop.hidden = true;
  }
  function openBot(opts) {
    opts = opts || {};
    sheet.hidden = false;
    backdrop.hidden = false;
    const game = GAMES.find((g) => g.id === opts.gameId);
    if (opts.plan) renderPlan(opts.plan, game);
    else if (game && !game.free) renderNotify(game);
    else if (game) renderDays(game);
    else renderGames();
  }
  document.querySelectorAll("[data-open-bot]").forEach((el) => {
    el.addEventListener("click", () => openBot({ plan: el.dataset.plan || null }));
  });
  document.getElementById("sheet-close").addEventListener("click", closeBot);
  backdrop.addEventListener("click", closeBot);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeBot(); });

  function clear() { log.innerHTML = ""; }
  function ask(text) {
    const p = document.createElement("p");
    p.className = "ask";
    p.textContent = text;
    log.appendChild(p);
  }
  function renderGames() {
    clear();
    ask("Яку гру хочеш?");
    const input = document.createElement("input");
    input.placeholder = "Пошук";
    input.setAttribute("aria-label", "Пошук гри");
    const box = document.createElement("div");
    box.className = "choices";
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      box.innerHTML = "";
      GAMES.filter((g) => g.name.toLowerCase().includes(q)).forEach((game) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = game.name + (game.free ? " · вільно" : " · зайнято");
        b.addEventListener("click", () => (game.free ? renderDays(game) : renderNotify(game)));
        box.appendChild(b);
      });
    };
    input.addEventListener("input", draw);
    log.append(input, box);
    draw();
  }
  function renderDays(game) {
    clear();
    ask(game.name + ". На скільки?");
    const box = document.createElement("div");
    box.className = "choices";
    [[7, "7 днів · 100 ₴"], [14, "14 днів · 180 ₴"], [28, "28 днів · 320 ₴"]].forEach(([d, label]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => renderOffer(game, d));
      box.appendChild(b);
    });
    const sub = document.createElement("button");
    sub.type = "button";
    sub.textContent = "Підписка · від 300 ₴";
    sub.addEventListener("click", () => renderPlan("week", game));
    box.appendChild(sub);
    log.appendChild(box);
  }
  function renderOffer(game, days) {
    const rent = rentOf(days);
    clear();
    const card = document.createElement("div");
    card.innerHTML = "<p>" + game.name + "</p><div class=\"big\">" + money(rent) + "&nbsp;₴</div><p>" + days + " днів</p>";
    const next = document.createElement("button");
    next.className = "plain";
    next.type = "button";
    next.textContent = "Залишити заявку";
    next.addEventListener("click", () => renderForm(game.name + ", " + days + " днів, " + rent + " ₴"));
    log.append(card, next);
  }
  function renderPlan(plan, game) {
    const map = { week: ["Тиждень", 300], month: ["Місяць", 700], year: ["Рік", 4000] };
    const [label, price] = map[plan] || map.month;
    clear();
    const card = document.createElement("div");
    card.innerHTML = "<p>Підписка · " + label + (game ? " · " + game.name : "") + "</p><div class=\"big\">" + money(price) + "&nbsp;₴</div><p>Усі вільні ігри. Зміна без обмежень.</p>";
    const next = document.createElement("button");
    next.className = "plain";
    next.type = "button";
    next.textContent = "Залишити заявку";
    next.addEventListener("click", () => renderForm("Підписка " + label + ", " + price + " ₴" + (game ? ", " + game.name : "")));
    log.append(card, next);
  }
  function renderNotify(game) {
    clear();
    ask(game.name + " зараз зайнятий.");
    const p = document.createElement("p");
    p.textContent = "Повідомимо, коли з’явиться. Або візьми підписку — міняй інші вільні ігри.";
    const a = document.createElement("button");
    a.className = "plain";
    a.type = "button";
    a.textContent = "Підписка на місяць · 700 ₴";
    a.addEventListener("click", () => renderPlan("month", game));
    const b = document.createElement("button");
    b.className = "plain";
    b.type = "button";
    b.textContent = "Повідомити, коли звільниться";
    b.addEventListener("click", () => renderForm("Повідомити: " + game.name));
    log.append(p, a, b);
  }
  function renderForm(what) {
    clear();
    ask("Залишити заявку");
    const note = document.createElement("p");
    note.textContent = what;
    const form = document.createElement("form");
    form.className = "form";
    form.innerHTML = '<input name="name" placeholder="Ім’я" aria-label="Ім’я" required><input name="contact" placeholder="Telegram або телефон" aria-label="Telegram або телефон" required><p class="err" hidden>Напишіть ім’я і контакт.</p><button type="submit">Надіслати</button>';
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const contact = String(data.get("contact") || "").trim();
      if (!name || !contact) { form.querySelector(".err").hidden = false; return; }
      clear();
      const done = document.createElement("div");
      done.className = "sent";
      const strong = document.createElement("strong");
      strong.textContent = "Заявка відправлена менеджеру в Telegram.";
      const p = document.createElement("p");
      p.textContent = name + ", це демо — повідомлення не надіслане. На бойовому сайті його отримає @SeregaGlusch.";
      done.append(strong, p);
      log.appendChild(done);
    });
    log.append(note, form);
    form.elements.name.focus();
  }
})();
