import { escapeHtml } from "./seo-utils.mjs";
import { allowedAnimatedListStyles, getPageTone } from "./cms-utils.mjs";

// Accent colour per CMS tone, as "r, g, b" for use in rgba().
const TONE_RGB = {
  violet: { dark: "167, 139, 250", light: "109, 40, 217" },
  gold: { dark: "251, 191, 36", light: "180, 83, 9" },
  blue: { dark: "56, 189, 248", light: "3, 105, 161" },
  emerald: { dark: "52, 211, 153", light: "4, 120, 87" },
  rose: { dark: "251, 113, 133", light: "190, 18, 60" },
  slate: { dark: "148, 163, 184", light: "71, 85, 105" },
};

const toneStyle = (tone) => {
  const rgb = TONE_RGB[tone] ?? TONE_RGB.violet;
  return `--tone-dark: ${rgb.dark}; --tone-light: ${rgb.light};`;
};

const icons = {
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  arrowUp: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  arrowLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>',
  arrowRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
};

const actionIcon = (href) => {
  if (href.startsWith("mailto:")) return icons.mail;
  if (/cal\.com|calendly|calendar/i.test(href)) return icons.calendar;
  if (href === "/" || href.startsWith("/#")) return icons.arrowLeft;
  return icons.arrowRight;
};

const renderActions = (actions = [], className = "actions") => {
  if (!actions.length) return "";

  return `<div class="${className}">${actions
    .map((action) => {
      const variant = action.variant === "secondary" ? "secondary" : "primary";
      return `<a class="btn btn-${variant}" href="${escapeHtml(action.href)}">${actionIcon(action.href)}<span>${escapeHtml(action.label)}</span></a>`;
    })
    .join("")}</div>`;
};

const renderBadges = (badges = []) => {
  if (!badges.length) return "";
  return `<ul class="badges">${badges.map((badge) => `<li class="badge">${escapeHtml(badge)}</li>`).join("")}</ul>`;
};

const renderParagraphs = (paragraphs = [], className = "prose") => {
  if (!paragraphs.length) return "";
  return `<div class="${className}">${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}</div>`;
};

const renderAnimatedParagraphs = (paragraphs = []) => {
  if (!paragraphs.length) return "";
  return `<div class="stack">${paragraphs
    .map((p, i) => `<p class="stack-item reveal" style="--d:${i * 70}ms">${escapeHtml(p)}</p>`)
    .join("")}</div>`;
};

const renderItems = (section) => {
  if (!section.items?.length) return "";

  if (section.itemsStyle === "list") {
    return `<ul class="checklist">${section.items
      .map((item) => `<li><span class="check">${icons.check}</span><span>${escapeHtml(item)}</span></li>`)
      .join("")}</ul>`;
  }

  return `<ul class="chips">${section.items.map((item) => `<li class="chip">${escapeHtml(item)}</li>`).join("")}</ul>`;
};

const renderAnimatedList = (section) => {
  if (!section.animatedList?.length) return "";

  const style = allowedAnimatedListStyles.has(section.animatedListStyle) ? section.animatedListStyle : "list";

  if (style === "chips") {
    return `<ul class="chips">${section.animatedList
      .map((item, i) => `<li class="chip reveal" style="--d:${i * 50}ms">${escapeHtml(item)}</li>`)
      .join("")}</ul>`;
  }

  if (style === "cards") {
    return `<ol class="steps">${section.animatedList
      .map(
        (item, i) =>
          `<li class="step reveal" style="--d:${i * 80}ms"><span class="step-num">${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(item)}</p></li>`,
      )
      .join("")}</ol>`;
  }

  return `<ul class="bullets">${section.animatedList
    .map((item, i) => `<li class="reveal" style="--d:${i * 60}ms">${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
};

const renderCards = (cards = []) => {
  if (!cards.length) return "";
  return `<div class="cards">${cards
    .map(
      (card, i) => `
            <article class="card spotlight reveal" style="--d:${i * 90}ms">
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(card.description)}</p>
            </article>`,
    )
    .join("")}</div>`;
};

const renderSection = (section, index, pageTone) => {
  const tone = section.tone ? getPageTone(section) : pageTone;
  const id = `section-${index + 1}`;

  return `
        <section class="section panel spotlight reveal" id="${id}" style="${toneStyle(tone)}" aria-labelledby="${id}-title">
          <div class="section-head">
            <span class="section-index">${String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2 id="${id}-title">${escapeHtml(section.heading)}</h2>
              ${section.description ? `<p class="section-intro">${escapeHtml(section.description)}</p>` : ""}
            </div>
          </div>
          <div class="section-body">
            ${section.body ? `<p class="prose-p">${escapeHtml(section.body)}</p>` : ""}
            ${renderParagraphs(section.paragraphs)}
            ${renderBadges(section.badges)}
            ${renderAnimatedParagraphs(section.animatedParagraphs)}
            ${renderCards(section.cards)}
            ${renderItems(section)}
            ${renderAnimatedList(section)}
            ${renderActions(section.ctas ?? (section.cta ? [section.cta] : []))}
          </div>
        </section>`;
};

const HEAD_EXTRAS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" />
    <script>
      (() => {
        const theme = window.localStorage.getItem("interactive-cv-theme") === "light" ? "light" : "dark";
        const root = document.documentElement;
        root.dataset.theme = theme;
        root.classList.add("theme-" + theme, "js");
      })();
    </script>
  </head>`;

export const withStaticPageHeadExtras = (head) => head.replace("</head>", HEAD_EXTRAS.trimStart());

export function renderStaticPageBody({ staticPage, seo, enabledStaticPages, attributionUrl, attributionText }) {
  const pageTone = getPageTone(staticPage);
  const siteName = seo.site?.name ?? "";
  const ownerName = seo.site?.author ?? siteName;
  const initials = ownerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const sections = staticPage.sections ?? [];
  const navLinks = enabledStaticPages
    .map((page) => {
      const current = page.path === staticPage.path;
      return `<a class="nav-link" href="${escapeHtml(page.path)}"${current ? ' aria-current="page"' : ""}>${escapeHtml(page.navLabel)}</a>`;
    })
    .join("");

  const toc = sections.length > 2
    ? `<nav class="toc panel reveal" aria-label="On this page">
          <p class="label">On this page</p>
          <ol>${sections
            .map(
              (section, i) =>
                `<li><a href="#section-${i + 1}" data-toc="section-${i + 1}"><span>${String(i + 1).padStart(2, "0")}</span>${escapeHtml(section.heading)}</a></li>`,
            )
            .join("")}</ol>
        </nav>`
    : "";

  const heroActions = renderActions(staticPage.ctas ?? (staticPage.cta ? [staticPage.cta] : []), "actions hero-actions");

  return `
  <body class="theme-dark" style="${toneStyle(pageTone)}">
    <div class="scroll-progress" aria-hidden="true"></div>
    <div class="site-bg" aria-hidden="true">
      <div class="blob blob-a"></div>
      <div class="blob blob-b"></div>
      <div class="blob blob-c"></div>
    </div>

    <header class="topbar">
      <div class="nav-shell">
        <a class="brand" href="/">
          <span class="monogram" aria-hidden="true">${escapeHtml(initials)}</span>
          <span class="brand-text">
            <strong>${escapeHtml(ownerName)}</strong>
            <small>Back to interactive CV</small>
          </span>
        </a>
        <nav class="nav-links" aria-label="Pages">
          <a class="nav-link" href="/">Home</a>
          ${navLinks}
        </nav>
        <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch to light mode">
          <span class="icon-sun">${icons.sun}</span>
          <span class="icon-moon">${icons.moon}</span>
        </button>
      </div>
    </header>

    <main class="page">
      <header class="hero">
        <p class="eyebrow reveal">${escapeHtml(siteName)}</p>
        <h1 class="reveal" style="--d:80ms">${escapeHtml(staticPage.h1)}</h1>
        <p class="lead reveal" style="--d:160ms">${escapeHtml(staticPage.lead)}</p>
        <div class="reveal" style="--d:240ms">${heroActions}</div>
        ${
          staticPage.heroNote
            ? `<aside class="note reveal" style="--d:320ms"><span class="note-icon">${icons.info}</span><p>${escapeHtml(staticPage.heroNote)}</p></aside>`
            : ""
        }
      </header>

      <div class="layout${toc ? " has-toc" : ""}">
        ${toc ? `<div class="toc-wrap">${toc}</div>` : ""}
        <div class="sections" aria-label="${escapeHtml(staticPage.navLabel)}">
          ${sections.map((section, i) => renderSection(section, i, pageTone)).join("")}
        </div>
      </div>
    </main>

    <footer class="footer">
      <div>
        <span>© ${new Date().getFullYear()} ${escapeHtml(ownerName)}</span>
        <a href="${escapeHtml(attributionUrl)}">${escapeHtml(attributionText)}</a>
      </div>
    </footer>

    <button class="scroll-top" type="button" data-scroll-top aria-label="Scroll to top">${icons.arrowUp}</button>

    <style>${STATIC_PAGE_CSS}</style>
    <script>${STATIC_PAGE_SCRIPT}</script>
  </body>`;
}

const STATIC_PAGE_SCRIPT = `
      (() => {
        const STORAGE_KEY = "interactive-cv-theme";
        const root = document.documentElement;
        const toggle = document.querySelector("[data-theme-toggle]");
        const scrollTopButton = document.querySelector("[data-scroll-top]");
        const progress = document.querySelector(".scroll-progress");
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let theme = root.classList.contains("theme-light") ? "light" : "dark";

        const applyTheme = () => {
          root.dataset.theme = theme;
          root.classList.toggle("theme-light", theme === "light");
          root.classList.toggle("theme-dark", theme === "dark");
          document.body.classList.toggle("theme-light", theme === "light");
          document.body.classList.toggle("theme-dark", theme === "dark");
          toggle?.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
        };

        applyTheme();
        toggle?.addEventListener("click", () => {
          theme = theme === "dark" ? "light" : "dark";
          try { window.localStorage.setItem(STORAGE_KEY, theme); } catch {}
          applyTheme();
        });

        // Reveal on scroll
        const revealEls = document.querySelectorAll(".reveal");
        if ("IntersectionObserver" in window && !reduceMotion) {
          const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
              }
            });
          }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
          revealEls.forEach((el) => obs.observe(el));
        } else {
          revealEls.forEach((el) => el.classList.add("is-visible"));
        }

        // Pointer spotlight
        document.querySelectorAll(".spotlight").forEach((el) => {
          el.addEventListener("pointermove", (event) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty("--mx", event.clientX - rect.left + "px");
            el.style.setProperty("--my", event.clientY - rect.top + "px");
          });
        });

        // Scroll progress, scroll-top button and table of contents
        const tocLinks = Array.from(document.querySelectorAll("[data-toc]"));
        let frame = 0;
        const onScroll = () => {
          frame = 0;
          const max = document.documentElement.scrollHeight - window.innerHeight;
          progress?.style.setProperty("--progress", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
          scrollTopButton?.classList.toggle("is-visible", window.scrollY > 240);

          let current = null;
          tocLinks.forEach((link) => {
            const target = document.getElementById(link.dataset.toc);
            if (target && target.getBoundingClientRect().top <= window.innerHeight * 0.35) current = link;
          });
          tocLinks.forEach((link) => link.toggleAttribute("aria-current", link === current));
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(onScroll); };
        onScroll();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);

        scrollTopButton?.addEventListener("click", () => {
          window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        });
      })();
    `;

const STATIC_PAGE_CSS = `
      :root {
        color-scheme: dark;
        --bg: #07080f;
        --bg-elev: #0d0f1a;
        --surface: rgba(255, 255, 255, 0.035);
        --surface-2: rgba(255, 255, 255, 0.06);
        --line: rgba(255, 255, 255, 0.08);
        --line-strong: rgba(255, 255, 255, 0.16);
        --fg: #f3f4fb;
        --muted: #a4a9c6;
        --subtle: #6d7294;
        --accent: #a78bfa;
        --accent-solid: #7c3aed;
        --grad: linear-gradient(115deg, #a78bfa 0%, #818cf8 35%, #22d3ee 100%);
        --grad-strong: linear-gradient(115deg, #7c3aed 0%, #4f46e5 45%, #0891b2 100%);
        --blob-a: rgba(124, 58, 237, 0.38);
        --blob-b: rgba(34, 211, 238, 0.24);
        --blob-c: rgba(244, 114, 182, 0.2);
        --grid-line: rgba(255, 255, 255, 0.05);
        --shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.7);
        --spot: rgba(167, 139, 250, 0.12);
        --nav-bg: rgba(10, 11, 20, 0.62);
        --tone: var(--tone-dark, 167, 139, 250);
        --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        --font-display: "Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif;
      }

      html.theme-light {
        color-scheme: light;
        --bg: #f5f6fb;
        --bg-elev: #ffffff;
        --surface: rgba(255, 255, 255, 0.72);
        --surface-2: rgba(255, 255, 255, 0.95);
        --line: rgba(15, 23, 42, 0.09);
        --line-strong: rgba(15, 23, 42, 0.18);
        --fg: #0c1024;
        --muted: #4b5275;
        --subtle: #7b819f;
        --accent: #6d28d9;
        --accent-solid: #6d28d9;
        --grad: linear-gradient(115deg, #6d28d9 0%, #4f46e5 45%, #0891b2 100%);
        --grad-strong: linear-gradient(115deg, #6d28d9 0%, #4f46e5 45%, #0891b2 100%);
        --blob-a: rgba(139, 92, 246, 0.22);
        --blob-b: rgba(34, 211, 238, 0.18);
        --blob-c: rgba(244, 114, 182, 0.14);
        --grid-line: rgba(15, 23, 42, 0.05);
        --shadow: 0 24px 50px -28px rgba(30, 27, 75, 0.28);
        --spot: rgba(109, 40, 217, 0.07);
        --nav-bg: rgba(255, 255, 255, 0.72);
      }

      html.theme-light body,
      html.theme-light .section { --tone: var(--tone-light, 109, 40, 217); }
      body,
      .section { --tone: var(--tone-dark, 167, 139, 250); }

      *, *::before, *::after { box-sizing: border-box; }

      html {
        background: var(--bg);
        color: var(--fg);
        scroll-behavior: smooth;
        scroll-padding-top: 6rem;
      }

      body {
        position: relative;
        isolation: isolate;
        margin: 0;
        min-height: 100vh;
        font-family: var(--font-sans);
        font-size: 16px;
        line-height: 1.6;
        color: var(--fg);
        -webkit-font-smoothing: antialiased;
      }

      a { color: inherit; }
      ::selection { background: color-mix(in srgb, var(--accent) 35%, transparent); }
      :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 10px; }

      /* Background */
      .site-bg { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
      .site-bg::after {
        content: ""; position: absolute; inset: 0;
        background-image: linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%);
      }
      .blob { position: absolute; width: 46vmax; height: 46vmax; border-radius: 9999px; filter: blur(90px); will-change: transform; }
      .blob-a { top: -18vmax; left: -10vmax; background: var(--blob-a); animation: drift 26s ease-in-out infinite alternate; }
      .blob-b { top: 10vmax; right: -16vmax; background: var(--blob-b); animation: drift 32s ease-in-out -8s infinite alternate-reverse; }
      .blob-c { bottom: -22vmax; left: 25vw; background: var(--blob-c); animation: drift 38s ease-in-out -14s infinite alternate; }
      @keyframes drift {
        0% { transform: translate3d(0, 0, 0) scale(1); }
        33% { transform: translate3d(8vw, 6vh, 0) scale(1.08); }
        66% { transform: translate3d(-6vw, 10vh, 0) scale(0.94); }
        100% { transform: translate3d(4vw, -4vh, 0) scale(1.04); }
      }

      .scroll-progress {
        position: fixed; top: 0; left: 0; right: 0; z-index: 70; height: 3px;
        background: var(--grad); transform-origin: 0 50%; transform: scaleX(var(--progress, 0));
      }

      /* Nav */
      .topbar { position: sticky; top: 0; z-index: 50; padding: 0.75rem 0.75rem 0; }
      .nav-shell {
        max-width: 72rem; margin: 0 auto; min-height: 4rem;
        display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
        padding: 0.5rem 0.5rem 0.5rem 0.9rem; border-radius: 1rem;
        border: 1px solid var(--line); background: var(--nav-bg);
        backdrop-filter: blur(18px) saturate(140%); -webkit-backdrop-filter: blur(18px) saturate(140%);
        box-shadow: var(--shadow);
      }
      .brand { display: flex; align-items: center; gap: 0.75rem; min-width: 0; text-decoration: none; }
      .monogram {
        display: grid; place-items: center; flex-shrink: 0; width: 2.25rem; height: 2.25rem; border-radius: 0.75rem;
        background: var(--grad-strong); color: #fff; font: 700 0.75rem/1 var(--font-display);
      }
      .brand-text { display: grid; min-width: 0; line-height: 1.25; }
      .brand-text strong { font: 600 0.9rem/1.3 var(--font-display); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .brand-text small { font-size: 0.75rem; color: var(--subtle); }
      .nav-links { display: flex; align-items: center; gap: 0.25rem; }
      .nav-link {
        padding: 0.45rem 0.85rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 500;
        color: var(--muted); text-decoration: none; transition: color 200ms ease, background-color 200ms ease;
      }
      .nav-link:hover { color: var(--fg); }
      .nav-link[aria-current="page"] { color: var(--fg); background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--line); }

      .icon-btn {
        display: inline-grid; place-items: center; flex-shrink: 0; width: 2.5rem; height: 2.5rem; border-radius: 9999px;
        border: 1px solid var(--line); background: var(--surface-2); color: var(--fg); cursor: pointer;
        transition: transform 200ms ease, border-color 200ms ease;
      }
      .icon-btn:hover { transform: translateY(-1px) rotate(-8deg); border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); }
      .icon-moon, html.theme-light .icon-sun { display: none; }
      html.theme-light .icon-moon { display: inline-flex; }
      .icon-sun { display: inline-flex; }

      /* Page */
      .page { max-width: 72rem; margin: 0 auto; padding: 0 1rem 4rem; }

      .hero { padding: 4.5rem 0 3.5rem; max-width: 50rem; }
      .eyebrow {
        display: inline-flex; align-items: center; gap: 0.6rem; margin: 0;
        font: 600 0.75rem/1 var(--font-display); letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent);
      }
      .eyebrow::before { content: ""; width: 1.75rem; height: 1px; background: var(--grad); }
      h1 {
        margin: 1.25rem 0 0; font: 700 clamp(2.5rem, 7vw, 4.5rem)/1.04 var(--font-display); letter-spacing: -0.03em;
        background: linear-gradient(115deg, var(--fg) 35%, var(--accent) 75%, #22d3ee);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .lead { margin: 1.5rem 0 0; font-size: clamp(1.05rem, 2vw, 1.2rem); line-height: 1.8; color: var(--muted); }

      .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.75rem; }
      .hero-actions { margin-top: 2rem; }
      .btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
        min-height: 2.75rem; padding: 0 1.25rem; border-radius: 9999px;
        font-size: 0.875rem; font-weight: 600; text-decoration: none; white-space: nowrap;
        transition: transform 200ms ease, box-shadow 250ms ease, border-color 200ms ease, background-position 400ms ease;
      }
      .btn-primary {
        color: #fff; background: var(--grad-strong); background-size: 160% 100%;
        box-shadow: 0 12px 30px -12px color-mix(in srgb, var(--accent-solid) 80%, transparent);
      }
      .btn-primary:hover { transform: translateY(-2px); background-position: 100% 0; box-shadow: 0 18px 40px -12px color-mix(in srgb, var(--accent-solid) 90%, transparent); }
      .btn-secondary { color: var(--fg); border: 1px solid var(--line-strong); background: var(--surface-2); backdrop-filter: blur(10px); }
      .btn-secondary:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--accent) 55%, var(--line)); }

      .note {
        display: flex; gap: 0.85rem; align-items: flex-start; margin-top: 2rem; padding: 1rem 1.15rem;
        border-radius: 1rem; border: 1px solid rgba(var(--tone), 0.3); background: rgba(var(--tone), 0.08);
      }
      .note p { margin: 0; font-size: 0.925rem; line-height: 1.7; color: var(--muted); }
      .note-icon { flex-shrink: 0; margin-top: 0.1rem; color: rgb(var(--tone)); }

      /* Layout */
      .layout.has-toc { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; align-items: start; }
      .toc-wrap, .sections { min-width: 0; }
      @media (min-width: 1024px) {
        .layout.has-toc { grid-template-columns: 15.5rem minmax(0, 1fr); gap: 2rem; }
        .toc-wrap { position: sticky; top: 6rem; }
      }
      .sections { display: grid; gap: 1.25rem; }

      .panel {
        position: relative; border: 1px solid var(--line); background: var(--surface); border-radius: 1.25rem;
        backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: var(--shadow);
      }
      .spotlight { isolation: isolate; overflow: hidden; }
      .spotlight::before {
        content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
        background: radial-gradient(420px circle at var(--mx, 50%) var(--my, -20%), var(--spot), transparent 55%);
        opacity: 0; transition: opacity 300ms ease;
      }
      .spotlight:hover::before { opacity: 1; }

      .toc { padding: 1.1rem; }
      .label, .toc .label {
        margin: 0 0 0.6rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--subtle);
      }
      .toc ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.15rem; }
      .toc a {
        display: flex; gap: 0.65rem; padding: 0.5rem 0.6rem; border-radius: 0.65rem;
        font-size: 0.85rem; line-height: 1.4; color: var(--muted); text-decoration: none;
        transition: background-color 200ms ease, color 200ms ease;
      }
      .toc a span { font: 600 0.75rem/1.6 var(--font-display); color: var(--subtle); font-variant-numeric: tabular-nums; }
      .toc a:hover, .toc a[aria-current] { color: var(--fg); background: var(--surface-2); }
      .toc a[aria-current] span { color: var(--accent); }
      @media (max-width: 1023px) {
        .toc ol { display: flex; gap: 0.4rem; overflow-x: auto; scrollbar-width: none; }
        .toc a { white-space: nowrap; border: 1px solid var(--line); border-radius: 9999px; }
      }

      /* Section */
      .section { padding: 1.75rem; border-top: 1px solid var(--line); }
      .section::after {
        content: ""; position: absolute; left: 1.75rem; right: 1.75rem; top: -1px; height: 2px; border-radius: 2px;
        background: linear-gradient(90deg, rgb(var(--tone)), transparent 70%); opacity: 0.8;
      }
      .section-head { display: flex; gap: 1rem; align-items: flex-start; }
      .section-index {
        display: grid; place-items: center; flex-shrink: 0; width: 2.5rem; height: 2.5rem; border-radius: 0.8rem;
        font: 700 0.85rem/1 var(--font-display); color: rgb(var(--tone));
        background: rgba(var(--tone), 0.12); border: 1px solid rgba(var(--tone), 0.3);
      }
      .section h2 { margin: 0.2rem 0 0; font: 600 clamp(1.35rem, 2.5vw, 1.7rem)/1.25 var(--font-display); letter-spacing: -0.015em; }
      .section-intro { margin: 0.5rem 0 0; color: var(--muted); line-height: 1.75; }
      .section-body { margin-top: 1.25rem; display: grid; gap: 1.1rem; }
      @media (min-width: 640px) { .section-body { padding-left: 3.5rem; } }
      .section-body > * { margin: 0; }
      .prose p, .prose-p { margin: 0 0 0.75rem; color: var(--muted); line-height: 1.8; }
      .prose p:last-child { margin-bottom: 0; }

      .badges, .chips, .bullets, .checklist, .steps { list-style: none; margin: 0; padding: 0; }
      .badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .badge {
        padding: 0.3rem 0.8rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 500;
        color: rgb(var(--tone)); border: 1px solid rgba(var(--tone), 0.32); background: rgba(var(--tone), 0.1);
      }
      .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .chip {
        padding: 0.4rem 0.9rem; border-radius: 9999px; font-size: 0.875rem; color: var(--fg);
        border: 1px solid var(--line-strong); background: var(--surface-2);
        transition: border-color 200ms ease, transform 200ms ease;
      }
      .chip:hover { transform: translateY(-1px); border-color: rgba(var(--tone), 0.6); }

      .stack { display: grid; gap: 0.75rem; }
      .stack-item {
        margin: 0; padding: 0.9rem 1.1rem; border-radius: 0.9rem; color: var(--muted); line-height: 1.75;
        background: var(--surface-2); border: 1px solid var(--line); border-left: 3px solid rgba(var(--tone), 0.7);
      }

      .bullets { display: grid; gap: 0.6rem; }
      .bullets li { position: relative; padding-left: 1.5rem; color: var(--muted); line-height: 1.75; }
      .bullets li::before {
        content: ""; position: absolute; left: 0.2rem; top: 0.7em; width: 0.45rem; height: 0.45rem; border-radius: 9999px;
        background: rgb(var(--tone)); box-shadow: 0 0 0 4px rgba(var(--tone), 0.15);
      }

      .checklist { display: grid; gap: 0.6rem; }
      @media (min-width: 768px) { .checklist { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      .checklist li {
        display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.8rem 1rem; border-radius: 0.9rem;
        background: var(--surface-2); border: 1px solid var(--line); color: var(--muted); line-height: 1.6;
      }
      .check {
        display: grid; place-items: center; flex-shrink: 0; width: 1.5rem; height: 1.5rem; border-radius: 9999px;
        color: rgb(var(--tone)); background: rgba(var(--tone), 0.14);
      }

      .steps { display: grid; gap: 0.75rem; }
      @media (min-width: 768px) { .steps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      .step {
        display: flex; gap: 0.9rem; align-items: flex-start; padding: 1rem 1.1rem; border-radius: 1rem;
        background: var(--surface-2); border: 1px solid var(--line);
        transition: border-color 250ms ease, transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .step:hover { transform: translateY(-3px); border-color: rgba(var(--tone), 0.45); }
      .step p { margin: 0; color: var(--muted); line-height: 1.65; }
      .step-num { font: 700 1.1rem/1.4 var(--font-display); color: rgb(var(--tone)); font-variant-numeric: tabular-nums; }

      .cards { display: grid; gap: 0.9rem; }
      @media (min-width: 768px) { .cards { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); } }
      .card {
        position: relative; padding: 1.2rem; border-radius: 1rem; background: var(--surface-2); border: 1px solid var(--line);
        transition: border-color 250ms ease, transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .card:hover { transform: translateY(-3px); border-color: rgba(var(--tone), 0.45); }
      .card h3 { margin: 0; font: 600 1.05rem/1.35 var(--font-display); }
      .card p { margin: 0.5rem 0 0; font-size: 0.925rem; color: var(--muted); line-height: 1.7; }

      /* Footer & scroll top */
      .footer { border-top: 1px solid var(--line); }
      .footer div {
        max-width: 72rem; margin: 0 auto; padding: 2rem 1rem;
        display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.75rem; font-size: 0.875rem; color: var(--subtle);
      }
      .footer a { text-decoration: none; transition: color 200ms ease; }
      .footer a:hover { color: var(--fg); }

      .scroll-top {
        position: fixed; right: 1.25rem; bottom: 1.25rem; z-index: 60; display: grid; place-items: center;
        width: 3rem; height: 3rem; border-radius: 9999px; cursor: pointer;
        border: 1px solid var(--line-strong); background: var(--nav-bg); color: var(--fg);
        backdrop-filter: blur(16px); box-shadow: var(--shadow);
        opacity: 0; pointer-events: none; transform: translateY(14px) scale(0.9);
        transition: opacity 250ms ease, transform 250ms ease, border-color 200ms ease;
      }
      .scroll-top.is-visible { opacity: 1; pointer-events: auto; transform: none; }
      .scroll-top:hover { border-color: var(--accent); transform: translateY(-3px); }

      /* Reveal (only when JS is running) */
      .js .reveal {
        opacity: 0; transform: translateY(24px);
        transition: opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: var(--d, 0ms);
      }
      .js .reveal.is-visible { opacity: 1; transform: none; }

      @media (max-width: 767px) {
        .nav-shell { flex-wrap: wrap; }
        .nav-links {
          order: 3; width: 100%; overflow-x: auto; scrollbar-width: none;
          margin: 0.1rem -0.1rem 0; padding-top: 0.5rem; border-top: 1px solid var(--line);
        }
        .nav-links::-webkit-scrollbar { display: none; }
        .nav-link { white-space: nowrap; }
        .hero { padding: 3rem 0 2.5rem; }
        .section { padding: 1.35rem; }
        .section::after { left: 1.35rem; right: 1.35rem; }
        .blob { filter: blur(70px); }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        html { scroll-behavior: auto; }
        .js .reveal { opacity: 1; transform: none; }
      }
    `;
