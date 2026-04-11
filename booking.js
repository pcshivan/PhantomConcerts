document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");

  if (!form) {
    return;
  }

  const FORM_ENDPOINT = "https://formspree.io/f/xldnnovk";
  const ROUTING_EMAIL = "info@phantomconcerts.in";
  const STORAGE_KEY = "phantom-concerts-booking-draft-v1";
  const SUBMIT_BUTTON_LABEL = "Send Booking Brief";
  let internalEstimate = 0;

  const catalog = {
    experience: {
      "flagship-arena": {
        label: "Institutional Flagship",
        price: 180000,
        summary:
          "Flagship live AI + musical spectacle for IITs, universities, cultural institutions, and landmark academic gatherings."
      },
      "touring-theater": {
        label: "Corporate Experience",
        price: 95000,
        summary:
          "Premium live edition for corporate innovation forums, leadership summits, executive showcases, and flagship business gatherings."
      },
      "global-iconic": {
        label: "Global Iconic Edition",
        price: 750000,
        summary:
          "A no-compromise global edition for celebrities, conglomerates, sovereign platforms, cultural icons, and flagship hosts who expect the absolute highest production standard."
      },
      "hybrid-broadcast": {
        label: "Global Iconic Edition",
        price: 750000,
        summary:
          "Legacy alias for the Global Iconic Edition, preserved for older links and saved briefs."
      }
    },
    audience: {
      "up-to-1000": {
        label: "Up to 1,000 guests",
        price: 0,
        summary: "Designed for private institutional showcases, premium corporate rooms, and focused audience experiences."
      },
      "1000-5000": {
        label: "1,000 to 5,000 guests",
        price: 20000,
        summary: "A scalable audience footprint for campuses, conferences, corporate forums, and public knowledge-led showcases."
      },
      "5000-15000": {
        label: "5,000 to 15,000 guests",
        price: 55000,
        summary: "Structured for flagship institutional showcases, major public experiences, and large-format corporate spectacles."
      },
      "15000-plus": {
        label: "15,000+ guests",
        price: 110000,
        summary: "Mass-scale audience planning for destination launches, major forums, and amplified public-private showcase moments."
      }
    },
    region: {
      "asia-pacific": {
        label: "Asia Pacific",
        price: 15000,
        summary: "Best for the India debut path, Southeast Asia, and wider APAC venue adaptation."
      },
      "europe-middle-east": {
        label: "Europe and Middle East",
        price: 28000,
        summary: "Covers destination venues, international audiences, and more complex localization planning."
      },
      "north-america": {
        label: "North America",
        price: 32000,
        summary: "Supports theater runs, prestige branded experiences, and icon-led launch cycles across major North American markets."
      },
      "multi-city-global": {
        label: "Multi-city global rollout",
        price: 70000,
        summary: "Built for elite repeatability, transfer packs, touring command, and cross-market operational coordination."
      }
    },
    language: {
      english: {
        label: "English-led",
        price: 0,
        summary: "A clean global default for hosting, communication, and broadcast-ready messaging."
      },
      bilingual: {
        label: "Bilingual",
        price: 8000,
        summary: "Adds a second language layer for local relevance, sponsor-facing moments, or venue context."
      },
      multilingual: {
        label: "Multilingual",
        price: 18000,
        summary: "Supports broader localization and audience interaction across markets."
      }
    },
    timeline: {
      "12-plus-weeks": {
        label: "12+ weeks",
        price: 0,
        summary: "The preferred runway for custom creative, rehearsal depth, and venue coordination."
      },
      "6-12-weeks": {
        label: "6 to 12 weeks",
        price: 15000,
        summary: "Accelerated but workable for strong production alignment and faster approvals."
      },
      "4-6-weeks": {
        label: "4 to 6 weeks",
        price: 30000,
        summary: "Rush delivery with compressed timelines, faster iteration cycles, and tighter coordination."
      }
    },
    modules: {
      "visual-worlds": {
        label: "Generative visual worlds",
        price: 18000,
        summary: "Reactive scenes, cinematic transitions, and AI visual logic."
      },
      "spatial-audio": {
        label: "Spatial audio direction",
        price: 24000,
        summary: "Deliberate sound placement, movement, and immersion mapping."
      },
      "ai-host": {
        label: "AI host and voice moments",
        price: 12000,
        summary: "Voice-led transitions, multilingual narration, and conversational staging."
      },
      "audience-interaction": {
        label: "Audience interaction design",
        price: 15000,
        summary: "Crowd-responsive prompts, audience cues, and digital participation layers."
      },
      "live-broadcast": {
        label: "Live broadcast system",
        price: 28000,
        summary: "Broadcast capture, prestige stream scenes, and global audience narrative control."
      },
      "ticketing-ops": {
        label: "Ticketing and access planning",
        price: 14000,
        summary: "Planning support for payments, ticketing platforms, and access control."
      },
      "vip-merch": {
        label: "VIP and merch programming",
        price: 45000,
        summary: "A-list hospitality, collector-grade merchandise, concierge gifting, and prestige guest programming."
      }
    }
  };

  const nodes = {
    title: document.getElementById("summary-title"),
    subtitle: document.getElementById("summary-subtitle"),
    list: document.getElementById("summary-list"),
    regionChip: document.getElementById("summary-region-chip"),
    languageChip: document.getElementById("summary-language-chip"),
    timelineChip: document.getElementById("summary-timeline-chip"),
    status: document.getElementById("brief-status"),
    send: document.getElementById("email-brief"),
    download: document.getElementById("download-brief"),
    copy: document.getElementById("copy-brief"),
    share: document.getElementById("share-config")
  };

  form.setAttribute("action", FORM_ENDPOINT);
  setDateFieldFloor();
  hydrateFromQuery();
  hydrateFromStorage();
  render();

  form.addEventListener("change", () => {
    persistSelectionState();
    render();
  });

  form.addEventListener("input", render);

  form.addEventListener("submit", async (event) => {
    trimProjectDetails();
    syncSubmissionMetadata(true);

    if (typeof window.fetch !== "function") {
      return;
    }

    event.preventDefault();

    const isValid =
      typeof form.reportValidity === "function" ? form.reportValidity() : form.checkValidity();

    if (!isValid) {
      setStatus("Complete the required intake details before sending the booking brief.", "error");
      return;
    }

    setSubmissionState(true);
    setStatus("Sending your Phantom Concerts booking brief through the official intake channel...", "info");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        let message = "We could not send the booking brief right now. Please try again in a moment.";

        try {
          const errorData = await response.json();

          if (Array.isArray(errorData.errors) && errorData.errors.length) {
            message = errorData.errors.map((error) => error.message).join(" ");
          }
        } catch (error) {
          console.error("Unable to parse booking intake error response.", error);
        }

        throw new Error(message);
      }

      setStatus(
        "Your Phantom Concerts booking brief has been sent successfully. Our team will review the full configuration and contact you shortly.",
        "success"
      );
    } catch (error) {
      console.error("Booking brief submission failed.", error);
      setStatus(
        error instanceof Error && error.message
          ? error.message
          : "An unexpected error occurred while sending the booking brief.",
        "error"
      );
    } finally {
      setSubmissionState(false);
      syncSubmissionMetadata();
    }
  });

  nodes.download.addEventListener("click", () => {
    const blob = new Blob([buildBriefText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${buildFileSlug()}-phantom-concerts-brief.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Booking brief downloaded.", "success");
  });

  nodes.copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildBriefText());
      setStatus("Booking brief copied to your clipboard.", "success");
    } catch (error) {
      setStatus("Clipboard access is unavailable here. Use Download Brief instead.", "warn");
    }
  });

  nodes.share.addEventListener("click", async () => {
    const shareUrl = buildShareUrl();
    const shareData = {
      title: "Phantom Concerts configuration",
      text: `${nodes.title.textContent} | Continue the Phantom Concerts configuration`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setStatus("Configuration shared.", "success");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setStatus("Share link copied to your clipboard.", "success");
    } catch (error) {
      setStatus("Share was cancelled or unavailable. The configuration remains saved locally.", "warn");
    }
  });

  function getSingleValue(name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : "";
  }

  function getMultiValues(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
  }

  function getState() {
    return {
      experience: getSingleValue("experience"),
      audience: getSingleValue("audience"),
      region: getSingleValue("region"),
      language: getSingleValue("language"),
      timeline: getSingleValue("timeline"),
      modules: getMultiValues("modules")
    };
  }

  function getProjectDetails() {
    const data = new FormData(form);
    return {
      clientName: String(data.get("clientName") || "").trim(),
      companyName: String(data.get("companyName") || "").trim(),
      emailAddress: String(data.get("emailAddress") || "").trim(),
      phoneNumber: String(data.get("phoneNumber") || "").trim(),
      eventCity: String(data.get("eventCity") || "").trim(),
      eventDate: String(data.get("eventDate") || "").trim(),
      notes: String(data.get("notes") || "").trim()
    };
  }

  function getModuleLabels(state) {
    return state.modules.map((module) => catalog.modules[module].label);
  }

  function getMissingRequiredProjectFields(project = getProjectDetails()) {
    const requiredFields = [
      ["clientName", "your name"],
      ["companyName", "institution or venue"],
      ["emailAddress", "email"],
      ["phoneNumber", "phone or WhatsApp"],
      ["eventCity", "target city"],
      ["eventDate", "target date"]
    ];

    return requiredFields
      .filter(([key]) => !project[key])
      .map(([, label]) => label);
  }

  function calculateEstimate() {
    const state = getState();
    const moduleTotal = state.modules.reduce((sum, key) => sum + catalog.modules[key].price, 0);
    return (
      catalog.experience[state.experience].price +
      catalog.audience[state.audience].price +
      catalog.region[state.region].price +
      catalog.language[state.language].price +
      catalog.timeline[state.timeline].price +
      moduleTotal
    );
  }

  function render() {
    const state = getState();
    const shareUrl = buildShareUrl(false);
    const project = getProjectDetails();
    const missingFields = getMissingRequiredProjectFields(project);

    internalEstimate = calculateEstimate();
    nodes.title.textContent = catalog.experience[state.experience].label;
    nodes.subtitle.textContent = `${catalog.audience[state.audience].label} in ${catalog.region[state.region].label}. Commercial terms are aligned after official intake confirmation.`;
    nodes.regionChip.textContent = catalog.region[state.region].label;
    nodes.languageChip.textContent = catalog.language[state.language].label;
    nodes.timelineChip.textContent = catalog.timeline[state.timeline].label;

    const items = [
      catalog.experience[state.experience].summary,
      catalog.audience[state.audience].summary,
      catalog.region[state.region].summary,
      catalog.language[state.language].summary,
      catalog.timeline[state.timeline].summary,
      ...state.modules.map((module) => catalog.modules[module].summary)
    ];

    nodes.list.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

    if (!missingFields.length) {
      setStatus(
        `Brief is intake-ready for ${project.companyName || project.clientName}${project.eventCity ? ` in ${project.eventCity}` : ""}.`,
        "success"
      );
    } else {
      setStatus(`Add ${formatFieldList(missingFields)} to send the official booking brief.`, "warn");
    }

    syncSubmissionMetadata();
    history.replaceState({}, "", shareUrl);
  }

  function buildBriefText() {
    const state = getState();
    const project = getProjectDetails();
    const moduleLabels = getModuleLabels(state);
    const modules = moduleLabels.length ? moduleLabels.join(", ") : "No extra modules selected";

    return [
      "Phantom Concerts Booking Brief",
      "",
      "Submission Source",
      `Booking page: ${window.location.href}`,
      `Shareable configuration: ${buildShareUrl(false)}`,
      `Routing email: ${ROUTING_EMAIL}`,
      "",
      "Project Contact",
      `Name: ${project.clientName || "Not provided"}`,
      `Institution or venue: ${project.companyName || "Not provided"}`,
      `Email: ${project.emailAddress || "Not provided"}`,
      `Phone or WhatsApp: ${project.phoneNumber || "Not provided"}`,
      `Target city: ${project.eventCity || "Not provided"}`,
      `Target date: ${project.eventDate || "Not provided"}`,
      "",
      "Configured Experience",
      `Concert format: ${catalog.experience[state.experience].label}`,
      `Audience scale: ${catalog.audience[state.audience].label}`,
      `Region: ${catalog.region[state.region].label}`,
      `Language setup: ${catalog.language[state.language].label}`,
      `Delivery pace: ${catalog.timeline[state.timeline].label}`,
      `AI and production modules: ${modules}`,
      "",
      "Scope Summary",
      `${catalog.experience[state.experience].summary}`,
      `${catalog.audience[state.audience].summary}`,
      `${catalog.region[state.region].summary}`,
      `${catalog.language[state.language].summary}`,
      `${catalog.timeline[state.timeline].summary}`,
      ...state.modules.map((module) => `${catalog.modules[module].label}: ${catalog.modules[module].summary}`),
      "",
      "Operational Note",
      "Ticketing, payments, access control, CRM routing, and venue-side integrations are aligned during onboarding based on the confirmed show stack and venue requirements.",
      "",
      "Additional Notes",
      `${project.notes || "None provided."}`
    ].join("\n");
  }

  function buildEmailSubject() {
    const state = getState();
    const project = getProjectDetails();
    const city = project.eventCity || "Global";
    return `New Phantom Concerts Booking Request | ${catalog.experience[state.experience].label} | ${city}`;
  }

  function buildShareUrl(pushToHistory = true) {
    const state = getState();
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    params.set("experience", state.experience);
    params.set("audience", state.audience);
    params.set("region", state.region);
    params.set("language", state.language);
    params.set("timeline", state.timeline);

    if (state.modules.length) {
      params.set("modules", state.modules.join(","));
    }

    url.search = params.toString();

    if (pushToHistory) {
      history.replaceState({}, "", url.toString());
    }

    return url.toString();
  }

  function hydrateFromQuery() {
    const params = new URLSearchParams(window.location.search);

    applySingle("experience", normalizeExperienceValue(params.get("experience")));
    applySingle("audience", params.get("audience"));
    applySingle("region", params.get("region"));
    applySingle("language", params.get("language"));
    applySingle("timeline", params.get("timeline"));

    const moduleParam = params.get("modules");
    if (moduleParam) {
      form.querySelectorAll('input[name="modules"]').forEach((input) => {
        input.checked = moduleParam.split(",").includes(input.value);
      });
    }
  }

  function hydrateFromStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const draft = JSON.parse(raw);

      if (window.location.search) {
        return;
      }

      applySingle("experience", normalizeExperienceValue(draft.experience));
      applySingle("audience", draft.audience);
      applySingle("region", draft.region);
      applySingle("language", draft.language);
      applySingle("timeline", draft.timeline);

      if (Array.isArray(draft.modules)) {
        form.querySelectorAll('input[name="modules"]').forEach((input) => {
          input.checked = draft.modules.includes(input.value);
        });
      }
    } catch (error) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  function persistSelectionState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
    } catch (error) {
      setStatus("Selections could not be saved locally in this browser.", "warn");
    }
  }

  function applySingle(name, value) {
    if (!value) {
      return;
    }

    const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) {
      input.checked = true;
    }
  }

  function normalizeExperienceValue(value) {
    if (value === "hybrid-broadcast") {
      return "global-iconic";
    }

    return value;
  }

  function trimProjectDetails() {
    [
      "clientName",
      "companyName",
      "emailAddress",
      "phoneNumber",
      "eventCity",
      "notes"
    ].forEach((fieldName) => {
      const field = form.elements.namedItem(fieldName);

      if (field && "value" in field && typeof field.value === "string") {
        field.value = field.value.trim();
      }
    });
  }

  function setDateFieldFloor() {
    const dateField = form.elements.namedItem("eventDate");

    if (!dateField || !("min" in dateField)) {
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    dateField.min = `${year}-${month}-${day}`;
  }

  function setFormFieldValue(fieldName, fieldValue) {
    let field = form.elements.namedItem(fieldName);

    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = fieldName;
      form.prepend(field);
    }

    if (field && "value" in field) {
      field.value = fieldValue;
    }
  }

  function syncSubmissionMetadata(stampSubmission = false) {
    const state = getState();
    const project = getProjectDetails();
    const moduleLabels = getModuleLabels(state);
    const experienceLabel = catalog.experience[state.experience].label;
    const briefText = buildBriefText();

    setFormFieldValue("_replyto", project.emailAddress);
    setFormFieldValue("_subject", buildEmailSubject());
    setFormFieldValue("page_title", document.title);
    setFormFieldValue("page_url", window.location.href);
    setFormFieldValue("booking_source", "Phantom Concerts Booking Configurator");
    setFormFieldValue("share_url", buildShareUrl(false));
    setFormFieldValue("brief_title", nodes.title.textContent || experienceLabel);
    setFormFieldValue("brief_subtitle", nodes.subtitle.textContent || "");
    setFormFieldValue("experience_label", experienceLabel);
    setFormFieldValue("audience_label", catalog.audience[state.audience].label);
    setFormFieldValue("region_label", catalog.region[state.region].label);
    setFormFieldValue("language_label", catalog.language[state.language].label);
    setFormFieldValue("timeline_label", catalog.timeline[state.timeline].label);
    setFormFieldValue("modules_selected", moduleLabels.length ? moduleLabels.join(", ") : "No extra modules selected");
    setFormFieldValue("modules_count", String(state.modules.length));
    setFormFieldValue("booking_brief", briefText);

    // Canonical aliases matching the main Phantom City Studios contact intake.
    setFormFieldValue("name", project.clientName);
    setFormFieldValue("email", project.emailAddress);
    setFormFieldValue("mobile", project.phoneNumber);
    setFormFieldValue("service_interest", `Phantom Concerts Booking - ${experienceLabel}`);
    setFormFieldValue("details", briefText);

    // Human-readable booking-specific aliases for the intake email body.
    setFormFieldValue("institution_or_venue", project.companyName);
    setFormFieldValue("target_city", project.eventCity);
    setFormFieldValue("target_date", project.eventDate);
    setFormFieldValue("additional_notes", project.notes || "None provided.");
    setFormFieldValue("concert_format", experienceLabel);
    setFormFieldValue("audience_scale", catalog.audience[state.audience].label);
    setFormFieldValue("geography", catalog.region[state.region].label);
    setFormFieldValue("language_setup", catalog.language[state.language].label);
    setFormFieldValue("delivery_pace", catalog.timeline[state.timeline].label);

    if (stampSubmission) {
      setFormFieldValue("submitted_at", new Date().toISOString());
    }
  }

  function setSubmissionState(isSubmitting) {
    form.setAttribute("aria-busy", String(isSubmitting));

    if (nodes.send) {
      nodes.send.disabled = isSubmitting;
      nodes.send.textContent = isSubmitting ? "Sending..." : SUBMIT_BUTTON_LABEL;
    }
  }

  function buildFileSlug() {
    const project = getProjectDetails();
    const preferred = project.companyName || project.eventCity || "phantom-concerts";
    return preferred
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatFieldList(fields) {
    if (fields.length === 1) {
      return fields[0];
    }

    if (fields.length === 2) {
      return `${fields[0]} and ${fields[1]}`;
    }

    return `${fields.slice(0, -1).join(", ")}, and ${fields[fields.length - 1]}`;
  }

  function setStatus(message, tone) {
    if (!nodes.status) {
      return;
    }

    nodes.status.textContent = message;
    nodes.status.classList.remove("is-success", "is-warn", "is-info", "is-error");

    if (tone === "success") {
      nodes.status.classList.add("is-success");
    } else if (tone === "warn") {
      nodes.status.classList.add("is-warn");
    } else if (tone === "info") {
      nodes.status.classList.add("is-info");
    } else if (tone === "error") {
      nodes.status.classList.add("is-error");
    }
  }
});
