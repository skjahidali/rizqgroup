/* RIZQ ONE interactions and lead-enquiry helper.
   IMPORTANT: set WHATSAPP_NUMBER to your business number in international format,
   digits only (example format: 919876543210). Do not include +, spaces or dashes. */
(() => {
  "use strict";

  const WHATSAPP_NUMBER = ""; // Add your verified business WhatsApp number here.
  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");
  const toast = document.getElementById("toast");
  const leadForm = document.getElementById("leadForm");
  const formStatus = document.getElementById("formStatus");
  let toastTimer;

  document.getElementById("year").textContent = new Date().getFullYear();

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3800);
  }

  function closeMenu() {
    if (!menuToggle || !primaryNav) return;
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      primaryNav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    });
    primaryNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // Gentle reveal-on-scroll; content remains visible if IntersectionObserver is unavailable.
  const revealTargets = document.querySelectorAll(
    ".section-heading, .service-card, .industry-item, .workflow-step, .value-list > div, .approach-grid > *, .contact-grid > *"
  );
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("reveal-ready");
    revealTargets.forEach(element => element.classList.add("reveal-on-scroll"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealTargets.forEach(element => observer.observe(element));
  }

  // Service cards can preselect the relevant enquiry topic.
  document.querySelectorAll("[data-service]").forEach(link => {
    link.addEventListener("click", () => {
      const select = document.getElementById("serviceSelect");
      if (!select) return;
      const desired = link.getAttribute("data-service");
      const match = Array.from(select.options).find(option => option.value === desired || option.text === desired);
      if (match) select.value = match.value;
    });
  });

  if (leadForm) {
    leadForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (!leadForm.reportValidity()) return;

      const data = new FormData(leadForm);
      const value = key => String(data.get(key) || "").trim();
      const message = [
        "Hello RIZQ ONE, I'd like to discuss a project.",
        "",
        `Name: ${value("name")}`,
        `Business: ${value("company") || "Not provided"}`,
        `Email: ${value("email")}`,
        `Phone / WhatsApp: ${value("phone") || "Not provided"}`,
        `Area of help: ${value("service")}`,
        "",
        "A little more about the request:",
        value("message")
      ].join("\n");

      if (/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        formStatus.textContent = "Your enquiry is ready in WhatsApp. Review it and press Send there.";
      } else {
        try {
          await navigator.clipboard.writeText(message);
          formStatus.textContent = "Your enquiry has been prepared and copied. Add your WhatsApp number in script.js to enable one-click WhatsApp handoff.";
          showToast("Enquiry copied. Add your WhatsApp number to enable direct handoff.");
        } catch (_) {
          formStatus.textContent = "Your enquiry is ready, but direct WhatsApp handoff is not configured yet. Add your business number in script.js.";
          showToast("Set WHATSAPP_NUMBER in script.js to enable direct handoff.");
        }
      }
    });
  }
})();
