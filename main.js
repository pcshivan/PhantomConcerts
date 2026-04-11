document.addEventListener("DOMContentLoaded", () => {
  runSafely(setupNavigation);
  runSafely(setupHeaderState);
  runSafely(setupRevealAnimations);
  runSafely(setupCountdowns);
  runSafely(setupTrailerPlayers);
  runSafely(setupHeroShowcases);
  runSafely(setupSignalBandMarquee);
  runSafely(setupAmbientPointer);
  runSafely(setCurrentYear);
});

function runSafely(setupFn) {
  try {
    setupFn();
  } catch (error) {
    console.error(`Unable to initialize ${setupFn.name || "page behavior"}.`, error);
  }
}

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
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!revealItems.length) {
    return;
  }

  const showItem = (item) => {
    item.classList.add("is-visible");
  };

  const prefersReducedMotion =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(showItem);
    return;
  }

  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();

    if (rect.top <= window.innerHeight * 0.92) {
      showItem(item);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showItem(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -32px 0px"
    }
  );

  revealItems.forEach((item) => {
    if (item.classList.contains("is-visible")) {
      return;
    }

    observer.observe(item);
  });

  window.setTimeout(() => {
    const hasVisibleItems = revealItems.some((item) => item.classList.contains("is-visible"));

    if (!hasVisibleItems) {
      revealItems.forEach(showItem);
    }
  }, 900);
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
  const trailerRoots = document.querySelectorAll("[data-youtube-shorts]");

  if (!trailerRoots.length) {
    return;
  }

  loadYouTubeIframeApi()
    .then(() => {
      trailerRoots.forEach((root, index) => {
        initializeYouTubeTrailerPlayer(root, index);
      });
    })
    .catch((error) => {
      console.error("Unable to initialize YouTube trailer player.", error);
    });
}

let youtubeIframeApiPromise = null;

function loadYouTubeIframeApi() {
  if (window.YT && typeof window.YT.Player === "function") {
    return Promise.resolve(window.YT);
  }

  if (youtubeIframeApiPromise) {
    return youtubeIframeApiPromise;
  }

  youtubeIframeApiPromise = new Promise((resolve, reject) => {
    const existingCallback = window.onYouTubeIframeAPIReady;
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Timed out while loading the YouTube IFrame API."));
    }, 10000);

    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeoutId);
      if (typeof existingCallback === "function") {
        existingCallback();
      }
      resolve(window.YT);
    };

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Unable to load the YouTube IFrame API."));
    };
    document.head.appendChild(script);
  });

  return youtubeIframeApiPromise;
}

function initializeYouTubeTrailerPlayer(root, index) {
  if (root.dataset.playerInitialized === "true") {
    return;
  }

  const playlist = getYouTubeShortsPlaylist(root);

  if (!playlist.length) {
    return;
  }

  root.dataset.playerInitialized = "true";
  const rootId = root.id || `trailer-player-${index + 1}`;
  root.id = rootId;
  const toggle = document.querySelector(`[data-trailer-mute-toggle="${rootId}"]`);

  const player = new window.YT.Player(rootId, {
    videoId: playlist[0],
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1,
      rel: 0,
      origin: window.location.origin
    },
    events: {
      onReady: (event) => onTrailerPlayerReady(event, playlist, toggle),
      onStateChange: (event) => onTrailerPlayerStateChange(event, toggle)
    }
  });

  if (toggle) {
    toggle.addEventListener("click", () => {
      if (!player || typeof player.isMuted !== "function") {
        return;
      }

      if (player.isMuted()) {
        player.unMute();
        if (typeof player.getVolume === "function" && player.getVolume() === 0) {
          player.setVolume(65);
        }
      } else {
        player.mute();
      }

      syncTrailerMuteToggle(toggle, player);
    });
  }
}

function getYouTubeShortsPlaylist(root) {
  const configuredList = root.getAttribute("data-youtube-shorts") || "[]";
  let entries = [];

  try {
    const parsed = JSON.parse(configuredList);
    entries = Array.isArray(parsed) ? parsed : [configuredList];
  } catch (error) {
    entries = configuredList
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return Array.from(new Set(entries.map(extractYouTubeVideoId).filter(Boolean)));
}

function extractYouTubeVideoId(input) {
  if (!input) {
    return "";
  }

  const trimmed = input.trim();
  const directMatch = trimmed.match(/^[a-zA-Z0-9_-]{11}$/);

  if (directMatch) {
    return directMatch[0];
  }

  try {
    const url = new URL(trimmed);
    const pathname = url.pathname.replace(/\/+$/, "");
    const shortsMatch = pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})$/);
    const embedMatch = pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})$/);
    const youtuBeMatch = pathname.match(/^\/([a-zA-Z0-9_-]{11})$/);
    const watchId = url.searchParams.get("v");

    if (shortsMatch) {
      return shortsMatch[1];
    }

    if (embedMatch) {
      return embedMatch[1];
    }

    if ((url.hostname === "youtu.be" || url.hostname === "www.youtu.be") && youtuBeMatch) {
      return youtuBeMatch[1];
    }

    if (watchId && /^[a-zA-Z0-9_-]{11}$/.test(watchId)) {
      return watchId;
    }
  } catch (error) {
    return "";
  }

  return "";
}

function onTrailerPlayerReady(event, playlist, toggle) {
  const player = event.target;
  const orderedPlaylist = playlist.length === 1 ? [playlist[0], playlist[0]] : playlist;

  player.setLoop(true);
  player.mute();
  player.loadPlaylist(orderedPlaylist, 0, 0);
  player.playVideo();

  if (toggle) {
    syncTrailerMuteToggle(toggle, player);
  }
}

function onTrailerPlayerStateChange(event, toggle) {
  const player = event.target;

  if (event.data === window.YT.PlayerState.ENDED) {
    const playlist = typeof player.getPlaylist === "function" ? player.getPlaylist() : [];
    const playlistLength = Array.isArray(playlist) ? playlist.length : 0;
    const currentIndex = typeof player.getPlaylistIndex === "function" ? player.getPlaylistIndex() : 0;

    if (playlistLength) {
      player.playVideoAt((currentIndex + 1) % playlistLength);
      return;
    }
  }

  if (toggle && typeof player.isMuted === "function") {
    syncTrailerMuteToggle(toggle, player);
  }
}

function syncTrailerMuteToggle(toggle, player) {
  const isMuted = player.isMuted();
  toggle.textContent = isMuted ? "Unmute" : "Mute";
  toggle.setAttribute("aria-label", isMuted ? "Turn sound on" : "Mute trailer");
  toggle.dataset.soundState = isMuted ? "muted" : "unmuted";
}

function setupHeroShowcases() {
  const showcases = document.querySelectorAll("[data-hero-showcase]");

  if (!showcases.length) {
    return;
  }

  showcases.forEach((showcase) => {
    initializeHeroShowcase(showcase).catch((error) => {
      console.error("Unable to initialize hero showcase.", error);
    });
  });
}

async function initializeHeroShowcase(showcase) {
  const image = showcase.querySelector("img");
  const caption = showcase.querySelector("[data-hero-caption], figcaption");

  if (!image) {
    return;
  }

  const source = image.getAttribute("src") || "";
  const match = source.match(/^(.*\/)?([a-zA-Z_-]*?)(\d+)\.(avif|webp|png|jpe?g)$/i);

  if (!match) {
    return;
  }

  const directory = match[1] || "";
  const baseName = match[2];
  const parsedStartIndex = Number.parseInt(match[3], 10);
  const extension = match[4];
  const configuredStartIndex = Number.parseInt(showcase.getAttribute("data-show-sequence-start") || "", 10);
  const configuredInitialIndex = Number.parseInt(showcase.getAttribute("data-show-initial-index") || "", 10);
  const startIndex =
    Number.isFinite(configuredStartIndex) && configuredStartIndex > 0 ? configuredStartIndex : parsedStartIndex;
  const initialIndex =
    Number.isFinite(configuredInitialIndex) && configuredInitialIndex > 0 ? configuredInitialIndex : parsedStartIndex;
  const configuredInterval = Number.parseInt(showcase.getAttribute("data-show-interval") || "", 10);
  const intervalMs = Number.isFinite(configuredInterval) && configuredInterval >= 1800 ? configuredInterval : 3600;
  const configuredProbeLimit = Number.parseInt(showcase.getAttribute("data-show-probe-limit") || "", 10);
  const probeLimit = Number.isFinite(configuredProbeLimit) && configuredProbeLimit >= 2 ? configuredProbeLimit : 18;
  const reducedMotion =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const defaultAlt = image.getAttribute("alt") || "Phantom Concerts stage visual";
  const frames = await collectHeroShowcaseFrames(showcase, directory, baseName, extension, startIndex, probeLimit, defaultAlt);

  if (!frames.length) {
    return;
  }

  let activeIndex = frames.findIndex((frame) => frame.index === initialIndex);

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  syncHeroShowcaseFrame({
    image,
    caption,
    frame: frames[activeIndex]
  });

  if (frames.length < 2 || reducedMotion) {
    return;
  }
  let intervalId = 0;

  const stopRotation = () => {
    if (!intervalId) {
      return;
    }

    window.clearInterval(intervalId);
    intervalId = 0;
  };

  const swapFrame = (nextIndex) => {
    if (nextIndex === activeIndex || !frames[nextIndex]) {
      return;
    }

    activeIndex = nextIndex;
    image.classList.add("is-transitioning");
    if (caption) {
      caption.classList.add("is-transitioning");
    }

    window.setTimeout(() => {
      syncHeroShowcaseFrame({
        image,
        caption,
        frame: frames[nextIndex]
      });

      window.requestAnimationFrame(() => {
        image.classList.remove("is-transitioning");
        if (caption) {
          caption.classList.remove("is-transitioning");
        }
      });
    }, 180);
  };

  const startRotation = () => {
    if (document.hidden || intervalId) {
      return;
    }

    intervalId = window.setInterval(() => {
      swapFrame((activeIndex + 1) % frames.length);
    }, intervalMs);
  };

  showcase.addEventListener("pointerenter", stopRotation);
  showcase.addEventListener("pointerleave", startRotation);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRotation();
      return;
    }

    startRotation();
  });

  startRotation();
}

async function collectHeroShowcaseFrames(showcase, directory, baseName, extension, startIndex, probeLimit, defaultAlt) {
  const frames = [];

  for (let index = startIndex; index < startIndex + probeLimit; index += 1) {
    const src = `${directory}${baseName}${index}.${extension}`;

    try {
      await preloadHeroShowcaseFrame(src);
      frames.push({
        index,
        src,
        caption: getHeroShowcaseCaption(showcase, index, defaultAlt),
        alt: defaultAlt
      });
    } catch (error) {
      if (frames.length) {
        break;
      }
    }
  }

  return frames;
}

function getHeroShowcaseCaption(showcase, index, fallbackCaption) {
  return showcase.getAttribute(`data-show-caption-${index}`) || fallbackCaption;
}

function syncHeroShowcaseFrame({ image, caption, frame }) {
  image.src = frame.src;
  image.alt = frame.alt;

  if (caption && frame.caption) {
    caption.textContent = frame.caption;
  }
}

function preloadHeroShowcaseFrame(src) {
  return new Promise((resolve, reject) => {
    const probe = new Image();
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out while loading ${src}.`));
    }, 4500);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      probe.onload = null;
      probe.onerror = null;
    };

    probe.onload = () => {
      cleanup();
      resolve(probe);
    };

    probe.onerror = () => {
      cleanup();
      reject(new Error(`Unable to load ${src}.`));
    };

    probe.src = src;
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
