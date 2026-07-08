(function () {
  const selectors = [
    ".media img",
    ".artfac-image-shot img",
    ".artfac-take-visual img",
    ".artfac-cast-avatar img",
    ".film-frame-img",
    'img[src*="assets/kindness-quest/"]'
  ];

  let overlay;
  let overlayImage;
  let overlayCaption;
  let closeButton;
  let lastFocus;

  function makeOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "portfolio-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image preview");
    overlay.innerHTML = [
      '<button class="portfolio-lightbox-close" type="button" aria-label="Close image preview">&times;</button>',
      '<figure class="portfolio-lightbox-figure">',
      '<img alt="">',
      '<figcaption></figcaption>',
      '</figure>'
    ].join("");

    document.body.appendChild(overlay);
    closeButton = overlay.querySelector(".portfolio-lightbox-close");
    overlayImage = overlay.querySelector("img");
    overlayCaption = overlay.querySelector("figcaption");

    closeButton.addEventListener("click", closeOverlay);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeOverlay();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) closeOverlay();
    });

    return overlay;
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("portfolio-lightbox-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus({ preventScroll: true });
  }

  function openOverlay(img) {
    const src = img.currentSrc || img.src;
    if (!src) return;
    makeOverlay();
    lastFocus = document.activeElement;
    overlayImage.src = src;
    overlayImage.alt = img.alt || "";
    overlayCaption.textContent = img.alt || img.closest("[data-cursor]")?.getAttribute("data-cursor") || "Portfolio image";
    document.body.classList.add("portfolio-lightbox-open");
    overlay.classList.add("is-open");
    closeButton.focus({ preventScroll: true });
  }

  function isEligible(img) {
    if (!img || img.dataset.caseLightbox === "true") return false;
    if (img.closest("nav, footer, a, button, .portfolio-nav, .next-scene-card, [data-no-lightbox]")) return false;
    return Boolean(img.closest("main, x-dc, [data-screen-label], [data-helm-case-root]"));
  }

  function enhanceImage(img) {
    if (!isEligible(img)) return;
    img.dataset.caseLightbox = "true";
    img.classList.add("portfolio-lightbox-target");

    const frame = img.closest(".media, .artfac-image-shot, .artfac-take-visual, .artfac-cast-avatar, [data-cursor]") || img.parentElement;
    if (!frame || frame.dataset.caseLightboxFrame === "true") return;

    frame.dataset.caseLightboxFrame = "true";
    frame.setAttribute("tabindex", "0");
    frame.setAttribute("role", "button");
    frame.setAttribute("aria-label", "Open larger image preview");
    frame.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openOverlay(img);
    });
    frame.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openOverlay(img);
    });
  }

  function enhanceAll() {
    document.querySelectorAll(selectors.join(",")).forEach(enhanceImage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceAll);
  } else {
    enhanceAll();
  }

  let runs = 0;
  const timer = window.setInterval(() => {
    runs += 1;
    enhanceAll();
    if (runs > 30) window.clearInterval(timer);
  }, 300);
})();
