(() => {
  const NAV_ITEMS = [
    { href: "/", label: "Home", icon: "/assets/icons/ui/dashboard.svg" },
    { href: "/members/", label: "Members", icon: "/assets/icons/ui/profile.svg" },
    { href: "/notices/", label: "Notices", icon: "/assets/icons/ui/tickbadge.svg" },
    { href: "/settings/", label: "Settings", icon: "/assets/icons/ui/cog.svg" }
  ];

  const SIDEBAR_STATE_KEY = "ss-members-sidebar-state";
  const SIDEBAR_STATES = Object.freeze({
    hidden: "hidden",
    icon: "icon",
    expanded: "expanded"
  });

  const MOBILE_MEDIA_QUERY = "(max-width: 920px)";
  const AUTH_API_BASE = "https://api.streamsuites.app";
  const PUBLIC_LOGIN_URL = "https://streamsuites.app/public-login.html";
  const AUTH_COMPLETE_URL = `${window.location.origin}/auth-complete/`;
  const AUTH_OAUTH_LINKS = Object.freeze([
    { provider: "google", label: "Continue with Google", icon: "/assets/icons/google.svg", path: "/auth/login/google" },
    { provider: "github", label: "Continue with GitHub", icon: "/assets/icons/github.svg", path: "/auth/login/github" },
    { provider: "x", label: "Continue with X", icon: "/assets/icons/x.svg", path: "/auth/x/start" },
    { provider: "discord", label: "Continue with Discord", icon: "/assets/icons/discord.svg", path: "/auth/login/discord" },
    { provider: "twitch", label: "Continue with Twitch", icon: "/assets/icons/twitch.svg", path: "/oauth/twitch/start" }
  ]);

  function normalizePath(path) {
    if (!path) return "/";
    return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  }

  function create(tag, className, text) {
    return window.StreamSuitesMembersUi.create(tag, className, text);
  }

  function createIcon(path, className = "icon-mask") {
    return window.StreamSuitesMembersUi.createIcon(path, className);
  }

  function isEditableTarget(target) {
    if (!(target instanceof Element)) return false;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      return true;
    }
    return target.closest("[contenteditable='true']") !== null;
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
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  }

  function createNavLink(item, currentPath) {
    const link = create("a", "sidebar-link");
    link.href = item.href;
    link.dataset.navHref = item.href;

    if (normalizePath(item.href) === normalizePath(currentPath)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    const icon = create("span", "sidebar-icon");
    icon.appendChild(createIcon(item.icon, "sidebar-icon-mask"));
    link.append(icon, create("span", "sidebar-text", item.label));
    return link;
  }

  function buildFooter() {
    const shell = create("footer", "footer-shell");
    const bar = create("div", "footer-bar");
    const cluster = create("div", "footer-cluster");
    const left = create("div", "footer-left");
    const creatorLogin = create("a", "creator-login-btn login-primary", "Creator Login");
    creatorLogin.href = "https://api.streamsuites.app/auth/login/google?surface=creator";
    creatorLogin.rel = "noopener noreferrer";
    creatorLogin.target = "_blank";
    left.appendChild(creatorLogin);

    const links = create("div", "footer-links");
    [
      ["/", "/"],
      ["/members/", "/members"],
      ["/notices/", "/notices"],
      ["/settings/", "/settings"],
      ["/u/testuser", "/u/testuser"]
    ].forEach(([href, label]) => {
      const link = create("a", "", label);
      link.href = href;
      links.appendChild(link);
    });
    cluster.append(left, links);

    const meta = create("div", "footer-meta");
    meta.appendChild(create("span", "footer-version", "Members community shell"));

    bar.append(cluster, meta);
    shell.appendChild(bar);
    return shell;
  }

  function mount(options = {}) {
    const root = document.querySelector(options.rootSelector || "#members-app");
    if (!root) throw new Error("Missing members root");

    const callbacks = {
      onSearch: typeof options.onSearch === "function" ? options.onSearch : null,
      onAccountMenuAction: typeof options.onAccountMenuAction === "function" ? options.onAccountMenuAction : null
    };

    document.body.classList.add("public-shell-page");
    root.innerHTML = "";

    const currentPath = options.activeHref || window.location.pathname;
    const defaultSidebarState = isMobileViewport() ? SIDEBAR_STATES.icon : SIDEBAR_STATES.expanded;
    const storedSidebarState = readSidebarState();
    const initialSidebarState = storedSidebarState || defaultSidebarState;
    let lastVisibleSidebarState = initialSidebarState === SIDEBAR_STATES.hidden ? SIDEBAR_STATES.expanded : initialSidebarState;
    let useAutoSidebarState = !storedSidebarState;

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
    const hideBtn = create("button", "topbar-hide-btn");
    hideBtn.type = "button";
    hideBtn.setAttribute("aria-label", "Hide sidebar");
    hideBtn.appendChild(createIcon("/assets/icons/ui/minus.svg", "topbar-btn-icon"));
    const title = create("div", "topbar-title", options.title || "Members");
    topbarLeft.append(menuBtn, hideBtn, title);

    const topbarCenter = create("div", "topbar-center");
    const searchShell = create("label", "search-shell");
    const searchIcon = create("span", "search-icon");
    searchIcon.appendChild(createIcon("/assets/icons/ui/querystats.svg", "search-icon-mask"));
    const searchInput = create("input");
    searchInput.type = "search";
    searchInput.placeholder = options.searchPlaceholder || "Search";
    searchInput.setAttribute("data-shell-search", "");
    const searchHint = create("span", "search-kbd-hint");
    searchHint.innerHTML = "<kbd>Ctrl</kbd>/<kbd>Cmd</kbd> K";
    searchShell.append(searchIcon, searchInput, searchHint);
    topbarCenter.appendChild(searchShell);

    const topbarRight = create("div", "topbar-right");
    const accountWidget = create("div", "account-widget ss-no-profile-hover");
    accountWidget.setAttribute("data-ss-profile-hover", "off");
    const account = create("button", "account-pill account-trigger");
    account.type = "button";
    account.setAttribute("aria-haspopup", "menu");
    account.setAttribute("aria-expanded", "false");
    const accountAvatar = create("span", "account-avatar");
    const accountText = create("span", "account-text");
    const accountName = create("span", "account-name", options.accountLabel || "Login");
    const accountBadges = create("span", "account-badges");
    accountText.append(accountName, accountBadges);
    account.append(accountAvatar, accountText);

    const accountMenu = create("div", "account-menu");
    accountMenu.hidden = true;
    accountMenu.setAttribute("role", "menu");

    accountWidget.append(account, accountMenu);
    topbarRight.appendChild(accountWidget);

    topbarMain.append(topbarLeft, topbarCenter, topbarRight);
    topbar.appendChild(topbarMain);

    const loadingBar = create("div", "shell-loading");
    loadingBar.setAttribute("aria-hidden", "true");
    loadingBar.append(create("div", "shell-loading-track"), create("div", "shell-loading-bar"));

    const content = create("main", "public-content");
    content.id = "members-content";
    main.append(topbar, loadingBar, content);

    root.append(bg, shell);
    shell.append(sidebar, main, buildFooter());

    const authBackdrop = create("div", "auth-modal-backdrop");
    authBackdrop.setAttribute("aria-hidden", "true");
    authBackdrop.innerHTML = `
      <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="members-auth-modal-title" data-state="login">
        <button class="auth-modal-close" type="button" aria-label="Close"><span class="auth-modal-close-icon" aria-hidden="true"></span></button>
        <div class="auth-modal-header">
          <p class="auth-modal-eyebrow">Members access</p>
          <h2 id="members-auth-modal-title" class="auth-modal-title"><span data-auth-title-text>Log in to StreamSuites Members</span></h2>
          <p class="auth-modal-subtitle" data-auth-subtitle>Use OAuth to continue.</p>
        </div>
        <div class="auth-panel" data-state="login"></div>
        <div class="auth-panel" data-state="signup"></div>
      </div>
    `;
    root.appendChild(authBackdrop);

    const authModal = authBackdrop.querySelector(".auth-modal");
    const authTitle = authBackdrop.querySelector("[data-auth-title-text]");
    const authSubtitle = authBackdrop.querySelector("[data-auth-subtitle]");
    const authClose = authBackdrop.querySelector(".auth-modal-close");
    const authCloseIcon = authBackdrop.querySelector(".auth-modal-close-icon");
    if (authCloseIcon) {
      authCloseIcon.style.setProperty("--icon-mask", 'url("/assets/icons/ui/minus.svg")');
    }
    const authPanels = Array.from(authBackdrop.querySelectorAll(".auth-panel"));

    function buildAuthPanel(mode) {
      const panel = authBackdrop.querySelector(`.auth-panel[data-state="${mode}"]`);
      if (!panel) return;
      panel.innerHTML = "";

      const oauthGrid = create("div", "auth-oauth-grid");
      AUTH_OAUTH_LINKS.forEach((entry) => {
        const endpoint = new URL(entry.path, AUTH_API_BASE);
        endpoint.searchParams.set("login_intent", "public");
        endpoint.searchParams.set("redirect_uri", AUTH_COMPLETE_URL);
        endpoint.searchParams.set("return_to", window.location.href);
        const link = create("a", "auth-oauth-button", entry.label);
        link.href = endpoint.toString();
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const icon = create("img");
        icon.src = entry.icon;
        icon.alt = "";
        link.prepend(icon);
        oauthGrid.appendChild(link);
      });
      panel.appendChild(oauthGrid);

      const methodsToggle = create("div", "auth-toggle");
      const methodLink = create("a", "", mode === "signup" ? "Continue with email signup" : "Continue with email login");
      const publicLoginUrl = new URL(PUBLIC_LOGIN_URL);
      publicLoginUrl.searchParams.set("return_to", window.location.href);
      publicLoginUrl.searchParams.set("auth", mode);
      methodLink.href = publicLoginUrl.toString();
      methodLink.target = "_blank";
      methodLink.rel = "noopener noreferrer";
      methodsToggle.appendChild(methodLink);
      panel.appendChild(methodsToggle);

      const legal = create("p", "auth-legal muted");
      legal.textContent = "By continuing you agree to the existing public account flow.";
      panel.appendChild(legal);

      const swap = create("div", "auth-toggle");
      if (mode === "login") {
        swap.innerHTML = 'Need an account? <button type="button" data-auth-toggle="signup">Sign up</button>';
      } else {
        swap.innerHTML = 'Already have an account? <button type="button" data-auth-toggle="login">Log in</button>';
      }
      panel.appendChild(swap);
    }

    function setAuthModalState(state) {
      const next = state === "signup" ? "signup" : "login";
      if (authModal) authModal.dataset.state = next;
      if (authTitle) authTitle.textContent = next === "signup" ? "Sign up to StreamSuites Members" : "Log in to StreamSuites Members";
      if (authSubtitle) authSubtitle.textContent = next === "signup" ? "Create your public account for members access." : "Use OAuth to continue.";
      authPanels.forEach((panel) => {
        panel.hidden = panel.getAttribute("data-state") !== next;
      });
    }

    function openAuthModal(state = "login") {
      setAuthModalState(state);
      authBackdrop.classList.add("is-open");
      authBackdrop.setAttribute("aria-hidden", "false");
    }

    function closeAuthModal() {
      authBackdrop.classList.remove("is-open");
      authBackdrop.setAttribute("aria-hidden", "true");
    }

    buildAuthPanel("login");
    buildAuthPanel("signup");
    setAuthModalState("login");

    authClose?.addEventListener("click", closeAuthModal);
    authBackdrop.addEventListener("click", (event) => {
      if (event.target === authBackdrop) closeAuthModal();
    });
    authBackdrop.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-auth-toggle]");
      if (!toggle) return;
      setAuthModalState(String(toggle.getAttribute("data-auth-toggle") || "login"));
    });

    function setAccountIdentity(label, avatarUrl, badges = []) {
      const nextLabel = (label || "Login").trim() || "Login";
      accountName.textContent = nextLabel;
      accountBadges.innerHTML = "";

      (Array.isArray(badges) ? badges : []).forEach((badge) => {
        if (!badge || typeof badge !== "object") return;
        const kind = String(badge.kind || "").trim().toLowerCase();
        const value = String(badge.value || "").trim().toLowerCase();
        if (kind === "role-icon" || kind === "tier-icon") {
          const icon = create("img", "account-badge-icon");
          icon.src = kind === "tier-icon"
            ? `/assets/icons/tierbadge-${value || "core"}.svg`
            : "/assets/icons/tierbadge-admin.svg";
          icon.alt = "";
          accountBadges.appendChild(icon);
          return;
        }
        if (kind === "role-chip") {
          const chip = create("span", "account-badge-role-chip", String(badge.label || value || "").trim());
          if (chip.textContent) accountBadges.appendChild(chip);
        }
      });

      if (avatarUrl) {
        accountAvatar.textContent = "";
        accountAvatar.classList.add("has-image");
        accountAvatar.style.backgroundImage = `url(${avatarUrl})`;
        accountAvatar.style.backgroundSize = "cover";
        accountAvatar.style.backgroundPosition = "center";
        return;
      }

      accountAvatar.classList.remove("has-image");
      accountAvatar.style.backgroundImage = "";
      accountAvatar.textContent = nextLabel.charAt(0).toUpperCase() || "L";
    }

    function closeAccountMenu() {
      accountMenu.hidden = true;
      account.classList.remove("is-open");
      account.setAttribute("aria-expanded", "false");
    }

    function openAccountMenu() {
      const hasItems = accountMenu.childElementCount > 0;
      if (!hasItems) {
        closeAccountMenu();
        return;
      }
      accountMenu.hidden = false;
      account.classList.add("is-open");
      account.setAttribute("aria-expanded", "true");
    }

    function setAccountMenuItems(items = [], authenticated = false, badges = []) {
      accountMenu.innerHTML = "";
      if (authenticated) {
        const header = create("div", "account-menu-header");
        const roleChip = badges.find((badge) => String(badge?.kind || "") === "role-chip");
        header.append(
          create("div", "account-menu-name", accountName.textContent || "User"),
          create("div", "account-menu-role", String(roleChip?.label || "").trim())
        );
        accountMenu.appendChild(header);
      }

      items.forEach((item) => {
        if (!item || typeof item !== "object") return;
        if (item.separator) {
          accountMenu.appendChild(create("div", "account-menu-separator"));
          return;
        }

        const label = String(item.label || "").trim();
        if (!label) return;

        if (item.href) {
          const link = create("a", "account-menu-item", label);
          link.href = String(item.href);
          link.setAttribute("role", "menuitem");
          if (item.target) link.target = String(item.target);
          if (item.rel) link.rel = String(item.rel);
          link.addEventListener("click", () => {
            closeAccountMenu();
            if (typeof callbacks.onAccountMenuAction === "function") {
              callbacks.onAccountMenuAction(String(item.action || ""), item);
            }
          });
          accountMenu.appendChild(link);
          return;
        }

        const button = create("button", "account-menu-item", label);
        button.type = "button";
        button.setAttribute("role", "menuitem");
        if (item.subtle) button.classList.add("is-subtle");
        if (String(item.action || "").toLowerCase() === "logout") {
          button.classList.add("is-danger");
        }
        button.addEventListener("click", () => {
          closeAccountMenu();
          if (typeof callbacks.onAccountMenuAction === "function") {
            callbacks.onAccountMenuAction(String(item.action || ""), item);
          }
        });
        accountMenu.appendChild(button);
      });
    }

    function setSidebarState(nextState, persist = true) {
      const value = Object.values(SIDEBAR_STATES).includes(nextState) ? nextState : SIDEBAR_STATES.expanded;
      shell.dataset.sidebarState = value;
      if (value !== SIDEBAR_STATES.hidden) {
        lastVisibleSidebarState = value;
      }
      menuBtn.setAttribute("aria-label", value === SIDEBAR_STATES.expanded ? "Collapse sidebar" : "Expand sidebar");
      hideBtn.setAttribute("aria-label", value === SIDEBAR_STATES.hidden ? "Show sidebar" : "Hide sidebar");
      hideBtn.classList.toggle("is-hidden-state", value === SIDEBAR_STATES.hidden);
      if (persist) {
        useAutoSidebarState = false;
        writeSidebarState(value);
      }
    }

    function setActiveNav(href) {
      const normalizedHref = normalizePath(href || window.location.pathname);
      sidebarScroll.querySelectorAll("a.sidebar-link").forEach((link) => {
        const active = normalizePath(link.dataset.navHref || link.getAttribute("href") || "") === normalizedHref;
        link.classList.toggle("active", active);
        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function setLoading(active) {
      const isActive = Boolean(active);
      loadingBar.classList.toggle("is-active", isActive);
      loadingBar.setAttribute("aria-hidden", isActive ? "false" : "true");
      content.setAttribute("aria-busy", isActive ? "true" : "false");
    }

    function setSearchVisible(visible) {
      const show = visible !== false;
      topbar.classList.toggle("search-hidden", !show);
      topbarCenter.hidden = !show;
      searchShell.hidden = !show;
      if (!show) {
        searchInput.value = "";
      }
    }

    function updateOptions(next = {}) {
      if (typeof next.title === "string" || typeof next.topbarLabel === "string") {
        title.textContent = next.title || next.topbarLabel || "";
      }
      if (typeof next.searchPlaceholder === "string") {
        searchInput.placeholder = next.searchPlaceholder;
      }
      if (typeof next.showSearch === "boolean") {
        setSearchVisible(next.showSearch);
      }
      if (typeof next.activeHref === "string") {
        setActiveNav(next.activeHref);
      }
      if (typeof next.onSearch === "function" || next.onSearch === null) {
        callbacks.onSearch = typeof next.onSearch === "function" ? next.onSearch : null;
      }
      if (typeof next.onAccountMenuAction === "function" || next.onAccountMenuAction === null) {
        callbacks.onAccountMenuAction = typeof next.onAccountMenuAction === "function" ? next.onAccountMenuAction : null;
      }
      if (
        typeof next.accountLabel === "string" ||
        typeof next.accountAvatar === "string" ||
        Array.isArray(next.accountBadges) ||
        Array.isArray(next.accountMenuItems) ||
        typeof next.accountAuthenticated === "boolean"
      ) {
        const badges = Array.isArray(next.accountBadges) ? next.accountBadges : [];
        setAccountIdentity(next.accountLabel || accountName.textContent, next.accountAvatar || "", badges);
        setAccountMenuItems(next.accountMenuItems || [], Boolean(next.accountAuthenticated), badges);
        account.classList.toggle("is-authenticated", Boolean(next.accountAuthenticated));
      }
    }

    setSidebarState(initialSidebarState, false);
    setSearchVisible(options.showSearch !== false);
    setAccountIdentity(options.accountLabel || "Login", options.accountAvatar || "", options.accountBadges || []);
    setAccountMenuItems(options.accountMenuItems || [], Boolean(options.accountAuthenticated), options.accountBadges || []);
    account.classList.toggle("is-authenticated", Boolean(options.accountAuthenticated));

    menuBtn.addEventListener("click", () => {
      const current = shell.dataset.sidebarState || SIDEBAR_STATES.expanded;
      if (current === SIDEBAR_STATES.expanded) {
        setSidebarState(SIDEBAR_STATES.icon, true);
      } else if (current === SIDEBAR_STATES.icon) {
        setSidebarState(SIDEBAR_STATES.expanded, true);
      } else {
        setSidebarState(lastVisibleSidebarState || SIDEBAR_STATES.icon, true);
      }
    });

    hideBtn.addEventListener("click", () => {
      const current = shell.dataset.sidebarState || SIDEBAR_STATES.expanded;
      if (current === SIDEBAR_STATES.hidden) {
        setSidebarState(lastVisibleSidebarState || SIDEBAR_STATES.icon, true);
      } else {
        setSidebarState(SIDEBAR_STATES.hidden, true);
      }
    });

    searchInput.addEventListener("input", () => {
      if (typeof callbacks.onSearch === "function") {
        callbacks.onSearch(searchInput.value.trim());
      }
    });

    account.addEventListener("click", (event) => {
      event.stopPropagation();
      if (accountMenu.hidden) {
        openAccountMenu();
      } else {
        closeAccountMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!accountWidget.contains(event.target)) {
        closeAccountMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAuthModal();
        closeAccountMenu();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && String(event.key || "").toLowerCase() === "k") {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

    window.addEventListener("resize", () => {
      if (!useAutoSidebarState) return;
      setSidebarState(isMobileViewport() ? SIDEBAR_STATES.icon : SIDEBAR_STATES.expanded, false);
    }, { passive: true });

    return {
      content,
      searchInput,
      updateOptions,
      setQuery(value) {
        searchInput.value = value || "";
      },
      setLoading,
      setActiveHref(href) {
        setActiveNav(href);
      },
      openAuthModal,
      closeAuthModal
    };
  }

  window.StreamSuitesMembersShell = { mount };
})();
