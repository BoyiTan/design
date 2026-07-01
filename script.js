/************************************************************
      SMALL INTERACTIONS
      You usually do not need to edit this section.
    ************************************************************/

    // Adds a frosted background to the nav after scrolling.
    const siteNav = document.getElementById("siteNav");
    window.addEventListener(
      "scroll",
      () => {
        siteNav.classList.toggle("is-pinned", window.scrollY > 20);
      },
      { passive: true }
    );

    // Hero title word-by-word reveal.
    // To disable: delete this block and remove .hero-title .word CSS.
    const heroTitle = document.getElementById("heroTitle");
    const heroWords = heroTitle.innerText.trim().split(/\s+/);
    heroTitle.innerHTML = heroWords
      .map((word, index) => {
        const delay = 0.18 + index * 0.055;
        return `<span class="word" style="animation-delay:${delay}s">${word}</span>`;
      })
      .join(" ");

    // Scroll reveal for cards and divider.
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".project-card, .divider").forEach((element) => {
      revealObserver.observe(element);
    });
