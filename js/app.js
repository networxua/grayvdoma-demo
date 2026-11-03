(function () {
  const GAMES = [
    { id: "diablo-4", name: "Diablo 4", cover: "assets/covers/diablo-4.webp", free: true },
    { id: "god-of-war-ragnarok", name: "God of War Ragnarök", cover: "assets/covers/god-of-war-ragnarok.webp", free: false },
    { id: "elden-ring", name: "Elden Ring", cover: "assets/covers/elden-ring.webp", free: false },
    { id: "ghost-of-tsushima", name: "Ghost of Tsushima", cover: "assets/covers/ghost-of-tsushima.webp", free: false },
    { id: "cyberpunk-2077", name: "Cyberpunk 2077", cover: "assets/covers/cyberpunk-2077.webp", free: false },
    { id: "black-myth-wukong", name: "Black Myth: Wukong", cover: "assets/covers/black-myth-wukong.webp", free: false },
    { id: "horizon-forbidden-west", name: "Horizon Forbidden West", cover: "assets/covers/horizon-forbidden-west.webp", free: false },
    { id: "astro-bot", name: "Astro Bot", cover: "assets/covers/astro-bot.webp", free: false }
  ];
  const BUY = 2500;

  const money = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  const rentOf = (days) => {
    const base = 100 * (days / 7);
    const off = days === 14 ? 0.1 : days === 28 ? 0.2 : 0;
    return Math.round(base * (1 - off));
  };

  const picks = document.getElementById("game-picks");
  const priceEl = document.getElementById("rent-price");
  const saveEl = document.getElementById("save");
  const termLabel = document.getElementById("term-label");
  let calcGame = GAMES[0];
  let calcDays = 7;

  function paintCalc() {
    const rent = rentOf(calcDays);
    priceEl.innerHTML = money(rent) + "&nbsp;₴";
    saveEl.textContent = money(BUY - rent);
    termLabel.textContent = "на " + calcDays + " днів";
    picks.querySelectorAll(".chip").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.id === calcGame.id);
    });
  }

  GAMES.forEach((game) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (game.free ? " is-on" : "");
    btn.dataset.id = game.id;
    btn.textContent = game.name;
    btn.addEventListener("click", () => {
      calcGame = game;
      paintCalc();
    });
    picks.appendChild(btn);
  });

  document.querySelectorAll(".term").forEach((btn) => {
    btn.addEventListener("click", () => {
      calcDays = Number(btn.dataset.days);
      document.querySelectorAll(".term").forEach((el) => el.classList.toggle("is-on", el === btn));
      paintCalc();
    });
  });
  paintCalc();

  const rail = document.getElementById("rail");
  GAMES.forEach((game) => {
    const card = document.createElement("article");
    card.className = "hit";
    card.innerHTML =
      '<div class="shot"><img src="' + game.cover + '" alt="" width="640" height="400" loading="lazy">' +
      '<span class="badge' + (game.free ? " free" : "") + '">' + (game.free ? "Вільно" : "Зайнято") + "</span></div>" +
      "<h3>" + game.name + "</h3>" +
      '<p class="meta">від 100 ₴ / 7 днів</p>' +
      '<button class="go" type="button">' + (game.free ? "Підібрати" : "Повідомити, коли звільниться") + "</button>";
    card.querySelector(".go").addEventListener("click", () => openBot({ gameId: game.id, intent: game.free ? "rent" : "notify" }));
    rail.appendChild(card);
  });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const photo = document.querySelector(".hero-media img");
  const hero = document.querySelector(".hero");
  if (!reduce && photo && "IntersectionObserver" in window) {
    let on = false;
    let raf = 0;
    const loop = () => {
      if (!on) return;
      const y = window.scrollY;
      photo.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0) scale(" + (1.04 + Math.min(y / innerHeight, 1) * 0.04).toFixed(3) + ")";
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver((entries) => {
      on = entries[0].isIntersecting;
      cancelAnimationFrame(raf);
      if (on) loop();
    });
    io.observe(hero);
  }

  const steps = document.getElementById("steps");
  if (steps && "IntersectionObserver" in window) {
    if (reduce) steps.classList.add("is-on");
    else {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          steps.classList.add("is-on");
          io.disconnect();
        }
      }, { threshold: 0.4 });
      io.observe(steps);
    }
  }

  const heroCta = document.querySelector(".hero .cta");
  const endCta = document.querySelector(".end .cta");
  if (heroCta && "IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) seen.add(entry.target);
        else seen.delete(entry.target);
      });
      document.body.classList.toggle("show-float", seen.size === 0);
    }, { threshold: 0.4 });
    io.observe(heroCta);
    if (endCta) io.observe(endCta);
  }

  const sheet = document.getElementById("sheet");
  const backdrop = document.getElementById("backdrop");
  const log = document.getElementById("log");
  let lastFocus = null;

  function closeBot() {
    sheet.classList.remove("is-on");
    backdrop.classList.remove("is-on");
    sheet.hidden = true;
    backdrop.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  function openBot(opts) {
    opts = opts || {};
    lastFocus = document.activeElement;
    sheet.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add("is-on");
      backdrop.classList.add("is-on");
    });
    const game = GAMES.find((g) => g.id === opts.gameId) || null;
    if (opts.plan === "sub") renderSub();
    else if (opts.intent === "notify" && game) renderNotify(game);
    else if (game) renderDays(game, opts.days || calcDays);
    else renderGames();
  }

  document.querySelectorAll("[data-open-bot]").forEach((el) => {
    el.addEventListener("click", () => {
      const days = el.dataset.days ? Number(el.dataset.days) : null;
      const plan = el.dataset.plan || null;
      if (plan === "sub") openBot({ plan: "sub" });
      else if (days) openBot({ gameId: calcGame.id, days: days });
      else openBot();
    });
  });
  document.getElementById("calc-go").addEventListener("click", () => openBot({ gameId: calcGame.id, days: calcDays }));
  document.getElementById("sheet-close").addEventListener("click", closeBot);
  backdrop.addEventListener("click", closeBot);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeBot();
  });

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
    input.className = "find";
    input.placeholder = "Пошук";
    input.setAttribute("aria-label", "Пошук гри");
    const box = document.createElement("div");
    box.className = "choices";
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      box.innerHTML = "";
      GAMES.filter((g) => g.name.toLowerCase().includes(q)).forEach((game) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = game.name + (game.free ? " · вільно" : " · зайнято");
        btn.addEventListener("click", () => {
          if (game.free) renderDays(game, 7);
          else renderNotify(game);
        });
        box.appendChild(btn);
      });
    };
    input.addEventListener("input", draw);
    log.append(input, box);
    draw();
    input.focus();
  }

  function renderDays(game, preset) {
    clear();
    ask(game.name + ". На скільки днів?");
    const box = document.createElement("div");
    box.className = "choices";
    [[7, "7 днів · 100 ₴"], [14, "14 днів · 180 ₴ · −10%"], [28, "28 днів · 320 ₴ · −20%"]].forEach(([days, label]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      if (days === preset) btn.classList.add("is-on");
      btn.addEventListener("click", () => renderOffer(game, days));
      box.appendChild(btn);
    });
    const sub = document.createElement("button");
    sub.type = "button";
    sub.textContent = "Підписка · 700 ₴ / місяць";
    sub.addEventListener("click", () => renderSub(game));
    box.appendChild(sub);
    log.appendChild(box);
  }

  function renderOffer(game, days) {
    const rent = rentOf(days);
    clear();
    const card = document.createElement("div");
    card.className = "price-card";
    card.innerHTML = "<p>" + game.name + " · " + days + " днів</p><div class=\"big\">" + money(rent) + "&nbsp;₴</div><p>Диск ≈2&nbsp;500&nbsp;₴. Лишається ≈" + money(BUY - rent) + "&nbsp;₴.</p>";
    const next = document.createElement("button");
    next.className = "plain";
    next.type = "button";
    next.textContent = "Залишити заявку";
    next.addEventListener("click", () => renderForm(game.name + ", " + days + " днів, " + rent + " ₴"));
    log.append(card, next);
  }

  function renderSub(game) {
    clear();
    const card = document.createElement("div");
    card.className = "price-card";
    card.innerHTML = "<p>Підписка на місяць" + (game ? " · " + game.name : "") + "</p><div class=\"big\">700&nbsp;₴</div><p>Усі вільні ігри. Зміна раз на 24 години. Один диск ≈2&nbsp;500&nbsp;₴.</p>";
    const next = document.createElement("button");
    next.className = "plain";
    next.type = "button";
    next.textContent = "Залишити заявку";
    next.addEventListener("click", () => renderForm("Підписка, місяць, 700 ₴" + (game ? ", " + game.name : "")));
    log.append(card, next);
  }

  function renderNotify(game) {
    clear();
    ask(game.name + " зараз зайнятий.");
    const p = document.createElement("p");
    p.textContent = "Повідомимо, коли з’явиться. Оренда від 100 ₴ / 7 днів.";
    const next = document.createElement("button");
    next.className = "plain";
    next.type = "button";
    next.textContent = "Залишити заявку";
    next.addEventListener("click", () => renderForm("Повідомити: " + game.name));
    log.append(p, next);
  }

  function renderForm(what) {
    clear();
    ask("Залишити заявку");
    const form = document.createElement("form");
    form.className = "form";
    form.innerHTML = '<input name="name" placeholder="Ім’я" autocomplete="name" required aria-label="Ім’я"><input name="contact" placeholder="Telegram або телефон" autocomplete="tel" required aria-label="Telegram або телефон"><p class="err" hidden>Напишіть ім’я і Telegram або телефон.</p><button class="plain" type="submit">Надіслати</button>';
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const contact = String(data.get("contact") || "").trim();
      const err = form.querySelector(".err");
      if (!name || !contact) {
        err.hidden = false;
        return;
      }
      renderSent(name);
    });
    const back = document.createElement("p");
    back.className = "fine";
    back.textContent = what;
    log.append(back, form);
    form.elements.name.focus();
  }

  function renderSent(name) {
    clear();
    const box = document.createElement("div");
    box.className = "sent";
    box.innerHTML = '<div class="mark" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12.5 10 17l9-10" stroke="currentColor" stroke-width="1.8"/></svg></div>';
    const strong = document.createElement("strong");
    strong.textContent = "Заявка відправлена менеджеру в Telegram.";
    const note = document.createElement("p");
    note.className = "fine";
    note.textContent = name + ", це демо — повідомлення нікуди не пішло. На бойовому сайті його отримає @SeregaGlusch.";
    box.append(strong, note);
    log.appendChild(box);
  }
})();
