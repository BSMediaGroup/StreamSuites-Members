(() => {
  const NAV_ITEMS = [
    { href: "/", label: "Home", icon: "/assets/icons/ui/dashboard.svg" },
    { href: "/members/", label: "Members", icon: "/assets/icons/ui/profile.svg" },
    { href: "/notices/", label: "Notices", icon: "/assets/icons/ui/tickbadge.svg" }
  ];

  const SIDEBAR_STATE_KEY = "ss-members-sidebar-state";
  const SIDEBAR_STATES = Object.freeze({
    hidden: "hidden",
    icon: "icon",
    expanded: "expanded"
  });

  function normalizePath(path) {
    if (!path) return "/";
    return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  }

  function create(tag, className, text) {
    return window.StreamSuitesMembersUi.create(tag, className, text);
  }

  function createIcon(path, className) {
    return window.StreamSuitesMembersUi.createIcon(path, className);
  }

  function readSidebarState() {
    try {
      const raw = window.localStorage.getItem(SIDEBAR_STATE_KEY);
      if (raw && Object.values(SIDEBAR_STATES).includes(raw)) {
        return raw;
      }
    } catch (_error) {
      // Ignore storage failures.
    }
    return "";
  }

  function writeSidebarState(value) {
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, value);
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 920px)").matches;
  }

  function nextSidebarState(current) {
    if (current === SIDEBAR_STATES.expanded) return SIDEBAR_STATES.icon;
    if (current === SIDEBAR_STATES.icon) return SIDEBAR_STATES.expanded;
    return SIDEBAR_STATES.expanded;
  }

  function createNavLink(item, currentPath) {
    const link = create("a", "sidebar-link");
    link.href = item.href;

    if (normalizePath(item.href) === normalizePath(currentPath)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    const icon = create("span", "sidebar-icon");
    icon.appendChild(createIcon(item.icon, "sidebar-icon-mask"));
    link.append(icon, create("span", "sidebar-text", item.label));
    return link;
  }

  function mount(options = {}) {
    const root = document.querySelector(options.rootSelector || "#members-app");
    if (!root) throw new Error("Missing members root");

    document.body.classList.add("public-shell-page");
    root.innerHTML = "";

    const currentPath = options.activeHref || window.location.pathname;
    const defaultSidebarState = isMobileViewport() ? SIDEBAR_STATES.hidden : SIDEBAR_STATES.expanded;
    const initialSidebarState = readSidebarState() || defaultSidebarState;

    const bg = create("div", "public-shell-bg");
    const shell = create("div", "public-shell-root");
    shell.dataset.sidebarState = initialSidebarState;

    const sidebar = create("aside", "public-sidebar");
    sidebar.setAttribute("aria-label", "Members navigation");

    const sidebarTop = create("div", "sidebar-top");
    const brand = create("a", "sidebar-brand");
    brand.href = "/";
    const logo = create("img");
    logo.src = "/assets/logos/logo.png";
    logo.alt = "StreamSuites";

    const brandLabel = create("span", "sidebar-brand-label");
    brandLabel.append(
      create("span", "sidebar-brand-title", "StreamSuites Members"),
      (() => {
        const subheading = create("span", "sidebar-brand-subheading");
        subheading.appendChild(create("span", "sidebar-brand-subheading-text", "COMMUNITY HUB"));
        return subheading;
      })()
    );

    brand.append(logo, brandLabel);
    sidebarTop.appendChild(brand);

    const sidebarScroll = create("div", "sidebar-scroll");
    const group = create("section", "sidebar-group");
    const nav = create("nav", "sidebar-nav");
    nav.setAttribute("aria-label", "Members hub sections");
    NAV_ITEMS.forEach((item) => nav.appendChild(createNavLink(item, currentPath)));
    group.appendChild(nav);
    sidebarScroll.appendChild(group);
    sidebar.append(sidebarTop, sidebarScroll);

    const main = create("div", "public-main");
    const topbar = create("header", "public-topbar");
    const topbarMain = create("div", "topbar-main");

    const topbarLeft = create("div", "topbar-left");
    const menuBtn = create("button", "topbar-menu-btn");
    menuBtn.type = "button";
    menuBtn.setAttribute("aria-label", "Toggle sidebar size");
    menuBtn.appendChild(createIcon("/assets/icons/ui/sidebar.svg", "topbar-btn-icon"));
    const hideBtn = create("button", "topbar-menu-btn members-topbar-hide-btn");
    hideBtn.type = "button";
    hideBtn.setAttribute("aria-label", "Hide sidebar");
    hideBtn.appendChild(createIcon("/assets/icons/ui/minus.svg", "topbar-btn-icon"));
    const title = create("div", "topbar-title", options.title || "Members");
    topbarLeft.append(menuBtn, hideBtn, title);

    const topbarCenter = create("div", "topbar-center");
    const searchShell = create("label", "search-shell");
    searchShell.appendChild(createIcon("/assets/icons/ui/querystats.svg", "search-icon"));
    const searchInput = create("input", "search-input");
    searchInput.type = "search";
    searchInput.placeholder = options.searchPlaceholder || "Search";
    searchInput.autocomplete = "off";
    searchShell.appendChild(searchInput);
    topbarCenter.appendChild(searchShell);

    const topbarRight = create("div", "topbar-right");
    const surfaceChip = create("span", "members-surface-chip", "members.streamsuites.app");
    topbarRight.appendChild(surfaceChip);

    topbarMain.append(topbarLeft, topbarCenter, topbarRight);
    topbar.appendChild(topbarMain);

    const content = create("main", "public-content");
    content.id = "members-content";
    main.append(topbar, content);

    const footer = create("footer", "footer-shell");
    const footerBar = create("div", "footer-bar");
    const cluster = create("div", "footer-cluster");
    const left = create("div", "footer-left");
    left.appendChild(create("span", "muted", "Dedicated members surface ported from the public community hub."));
    const links = create("div", "footer-links");
    [
      ["/", "/"],
      ["/members/", "/members"],
      ["/notices/", "/notices"],
      ["/u/testuser", "/u/testuser"]
    ].forEach(([href, label]) => {
      const link = create("a", "", label);
      link.href = href;
      links.appendChild(link);
    });
    cluster.append(left, links);

    const meta = create("div", "footer-meta");
    meta.appendChild(create("span", "footer-version", "Members beta shell"));

    footerBar.append(cluster, meta);
    footer.appendChild(footerBar);

    root.append(bg, shell);
    shell.append(sidebar, main, footer);

    function setSidebarState(nextState) {
      shell.dataset.sidebarState = nextState;
      writeSidebarState(nextState);
      menuBtn.setAttribute(
        "aria-label",
        nextState === SIDEBAR_STATES.expanded ? "Collapse sidebar" : "Expand sidebar"
      );
      hideBtn.setAttribute(
        "aria-label",
        nextState === SIDEBAR_STATES.hidden ? "Show sidebar" : "Hide sidebar"
      );
    }

    setSidebarState(initialSidebarState);

    menuBtn.addEventListener("click", () => {
      const current = shell.dataset.sidebarState || SIDEBAR_STATES.expanded;
      setSidebarState(nextSidebarState(current));
    });

    hideBtn.addEventListener("click", () => {
      const current = shell.dataset.sidebarState || SIDEBAR_STATES.expanded;
      setSidebarState(current === SIDEBAR_STATES.hidden ? SIDEBAR_STATES.expanded : SIDEBAR_STATES.hidden);
    });

    searchInput.addEventListener("input", () => {
      if (typeof options.onSearch === "function") {
        options.onSearch(searchInput.value);
      }
    });

    window.addEventListener("resize", () => {
      if (!isMobileViewport() && shell.dataset.sidebarState === SIDEBAR_STATES.hidden) {
        setSidebarState(SIDEBAR_STATES.expanded);
      }
    });

    return {
      content,
      setTitle(nextTitle) {
        title.textContent = nextTitle || "";
      },
      setQuery(value) {
        searchInput.value = value || "";
      }
    };
  }

  window.StreamSuitesMembersShell = { mount };
})();
