async function loadComponent(selector, path) {
  const mountNode = document.querySelector(selector);
  if (!mountNode) return;

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load component: ${path}`);
    }

    const html = await response.text();
    mountNode.innerHTML = html;
  } catch (error) {
    console.error(error);
  }
}

function getComponentPath(fileName) {
  const currentPath = window.location.pathname;
  const depth = currentPath.split("/").filter(Boolean).length;

  if (depth <= 1) {
    return `./components/${fileName}`;
  }

  return `../components/${fileName}`;
}

function normalizeLinkPaths(root) {
  if (!root) return;

  const links = root.querySelectorAll('a[href^="./"]');
  const isRootPage = window.location.pathname.split("/").filter(Boolean).length <= 1;

  if (isRootPage) return;

  links.forEach((link) => {
    const href = link.getAttribute("href");
    link.setAttribute("href", href.replace("./", "../"));
  });
}

function setActiveNav(headerRoot) {
  if (!headerRoot) return;

  const fileName = window.location.pathname.split("/").pop() || "index.html";
  const currentKey = fileName.replace(".html", "");

  const navLinks = headerRoot.querySelectorAll(".site-nav a[data-nav]");
  navLinks.forEach((link) => {
    const key = link.dataset.nav;
    link.classList.toggle("is-active", key === currentKey);
  });
}

function bindMobileNav(headerRoot) {
  if (!headerRoot) return;

  const navToggle = headerRoot.querySelector(".nav-toggle");
  const siteNav = headerRoot.querySelector(".site-nav");

  if (!navToggle || !siteNav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function bindLangSwitcher(headerRoot) {
  if (!headerRoot) return;

  const langButtons = headerRoot.querySelectorAll("[data-lang-switch]");
  if (!langButtons.length) return;

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.dataset.langSwitch;

      if (typeof window.setLanguage === "function") {
        window.setLanguage(lang);
      } else {
        localStorage.setItem("aplus-language", lang);
        window.location.reload();
      }
    });
  });
}

function initBackToTop() {
  const backToTopButton = document.querySelector(".back-to-top");
  if (!backToTopButton) return;

  let ticking = false;

  const toggleVisibility = () => {
    if (window.scrollY > 360) {
      backToTopButton.classList.add("is-visible");
    } else {
      backToTopButton.classList.remove("is-visible");
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(toggleVisibility);
        ticking = true;
      }
    },
    { passive: true }
  );

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  toggleVisibility();
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let ticking = false;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  handleScroll();
}

async function initSharedHeader() {
  await loadComponent("#site-header", getComponentPath("header.html"));

  const headerRoot = document.querySelector("#site-header");
  if (!headerRoot) return;

  normalizeLinkPaths(headerRoot);
  setActiveNav(headerRoot);
  bindMobileNav(headerRoot);
  bindLangSwitcher(headerRoot);
}

async function initSharedFooter() {
  await loadComponent("#site-footer", getComponentPath("footer.html"));

  const footerRoot = document.querySelector("#site-footer");
  if (!footerRoot) return;

  normalizeLinkPaths(footerRoot);
}

async function initSharedLayout() {
  await initSharedHeader();
  await initSharedFooter();

  if (typeof window.applyI18n === "function") {
    window.applyI18n();
  }

  initBackToTop();
  initHeaderScroll();
}

document.addEventListener("DOMContentLoaded", initSharedLayout);