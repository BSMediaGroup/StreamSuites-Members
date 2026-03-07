(() => {
  const NAV_ITEMS = [
    { href: "/", label: "Home", icon: "/assets/icons/ui/dashboard.svg" },
    { href: "/members/", label: "Members", icon: "/assets/icons/ui/profile.svg" },
    { href: "/notices/", label: "Notices", icon: "/assets/icons/ui/tickbadge.svg" }
  ];

  const SIDEBAR_STATES = Object.freeze({
    icon: "icon",
    expanded: "expanded"
  });

  function normalizePath(path) {
    if (!path) return "/";
    return path.endsWith("/") && path.length > 1 ? path : `${path}${path === "/" ? "" : "/"}`;
  }

  function create(tag, className, text) {
    return window.StreamSuitesMembersUi.create(tag, className, text);
  }

  function createIcon(path, className) {
    return window.StreamSuitesMembersUi.createIcon(path, className);
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

    const bg = create("div", "public-shell-bg");
    const shell = create("div", "public-shell-root");
    shell.dataset.sidebarState = SIDEBAR_STATES.expanded;

    const sidebar = create("aside", "public-sidebar");
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
        const sub = create("span", "sidebar-brand-subheading");
        sub.appendChild(create("span", "sidebar-brand-subheading-text", "COMMUNITY HUB"));
        return sub;
      })()
    );
    brand.append(logo, brandLabel);
    sidebarTop.appendChild(brand);

    const sidebarScroll = create("div", "sidebar-scroll");
    const group = create("section", "sidebar-group");
    group.appendChild(create("h2", "sidebar-group-title", "Members"));
    const nav = create("nav", "sidebar-nav");
    nav.setAttribute("aria-label", "Members navigation");
    NAV_ITEMS.forEach((item) => nav.appendChild(createNavLink(item, options.activeHref || window.location.pathname)));
    group.appendChild(nav);
    sidebarScroll.appendChild(group);
    sidebar.append(sidebarTop, sidebarScroll);

    const main = create("div", "public-main");
    const topbar = create("header", "public-topbar");
    const topbarMain = create("div", "topbar-main");
    const topbarLeft = create("div", "topbar-left");
    const menuBtn = create("button", "topbar-menu-btn");
    menuBtn.type = "button";
    menuBtn.setAttribute("aria-label", "Toggle compact sidebar");
    menuBtn.appendChild(createIcon("/assets/icons/ui/sidebar.svg", "topbar-btn-icon"));
    const title = create("div", "topbar-title", options.title || "Members");
    topbarLeft.append(menuBtn, title);

    const topbarCenter = create("div", "topbar-center");
    const searchShell = create("label", "search-shell");
    searchShell.appendChild(createIcon("/assets/icons/ui/querystats.svg", "search-icon"));
    const searchInput = create("input", "search-input");
    searchInput.type = "search";
    searchInput.placeholder = options.searchPlaceholder || "Search";
    searchInput.autocomplete = "off";
    searchShell.appendChild(searchInput);
    topbarCenter.appendChild(searchShell);
    topbarMain.append(topbarLeft, topbarCenter, create("div", "topbar-right"));
    topbar.appendChild(topbarMain);

    const content = create("main", "public-content");
    content.id = "members-content";
    main.append(topbar, content);

    const footer = create("footer", "footer-shell");
    const footerBar = create("div", "footer-bar");
    const cluster = create("div", "footer-cluster");
    const left = create("div", "footer-left");
    left.appendChild(create("span", "muted", "Dedicated Cloudflare Pages member surface"));
    const links = create("div", "footer-links");
    [["/", "/"], ["/members/", "/members"], ["/notices/", "/notices"]].forEach(([href, label]) => {
      const link = create("a", "", label);
      link.href = href;
      links.appendChild(link);
    });
    cluster.append(left, links);
    const meta = create("div", "footer-meta");
    meta.appendChild(create("span", "footer-version", "members.streamsuites.app"));
    footerBar.append(cluster, meta);
    footer.appendChild(footerBar);

    shell.append(sidebar, main, footer);
    root.append(bg, shell);

    menuBtn.addEventListener("click", () => {
      shell.dataset.sidebarState =
        shell.dataset.sidebarState === SIDEBAR_STATES.icon ? SIDEBAR_STATES.expanded : SIDEBAR_STATES.icon;
    });

    searchInput.addEventListener("input", () => {
      if (typeof options.onSearch === "function") {
        options.onSearch(searchInput.value);
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
