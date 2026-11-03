(function () {
  const TG = "https://t.me/SeregaGlusch";
  const launcher = document.getElementById("bot-open");
  const panel = document.getElementById("bot");
  const log = document.getElementById("bot-log");
  const form = document.getElementById("bot-form");
  const input = document.getElementById("bot-input");
  const closeBtn = document.getElementById("bot-close");

  const plans = {
    week: "Тиждень — 300 ₴. Доступ до всіх вільних ігор, зміна акаунтів без обмежень, активний лише один, підтримка 24/7. Заморозка для цього тарифу недоступна.",
    month: "Місяць — 700 ₴. На сайті цей тариф позначений як найпопулярніший. Ті самі умови, заморозка 300 ₴ до 14 днів.",
    q: "3 місяці — 1 400 ₴. Заморозка 500 ₴ до 1 місяця.",
    half: "Півроку — 2 300 ₴. Заморозка 800 ₴ до 3 місяців.",
    year: "Рік — 4 000 ₴. Заморозка 1 300 ₴ до 6 місяців. На сайті це названо найвигіднішим варіантом."
  };

  function addMsg(text, who) {
    const el = document.createElement("div");
    el.className = "msg " + who;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function choices(items) {
    const row = document.createElement("div");
    row.className = "choices";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.label;
      btn.addEventListener("click", () => {
        addMsg(item.label, "me");
        row.remove();
        item.run();
      });
      row.appendChild(btn);
    });
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function offerOrder(planText) {
    addMsg(planText + "\n\nОформити в цьому прототипі не можна: оплати й кабінету тут немає. Напишіть у Telegram @SeregaGlusch — на бойовому сайті після оплати видача, за їхнім FAQ, зазвичай 2–5 хвилин.", "bot");
    choices([
      { label: "Оформити", run: () => { window.open(TG, "_blank", "noopener"); addMsg("Відкрив Telegram. Якщо вікно заблокувалось — кнопка є внизу сторінки.", "bot"); menu(); } },
      { label: "До каталогу", run: () => { location.hash = "catalog"; menu(); } },
      { label: "Інше питання", run: menu }
    ]);
  }

  function menu() {
    addMsg("Можу підказати тариф, оренду однієї гри або правила з FAQ.", "bot");
    choices([
      { label: "Підписка", run: askTerm },
      { label: "Одна гра", run: oneGame },
      { label: "Як це працює", run: how },
      { label: "Якщо не працює", run: fail }
    ]);
  }

  function askTerm() {
    addMsg("На який термін берете доступ до всіх вільних ігор? Одночасно активний може бути лише один акаунт.", "bot");
    choices([
      { label: "Тиждень, спробувати", run: () => offerOrder(plans.week) },
      { label: "Місяць, граю регулярно", run: () => offerOrder(plans.month) },
      { label: "Довше", run: askLong }
    ]);
  }

  function askLong() {
    addMsg("Довший термін. Усі три дають ті самі ігри, відрізняються ціна і заморозка.", "bot");
    choices([
      { label: "3 місяці · 1 400 ₴", run: () => offerOrder(plans.q) },
      { label: "Півроку · 2 300 ₴", run: () => offerOrder(plans.half) },
      { label: "Рік · 4 000 ₴", run: () => offerOrder(plans.year) }
    ]);
  }

  function oneGame() {
    addMsg("Оренда окремої гри на сайті: від 7 до 28 днів, крок 7. У FAQ знижка 10% на 14 днів і 20% на 28 днів. Калькулятор на сторінці гри також рахує 21 день зі знижкою 15%.\n\nЗараз у каталозі вільні акаунти лише на Diablo 4: від 100 ₴ / 7 днів, 3 акаунти, PS5. Решта карток позначені «тимчасово недоступно».", "bot");
    choices([
      { label: "Відкрити Diablo 4", run: () => { location.hash = "game-diablo-4"; menu(); } },
      { label: "Оформити", run: () => { window.open(TG, "_blank", "noopener"); menu(); } },
      { label: "Назад", run: menu }
    ]);
  }

  function how() {
    addMsg("Три кроки з їхнього сайту:\n1. Оберіть гру в каталозі.\n2. Оформіть оренду: термін від 7 днів і в кошик. Для підписки — тариф, але спочатку треба увійти в профіль.\n3. Після оплати отримайте доступ.\n\nФормати: П1 офлайн зі свого профілю без інтернету. П2 з активацією, можна в мережі, після оренди загальний доступ треба вимкнути. П3 без активації — граєте з акаунту Грай в дома.", "bot");
    choices([{ label: "Що якщо не працює", run: fail }, { label: "Підібрати тариф", run: askTerm }]);
  }

  function fail() {
    addMsg("З FAQ: якщо акаунт не підійшов, напишіть у чат або на support@grayvdoma.in.ua. Обіцяють безплатну заміну або повне повернення. Гарантія 24 години від моменту отримання.\n\nНе можна міняти пароль, писати в підтримку PlayStation від імені орендованого акаунта, грати на кількох консолях одразу і забувати деактивацію П2.", "bot");
    choices([{ label: "Написати в Telegram", run: () => window.open(TG, "_blank", "noopener") }, { label: "Меню", run: menu }]);
  }

  function findGame(text) {
    const q = text.toLowerCase();
    const cards = Array.from(document.querySelectorAll(".game"));
    return cards.find((card) => (card.getAttribute("data-title") || "").toLowerCase().includes(q) && q.length > 2);
  }

  function onText(raw) {
    const t = raw.trim();
    if (!t) return;
    addMsg(t, "me");
    const s = t.toLowerCase();
    if (/тижд/.test(s)) return offerOrder(plans.week);
    if (/місяц|месяц|700/.test(s)) return offerOrder(plans.month);
    if (/піврок|полгод|2300/.test(s)) return offerOrder(plans.half);
    if (/3 міся|три міся|1400/.test(s)) return offerOrder(plans.q);
    if (/\bрік\b|4000|на рік/.test(s)) return offerOrder(plans.year);
    if (/замороз/.test(s)) return addMsg("Заморозка: тиждень — немає. Місяць 300 ₴ до 14 днів. 3 місяці 500 ₴ до 1 місяця. Півроку 800 ₴ до 3 місяців. Рік 1 300 ₴ до 6 місяців.", "bot") || menu();
    if (/п1|офлайн/.test(s)) return addMsg("П1 — офлайн-формат: граєте зі свого профілю, без ліміту часу, для офлайн-ігор. Потрібно вимкнути інтернет, інакше гра стане недоступною.", "bot") || menu();
    if (/п2|активац/.test(s)) return addMsg("П2 — з активацією. Вхід в орендований акаунт, увімкнути «Загальний доступ до консолі й автономна гра», завантажити гру, вийти і грати зі свого профілю. Після оренди доступ обовʼязково вимкнути і видалити акаунт з консолі. У FAQ це названо критично важливим.", "bot") || menu();
    if (/п3|без активац/.test(s)) return addMsg("П3 — без активації. Найпростіший варіант: запускаєте гру з акаунту Грай в дома, без налаштувань. Грати треба з їхнього профілю.", "bot") || menu();
    if (/не працю|не підій|замін|поверн|грош/.test(s)) return fail();
    if (/видач|як швидко|скільки чека/.test(s)) return addMsg("У FAQ: у більшості випадків видача миттєва після підтвердження оплати, зазвичай 2–5 хвилин. Якщо запит особливий — напишуть і назвуть час.", "bot") || menu();
    if (/telegram|телег|підтрим|контакт|графік|годин/.test(s)) return addMsg("Email support@grayvdoma.in.ua. Telegram @SeregaGlusch. На сторінці контактів графік 10:00–22:00 без вихідних. У тарифах і FAQ заявлена підтримка 24/7 — це різні формулювання на одному сайті.", "bot") || menu();
    if (/diablo|діабло/.test(s)) return oneGame();
    if (/цін|тариф|підписк|скільки кошт/.test(s)) return askTerm();
    if (/як працю|крок|оренд/.test(s)) return how();
    const card = findGame(s);
    if (card) {
      const free = card.classList.contains("is-free");
      addMsg(card.getAttribute("data-title") + ": " + (card.getAttribute("data-meta") || "") + (free ? " Зараз є вільні акаунти." : " На картці статус: тимчасово недоступно."), "bot");
      return menu();
    }
    addMsg("Не знайшов це в текстах сайту. Можу про тарифи, П1/П2/П3, видачу і заміну. Або напишіть назву гри з каталогу.", "bot");
    menu();
  }

  function openBot() {
    panel.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!log.childElementCount) {
      addMsg("Демо-бот GrayVDoma. Відповідаю лише за текстами сайту, без зовнішнього AI.", "bot");
      menu();
    }
    input.focus();
  }

  launcher.addEventListener("click", () => {
    if (panel.classList.contains("is-open")) {
      panel.classList.remove("is-open");
      launcher.setAttribute("aria-expanded", "false");
    } else openBot();
  });
  closeBtn.addEventListener("click", () => {
    panel.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    onText(value);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      panel.classList.remove("is-open");
      launcher.setAttribute("aria-expanded", "false");
    }
  });
})();
