document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupHeaderState();
  setupRevealAnimations();
  setupCountdowns();
  setupTrailerPlayers();
  setupSignalBandMarquee();
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

function setupSignalBandMarquee() {
  const viewports = document.querySelectorAll("[data-signal-marquee]");

  if (!viewports.length) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  viewports.forEach((viewport) => {
    const track = viewport.querySelector(".signal-band-track");
    const baseGroup = track?.querySelector(".signal-band-inner");

    if (!track || !baseGroup) {
      return;
    }

    let frameId = 0;
    let lastFrame = 0;
    let offset = 0;
    let loopWidth = 0;
    let isVisible = true;
    const configuredSpeed = Number.parseFloat(viewport.getAttribute("data-marquee-speed") || "54");
    const speed = Number.isFinite(configuredSpeed) && configuredSpeed > 0 ? configuredSpeed : 54;

    const clearClones = () => {
      track.querySelectorAll("[data-marquee-clone]").forEach((clone) => clone.remove());
    };

    const buildTrack = () => {
      clearClones();
      track.classList.toggle("is-runtime", !reducedMotion.matches);
      track.style.transform = "translate3d(0, 0, 0)";
      offset = 0;
      lastFrame = 0;
      loopWidth = 0;

      if (reducedMotion.matches) {
        return;
      }

      const targetWidth = Math.max(viewport.clientWidth * 2, baseGroup.scrollWidth * 2);

      while (track.scrollWidth < targetWidth) {
        const clone = baseGroup.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("data-marquee-clone", "");
        track.appendChild(clone);
      }

      loopWidth = baseGroup.getBoundingClientRect().width || baseGroup.scrollWidth;
    };

    const tick = (timestamp) => {
      if (!track.isConnected) {
        window.cancelAnimationFrame(frameId);
        return;
      }

      if (reducedMotion.matches || !isVisible || !loopWidth) {
        lastFrame = timestamp;
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      if (!lastFrame) {
        lastFrame = timestamp;
      }

      const delta = Math.min(timestamp - lastFrame, 64);
      offset -= (delta / 1000) * speed;

      if (Math.abs(offset) >= loopWidth) {
        offset += loopWidth;
      }

      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      lastFrame = timestamp;
      frameId = window.requestAnimationFrame(tick);
    };

    const onReducedMotionChange = () => {
      buildTrack();
    };

    buildTrack();

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => {
        buildTrack();
      });
      resizeObserver.observe(viewport);
    } else {
      window.addEventListener("resize", buildTrack, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );

      visibilityObserver.observe(viewport);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(buildTrack).catch(() => {});
    }

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", onReducedMotionChange);
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(onReducedMotionChange);
    }

    frameId = window.requestAnimationFrame(tick);
  });
}

function setCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}
