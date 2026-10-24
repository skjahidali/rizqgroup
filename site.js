(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const menu = document.getElementById("mobile-menu");
  const menuButton = document.getElementById("menu-btn");
  const menuClose = document.getElementById("menu-close");
  const progress = document.getElementById("reading-progress");

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  if (menu && menuButton) {
    const closeMenu = () => {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("menu-open");
    };

    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menu.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);
      if (open) menu.querySelector("a")?.focus();
    });

    menuClose?.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
        menuButton.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) closeMenu();
    }, { passive: true });
  }

  const revealItems = document.querySelectorAll(".motion-reveal");
  if (revealItems.length && !reducedMotion.matches && "IntersectionObserver" in window) {
    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((element) => observer.observe(element));
  } else {
    revealItems.forEach((element) => element.classList.add("is-visible"));
  }

  const tiltScene = document.querySelector("[data-tilt-scene]");
  if (tiltScene && !reducedMotion.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let frame = 0;
    const setTilt = (event) => {
      const bounds = tiltScene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        tiltScene.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
        tiltScene.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
        tiltScene.style.setProperty("--pointer-x", `${(x * 18).toFixed(1)}px`);
        tiltScene.style.setProperty("--pointer-y", `${(y * 18).toFixed(1)}px`);
      });
    };
    const resetTilt = () => {
      cancelAnimationFrame(frame);
      tiltScene.style.setProperty("--tilt-x", "0deg");
      tiltScene.style.setProperty("--tilt-y", "0deg");
      tiltScene.style.setProperty("--pointer-x", "0px");
      tiltScene.style.setProperty("--pointer-y", "0px");
    };
    tiltScene.addEventListener("pointermove", setTilt, { passive: true });
    tiltScene.addEventListener("pointerleave", resetTilt, { passive: true });
  }

  if (progress) {
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        progress.style.transform = `scaleX(${Math.min(100, Math.max(0, percentage)) / 100})`;
      });
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();
  }

  const searchInput = document.getElementById("insight-search");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const articles = document.querySelectorAll("[data-category]");
  const emptyState = document.getElementById("insight-empty");
  if (searchInput && articles.length) {
    let activeFilter = "all";
    const filterArticles = () => {
      const query = searchInput.value.trim().toLowerCase();
      let visibleCount = 0;
      articles.forEach((article) => {
        const matchesCategory = activeFilter === "all" || article.dataset.category === activeFilter;
        const matchesQuery = !query || article.textContent.toLowerCase().includes(query);
        const visible = matchesCategory && matchesQuery;
        article.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    };
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        filterButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        filterArticles();
      });
    });
    searchInput.addEventListener("input", filterArticles);
  }
})();
