(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toast = document.getElementById("toast");
  let toastTimer = 0;

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 4200);
  }
  window.showToast = showToast;

  document.querySelectorAll("[data-toast]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(el.getAttribute("data-toast"));
    });
  });

  const menuBtn = document.querySelector(".menu-btn");
  const panel = document.querySelector(".nav-panel");
  if (menuBtn && panel) {
    menuBtn.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        panel.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  const heroCta = document.querySelector(".tv .bar");
  if (heroCta && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        document.body.classList.toggle("show-sticky", !entry.isIntersecting);
      });
    }, { threshold: 0.2 });
    io.observe(heroCta);
  } else {
    document.body.classList.add("show-sticky");
  }

  const steps = document.querySelector(".steps");
  if (steps) {
    if (reduce || !("IntersectionObserver" in window)) {
      steps.classList.add("is-on");
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            steps.classList.add("is-on");
            io.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(steps);
    }
  }

  const rail = document.querySelector(".rail");
  if (rail && !reduce && "IntersectionObserver" in window) {
    const track = rail.querySelector(".rail-track");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        track.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
      });
    });
    io.observe(rail);
  }

  const search = document.getElementById("q");
  const onlyFree = document.getElementById("only-free");
  const cards = Array.from(document.querySelectorAll(".game"));
  const count = document.getElementById("count");

  function applyFilter() {
    const q = (search.value || "").trim().toLowerCase();
    const free = onlyFree.checked;
    let shown = 0;
    cards.forEach((card) => {
      const hay = (card.innerText || "").toLowerCase();
      const isFree = card.classList.contains("is-free");
      const ok = (!q || hay.includes(q)) && (!free || isFree);
      card.hidden = !ok;
      if (ok) shown += 1;
    });
    count.textContent = shown + " з " + cards.length;
  }
  search.addEventListener("input", applyFilter);
  onlyFree.addEventListener("change", applyFilter);
  applyFilter();

  const dialog = document.getElementById("game-dialog");
  const shot = document.getElementById("dialog-shot");
  const title = document.getElementById("dialog-title");
  const meta = document.getElementById("dialog-meta");
  const desc = document.getElementById("dialog-desc");

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".game, .tile");
      if (!card) return;
      title.textContent = card.getAttribute("data-title") || "";
      meta.textContent = card.getAttribute("data-meta") || "";
      const hidden = card.querySelector(".game-desc");
      desc.textContent = hidden ? hidden.textContent : (card.getAttribute("data-desc") || "");
      const src = card.getAttribute("data-cover");
      shot.innerHTML = "";
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        shot.appendChild(img);
      } else {
        shot.textContent = "[ЗАГЛУШКА: обкладинки на сайті немає]";
      }
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });

  document.querySelectorAll(".rail .tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const slug = tile.getAttribute("data-slug");
      const card = document.querySelector('.game[data-slug="' + slug + '"] [data-open]');
      if (card) card.click();
    });
  });
})();
