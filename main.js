document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupHeaderState();
  setupRevealAnimations();
  setupCountdowns();
  setupTrailerPlayers();
  setupAmbientPointer();
  setCurrentYear();
});

function setupNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  if (!navToggle || !nav) {
    return;
  }

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const nextState = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", nextState);
    navToggle.classList.toggle("is-open", nextState);
    navToggle.setAttribute("aria-expanded", String(nextState));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });
}

function setupHeaderState() {
  const header = document.getElementById("site-header");

  if (!header) {
    return;
  }

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (!revealItems.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -32px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupCountdowns() {
  const countdowns = document.querySelectorAll("[data-countdown-target]");

  countdowns.forEach((countdown) => {
    const target = countdown.getAttribute("data-countdown-target");

    if (!target) {
      return;
    }

    const parts = {
      days: countdown.querySelector('[data-countdown-value="days"]'),
      hours: countdown.querySelector('[data-countdown-value="hours"]'),
      minutes: countdown.querySelector('[data-countdown-value="minutes"]'),
      seconds: countdown.querySelector('[data-countdown-value="seconds"]')
    };

    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();

      if (diff <= 0) {
        Object.values(parts).forEach((part) => {
          if (part) {
            part.textContent = "00";
          }
        });
        return;
      }

      const values = {
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff / 3600000) % 24,
        minutes: Math.floor(diff / 60000) % 60,
        seconds: Math.floor(diff / 1000) % 60
      };

      Object.entries(values).forEach(([key, value]) => {
        if (parts[key]) {
          parts[key].textContent = String(value).padStart(2, "0");
        }
      });
    };

    tick();
    window.setInterval(tick, 1000);
  });
}

function setupAmbientPointer() {
  const root = document.documentElement;

  const syncPointer = (clientX, clientY) => {
    const x = `${(clientX / window.innerWidth) * 100}%`;
    const y = `${(clientY / window.innerHeight) * 100}%`;
    root.style.setProperty("--pointer-x", x);
    root.style.setProperty("--pointer-y", y);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      syncPointer(event.clientX, event.clientY);
    },
    { passive: true }
  );
}

function setupTrailerPlayers() {
  const toggles = document.querySelectorAll("[data-trailer-toggle]");

  toggles.forEach((toggle) => {
    const targetId = toggle.getAttribute("data-trailer-toggle");
    const video = targetId ? document.getElementById(targetId) : null;

    if (!video) {
      return;
    }

    const syncLabel = () => {
      const paused = video.paused;
      toggle.textContent = paused ? "Play" : "Pause";
      toggle.setAttribute("aria-label", paused ? "Play trailer" : "Pause trailer");
    };

    toggle.addEventListener("click", async () => {
      if (video.paused) {
        try {
          await video.play();
        } catch (error) {
          return;
        }
      } else {
        video.pause();
      }

      syncLabel();
    });

    video.addEventListener("play", syncLabel);
    video.addEventListener("pause", syncLabel);
    syncLabel();
  });
}

function setCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}
