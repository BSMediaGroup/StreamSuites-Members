(() => {
  const DIRECTORY_SEED_PATH = "/data/findmehere-directory.json";
  const LIVE_STATUS_PATH = "/data/live-status.json";
  const PUBLIC_PROFILE_ENDPOINT = "/api/public/profile";
  const STREAMSUITES_HOME = "https://streamsuites.app";
  const FINDMEHERE_HOME = "https://findmehere.live";
  const THEME_STORAGE_KEY = "fmh-theme";
  const DEFAULT_THEME = "dark";
  const FALLBACK_COVER = "/assets/placeholders/defaultprofilecover.webp";
  const FMH_WORDMARK_BLOCK_LOGO = "/assets/logos/fmhwordmarkrender.webp";
  const FMH_ICON_LOGO = "/assets/logos/fmhlogo.png";
  const STREAMSUITES_ICON = "/assets/icons/ui/streamsuitesicon.svg";
  const PROFILE_ICON = "/assets/icons/ui/profile.svg";
  const CUSTOM_LINK_FALLBACK_ICON = "/assets/icons/ui/portal.svg";
  const STREAMSUITES_ICON_PATH =
    "M279.72,524.79l348.297,-361.939l777.557,0l-345.77,360.646l-201.345,-0l-289.309,302.733l-289.43,0l0,-301.44Zm940.56,450.42l-348.297,361.939l-777.557,-0l345.77,-360.646l201.345,0l289.309,-302.733l289.43,-0l-0,301.44Z";
  const PROFILE_ICON_PATH =
    "M492.667,1542.67c79.333,-60.667 168,-108.5 266,-143.5c98,-35 200.666,-52.5 308,-52.5c107.333,-0 210,17.5 308,52.5c98,35 186.666,82.833 266,143.5c54.444,-63.778 96.833,-136.111 127.166,-217c30.334,-80.889 45.5,-167.223 45.5,-259c0,-206.889 -72.722,-383.056 -218.166,-528.5c-145.445,-145.445 -321.611,-218.167 -528.5,-218.167c-206.889,-0 -383.056,72.722 -528.5,218.167c-145.445,145.444 -218.167,321.611 -218.167,528.5c0,91.777 15.167,178.111 45.5,259c30.333,80.889 72.722,153.222 127.167,217Zm574,-382.667c-91.778,-0 -169.167,-31.5 -232.167,-94.5c-63,-63 -94.5,-140.389 -94.5,-232.167c0,-91.777 31.5,-169.166 94.5,-232.166c63,-63 140.389,-94.5 232.167,-94.5c91.777,-0 169.166,31.5 232.166,94.5c63,63 94.5,140.389 94.5,232.166c0,91.778 -31.5,169.167 -94.5,232.167c-63,63 -140.389,94.5 -232.166,94.5Zm-0,840c-129.111,0 -250.445,-24.5 -364,-73.5c-113.556,-49 -212.334,-115.5 -296.334,-199.5c-84,-84 -150.5,-182.778 -199.5,-296.333c-49,-113.556 -73.5,-234.889 -73.5,-364c0,-129.111 24.5,-250.445 73.5,-364c49,-113.556 115.5,-212.334 199.5,-296.334c84,-84 182.778,-150.5 296.334,-199.5c113.555,-49 234.889,-73.5 364,-73.5c129.111,0 250.444,24.5 364,73.5c113.555,49 212.333,115.5 296.333,199.5c84,84 150.5,182.778 199.5,296.334c49,113.555 73.5,234.889 73.5,364c0,129.111 -24.5,250.444 -73.5,364c-49,113.555 -115.5,212.333 -199.5,296.333c-84,84 -182.778,150.5 -296.333,199.5c-113.556,49 -234.889,73.5 -364,73.5Z";
  const PROFILE_PAGE_SCOPE_ATTR = "data-fmh-profile-page";
  const EMPTY_LIVE_STATUS_SNAPSHOT = Object.freeze({
    schema_version: "v1",
    generated_at: null,
    providers: [],
    creators: []
  });
  const RESERVED_SEGMENTS = new Set([
    "",
    "assets",
    "auth-complete",
    "css",
    "data",
    "favicon.ico",
    "js",
    "live",
    "members",
    "notices",
    "settings",
    "u"
  ]);

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function normalizeTheme(value) {
    return value === "light" ? "light" : DEFAULT_THEME;
  }

  function readStoredTheme() {
    try {
      return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    } catch (_error) {
      return DEFAULT_THEME;
    }
  }

  function writeStoredTheme(theme) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, normalizeTheme(theme));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function getActiveTheme() {
    return normalizeTheme(
      document.documentElement.getAttribute("data-fmh-theme") ||
      document.body?.getAttribute("data-fmh-theme") ||
      readStoredTheme()
    );
  }

  function updateThemeControls(theme) {
    const nextTheme = theme === "light" ? "dark" : "light";
    document.querySelectorAll("[data-fmh-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-checked", theme === "light" ? "true" : "false");
      button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
      button.setAttribute("title", `Switch to ${nextTheme} mode`);
      button.dataset.themeCurrent = theme;
      button.dataset.themeNext = nextTheme;
    });
  }

  function applyTheme(theme, persist = false) {
    const nextTheme = normalizeTheme(theme);
    document.documentElement.setAttribute("data-fmh-theme", nextTheme);
    document.documentElement.style.colorScheme = nextTheme;
    if (document.body) {
      document.body.setAttribute("data-fmh-theme", nextTheme);
    }
    if (persist) writeStoredTheme(nextTheme);
    updateThemeControls(nextTheme);
    return nextTheme;
  }

  function toggleTheme() {
    return applyTheme(getActiveTheme() === "light" ? "dark" : "light", true);
  }

  function buildShellFrame(pageContext = {}) {
    const shell = create("div", "fmh-shell");
    const main = create("main", "fmh-main");
    main.setAttribute("data-fmh-main", "");
    shell.append(buildTopbar(pageContext), main, buildFooter());
    return { shell, main };
  }

  function setMeta(title, description) {
    document.title = title;
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = title;

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = description;
  }

  function setCanonical(path) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = new URL(path || "/", FINDMEHERE_HOME).toString();
  }

  function normalizeSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildAppUrl(path) {
    return new URL(String(path || "/"), window.location.origin);
  }

  function getRouteSlug() {
    const segments = String(window.location.pathname || "/").split("/").filter(Boolean);
    if (segments.length !== 1) return "";
    const slug = normalizeSlug(segments[0]);
    if (!slug || RESERVED_SEGMENTS.has(slug) || slug.includes(".")) return "";
    return slug;
  }

  function isLiveRoute() {
    const pathname = String(window.location.pathname || "/").replace(/\/+$/, "") || "/";
    return pathname === "/live";
  }

  function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (!parts.length) return "FM";
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }

  function getDefaultAuthState() {
    const normalizeAuthState = window.StreamSuitesMembersSession?.normalizeAuthState;
    if (typeof normalizeAuthState === "function") {
      return normalizeAuthState({});
    }
    return {
      authenticated: false,
      accountId: "",
      userCode: "public-user",
      displayName: "Login",
      avatarUrl: "",
      accountType: "PUBLIC",
      tier: "core",
      badges: []
    };
  }

  function pickFirstString(...values) {
    for (const value of values) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  }

  function pickFirstBoolean(...values) {
    for (const value of values) {
      if (value === true || value === false) return value;
    }
    return null;
  }

  function isSafeCssColor(value) {
    const color = String(value || "").trim();
    return Boolean(color) && typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("color", color);
  }

  function normalizeThemeColor(value, fallback = "") {
    return isSafeCssColor(value) ? String(value).trim() : fallback;
  }

  function normalizePreset(value, allowed, fallback) {
    const normalized = String(value || "").trim().toLowerCase();
    return allowed.has(normalized) ? normalized : fallback;
  }

  function normalizeVisibilityToggle(...values) {
    const explicit = pickFirstBoolean(...values);
    return explicit == null ? true : explicit;
  }

  function parseViewerCount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed);
  }

  function normalizeLiveStatus(raw) {
    const helper = window.StreamSuitesMembersData?.normalizeLiveStatus;
    if (typeof helper === "function") return helper(raw);
    if (!raw || typeof raw !== "object") return null;
    const activeStatus =
      raw?.active_status && typeof raw.active_status === "object"
        ? raw.active_status
        : raw?.activeStatus && typeof raw.activeStatus === "object"
          ? raw.activeStatus
          : null;
    const freshness = String(raw?.freshness || "").trim().toLowerCase();
    const stale = raw?.stale === true || freshness === "stale";
    const activeFreshness = String(activeStatus?.freshness || "").trim().toLowerCase();
    const activeStale = activeStatus?.stale === true || activeFreshness === "stale";
    const isLive = raw?.is_live === true || raw?.isLive === true;
    if (!isLive || stale || (activeStatus && (activeStatus?.is_live !== true || activeStale))) {
      return null;
    }

    const provider = String(raw?.active_provider || raw?.activeProvider || activeStatus?.provider || "").trim().toLowerCase();
    return {
      isLive: true,
      provider,
      providerLabel: toTitle(provider || "live"),
      title: String(activeStatus?.live_title || activeStatus?.liveTitle || "").trim(),
      url: String(activeStatus?.live_url || activeStatus?.liveUrl || "").trim(),
      viewerCount: parseViewerCount(activeStatus?.viewer_count || activeStatus?.viewerCount)
    };
  }

  function mergeLiveStatuses(primary, fallback) {
    const helper = window.StreamSuitesMembersData?.mergeLiveStatuses;
    if (typeof helper === "function") return helper(primary, fallback);
    if (!primary?.isLive) return fallback?.isLive ? { ...fallback } : null;
    if (!fallback?.isLive || primary.provider !== fallback.provider) return { ...primary };
    return {
      ...fallback,
      ...primary,
      title: primary.title || fallback.title || "",
      url: primary.url || fallback.url || "",
      viewerCount: primary.viewerCount ?? fallback.viewerCount ?? null,
      startedAt: primary.startedAt || fallback.startedAt || "",
      lastCheckedAt: primary.lastCheckedAt || fallback.lastCheckedAt || ""
    };
  }

  function buildLiveStatusMap(payload) {
    const helper = window.StreamSuitesMembersData?.buildLiveStatusMap;
    if (typeof helper === "function") return helper(payload);
    const map = new Map();
    const items = Array.isArray(payload?.creators) ? payload.creators : [];
    items.forEach((entry) => {
      const liveStatus = normalizeLiveStatus(entry);
      if (!liveStatus) return;
      [
        entry?.creator_id,
        entry?.creatorId,
        entry?.display_name,
        entry?.displayName
      ].forEach((value) => {
        const key = normalizeSlug(value);
        if (key) map.set(key, liveStatus);
      });
    });
    return map;
  }

  function resolveLiveStatus(profile, liveStatusMap) {
    const helper = window.StreamSuitesMembersData?.resolveLiveStatus;
    if (typeof helper === "function") return helper(profile, liveStatusMap);
    const hasEmbedded =
      Object.prototype.hasOwnProperty.call(profile || {}, "live_status") ||
      Object.prototype.hasOwnProperty.call(profile || {}, "liveStatus");
    if (hasEmbedded) {
      return normalizeLiveStatus(profile?.live_status || profile?.liveStatus);
    }
    const direct = normalizeLiveStatus(profile);
    if (direct) return direct;
    const candidates = [
      profile?.slug,
      profile?.public_slug,
      profile?.user_code,
      profile?.display_name,
      profile?.displayName
    ];
    for (const candidate of candidates) {
      const key = normalizeSlug(candidate);
      if (key && liveStatusMap?.has(key)) return liveStatusMap.get(key) || null;
    }
    return null;
  }

  function getLiveStatus(profile) {
    return profile?.live_status && profile.live_status.isLive ? profile.live_status : null;
  }

  function buildLiveBadge(profile, compact = false) {
    const liveStatus = getLiveStatus(profile);
    if (!liveStatus) return null;
    const badge = create("span", compact ? "fmh-live-badge fmh-live-badge-compact" : "fmh-live-badge", "LIVE");
    badge.setAttribute("aria-label", `${liveStatus.providerLabel || "Live"} live now`);
    return badge;
  }

  function buildLiveSummary(profile) {
    const liveStatus = getLiveStatus(profile);
    if (!liveStatus) return "";
    const parts = [`${liveStatus.providerLabel || "Live"} live now`];
    if (liveStatus.viewerCount != null) {
      parts.push(`${liveStatus.viewerCount.toLocaleString()} watching`);
    }
    return parts.join(" · ");
  }

  function buildAvatar(profile, large = false) {
    const wrap = create("div", large ? "fmh-profile-avatar" : "fmh-avatar");
    if (getLiveStatus(profile)) wrap.classList.add("is-live");
    const url = String(profile?.avatar_url || "").trim();
    if (url) {
      const image = create("img");
      image.src = url;
      image.alt = `${profile.display_name || profile.slug || "Profile"} avatar`;
      wrap.appendChild(image);
      return wrap;
    }
    wrap.textContent = getInitials(profile?.display_name || profile?.slug);
    return wrap;
  }

  function normalizeSocialLinks(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    return Object.entries(value)
      .map(([network, url]) => ({
        network: String(network || "").trim().toLowerCase(),
        url: String(url || "").trim()
      }))
      .filter((item) => item.network && item.url);
  }

  function isSupportedCustomLinkIcon(value) {
    const source = String(value || "").trim();
    if (!source) return false;
    if (source.toLowerCase().startsWith("data:image/")) return true;
    const path = source.startsWith("/")
      ? source
      : (() => {
          try {
            const parsed = new URL(source);
            if (!/^https?:$/i.test(parsed.protocol)) return "";
            return parsed.pathname || "";
          } catch (_error) {
            return "";
          }
        })();
    const loweredPath = String(path || "").toLowerCase();
    return [".svg", ".png", ".webp", ".gif", ".jpg", ".jpeg"].some((ext) => loweredPath.endsWith(ext));
  }

  function normalizeCustomLinks(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => ({
        label: String(item?.label || item?.title || item?.name || "").trim(),
        url: String(item?.url || item?.href || item?.destination || "").trim(),
        icon_url: String(item?.icon_url || item?.iconUrl || item?.icon || item?.image_url || item?.imageUrl || item?.image || "").trim(),
      }))
      .filter((item) => item.label && item.url)
      .slice(0, 8);
  }

  function resolveCustomLinkIcon(item) {
    return isSupportedCustomLinkIcon(item?.icon_url) ? item.icon_url : CUSTOM_LINK_FALLBACK_ICON;
  }

  function applyImageFallback(image, fallback) {
    if (!(image instanceof HTMLImageElement) || !fallback) return;
    image.addEventListener("error", () => {
      if (image.src === fallback) return;
      image.src = fallback;
    }, { once: true });
  }

  function toTitle(value) {
    return String(value || "")
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function roleLabel(value) {
    const role = String(value || "").trim().toLowerCase();
    if (role.includes("admin")) return "Admin";
    if (role.includes("creator")) return "Creator";
    return "Public";
  }

  function tierLabel(value) {
    const tier = String(value || "").trim().toLowerCase();
    return tier ? tier.toUpperCase() : "";
  }

  function normalizeFindmeBadges(value, accountType, tier) {
    const normalize = window.StreamSuitesMembersUi?.normalizeAuthoritativeBadges;
    if (typeof normalize === "function") {
      return normalize(value, accountType, tier);
    }
    return Array.isArray(value) ? value : [];
  }

  function badgeIconPath(key) {
    const normalized = String(key || "").trim().toLowerCase();
    const map = {
      admin: "/assets/icons/tierbadge-admin.svg",
      core: "/assets/icons/tierbadge-core.svg",
      gold: "/assets/icons/tierbadge-gold.svg",
      pro: "/assets/icons/tierbadge-pro.svg",
      founder: "/assets/icons/founder-gold.svg"
    };
    return map[normalized] || "";
  }

  function buildBadgeStrip(profile) {
    const badges = Array.isArray(profile?.badges) ? profile.badges : [];
    if (!badges.length) return null;
    const row = create("span", "creator-badges ss-role-badges fmh-badge-strip");
    badges.forEach((badge) => {
      const iconPath = badgeIconPath(badge?.key || badge?.value);
      if (!iconPath) return;
      const icon = create("img", "badge-icon");
      icon.src = iconPath;
      icon.alt = String(badge?.label || badge?.title || badge?.key || badge?.value || "badge").trim();
      icon.classList.add(["core", "gold", "pro"].includes(String(badge?.key || badge?.value || "").trim().toLowerCase()) ? "badge-icon-tier" : "badge-icon-role");
      row.appendChild(icon);
    });
    return row.childNodes.length ? row : null;
  }

  function copyText(value, button) {
    const text = String(value || "").trim();
    if (!text) return Promise.resolve(false);
    const write = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(text)
      : Promise.reject(new Error("Clipboard unavailable"));
    return write.then(() => {
      button.classList.add("is-copied");
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        button.textContent = "Copy";
      }, 1200);
      return true;
    }).catch(() => false);
  }

  function updateDirectoryStateUrl(state) {
    const next = new URL(window.location.href);
    if (state.query) next.searchParams.set("q", state.query);
    else next.searchParams.delete("q");

    if (state.letter && state.letter !== "all") next.searchParams.set("letter", state.letter);
    else next.searchParams.delete("letter");

    if (state.view && state.view !== "gallery") next.searchParams.set("view", state.view);
    else next.searchParams.delete("view");

    window.history.replaceState({}, "", `${next.pathname}${next.search}${next.hash}`);
  }

  function getInitialDirectoryState() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view") === "list" ? "list" : "gallery";
    const query = String(params.get("q") || "").trim();
    const rawLetter = String(params.get("letter") || "all").trim().toUpperCase();
    const letter = rawLetter === "ALL" ? "all" : /^[A-Z]$/.test(rawLetter) ? rawLetter : "all";
    return { query, letter, view };
  }

  function toSharePath(profile) {
    const shareUrl = String(profile?.findmehere_share_url || "").trim();
    if (shareUrl) return shareUrl;
    return `${FINDMEHERE_HOME}/${encodeURIComponent(profile.slug)}`;
  }

  function getPrimaryPlatforms(profile) {
    return profile.social_links.slice(0, 3).map((item) => toTitle(item.network));
  }

  function buildLivePlatformSummary(profile) {
    const items = [];
    const liveStatus = getLiveStatus(profile);
    if (liveStatus?.providerLabel) items.push(liveStatus.providerLabel);
    getPrimaryPlatforms(profile).forEach((item) => {
      if (!items.includes(item)) items.push(item);
    });
    return items.slice(0, 3);
  }

  async function fetchJson(path) {
    const response = await fetch(buildAppUrl(path), { cache: "no-store" });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
  }

  async function fetchDirectorySeed() {
    const payload = await fetchJson(DIRECTORY_SEED_PATH);
    return Array.isArray(payload?.items) ? payload.items : [];
  }

  async function fetchLiveStatusMap() {
    const helper = window.StreamSuitesMembersData?.loadAuthoritativeLiveMaps;
    if (typeof helper === "function") {
      try {
        return await helper();
      } catch (_error) {
        // Fall through to the local compatibility path.
      }
    }

    try {
      const payload = await fetchJson(LIVE_STATUS_PATH);
      return {
        liveStatusPayload: payload,
        rumbleDiscoveryPayload: null,
        rumbleDiscoveryMap: new Map(),
        liveStatusMap: buildLiveStatusMap(payload)
      };
    } catch (_error) {
      return {
        liveStatusPayload: EMPTY_LIVE_STATUS_SNAPSHOT,
        rumbleDiscoveryPayload: null,
        rumbleDiscoveryMap: new Map(),
        liveStatusMap: buildLiveStatusMap(EMPTY_LIVE_STATUS_SNAPSHOT)
      };
    }
  }

  async function fetchPublicProfile(slug) {
    const endpoint = buildAppUrl(PUBLIC_PROFILE_ENDPOINT);
    endpoint.searchParams.set("slug", slug);
    const response = await fetch(endpoint.toString(), {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Profile request failed (${response.status})`);
    const payload = await response.json();
    return payload?.profile && typeof payload.profile === "object" ? payload.profile : payload;
  }

  function normalizeSeedProfile(item) {
    const accountType = String(item?.account_type || "").trim() || (String(item?.role || "").toLowerCase().includes("admin") ? "ADMIN" : String(item?.role || "").toLowerCase().includes("creator") ? "CREATOR" : "PUBLIC");
    const tier = String(item?.tier || "").trim() || "core";
    return {
      slug: normalizeSlug(item?.public_slug || item?.slug),
      public_slug: normalizeSlug(item?.public_slug || item?.slug),
      slug_aliases: Array.isArray(item?.slug_aliases) ? item.slug_aliases.map((value) => normalizeSlug(value)).filter(Boolean) : [],
      user_code: String(item?.user_code || "").trim(),
      display_name: String(item?.display_name || item?.public_slug || "").trim(),
      avatar_url: String(item?.avatar_url || "").trim(),
      role: String(item?.role || "").trim(),
      account_type: accountType,
      tier,
      badges: normalizeFindmeBadges(item?.findmehere_badges || item?.findmehereBadges || item?.badges, accountType, tier),
      account_status: String(item?.account_status || item?.status || "").trim().toLowerCase(),
      streamsuites_profile_url: String(item?.streamsuites_profile_url || "").trim(),
      findmehere_enabled: item?.findmehere_enabled === false ? false : true,
      findmehere_eligible: item?.findmehere_eligible === false ? false : Boolean(normalizeSlug(item?.public_slug || item?.slug)),
      findmehere_share_url: String(item?.findmehere_share_url || "").trim()
    };
  }

  function normalizeProfileRenderOptions(profile, fallback = null) {
    const themeSources = [
      profile?.findmehere_theme,
      profile?.findmehereTheme,
      profile?.public_theme,
      profile?.publicTheme,
      profile?.theme,
      profile?.profile_theme,
      profile?.profileTheme,
      profile?.appearance,
      fallback?.findmehere_theme,
      fallback?.findmehereTheme,
      fallback?.public_theme,
      fallback?.publicTheme,
      fallback?.theme,
      fallback?.profile_theme,
      fallback?.profileTheme,
      fallback?.appearance
    ].filter((value) => value && typeof value === "object");
    const firstTheme = themeSources[0] || {};
    const headerBrandSources = themeSources
      .flatMap((theme) => [theme?.header_branding, theme?.headerBranding, theme?.branding, theme?.brand])
      .filter((value) => value && typeof value === "object");
    const firstHeaderBrand = headerBrandSources[0] || {};
    const imageSettings = themeSources
      .flatMap((theme) => [theme?.image_visibility, theme?.imageVisibility, theme?.images])
      .filter((value) => value && typeof value === "object");
    const firstImageSettings = imageSettings[0] || {};
    const advancedSources = themeSources
      .flatMap((theme) => [theme?.advanced, theme?.customization, theme?.custom])
      .filter((value) => value && typeof value === "object");
    const firstAdvanced = advancedSources[0] || {};

    return {
      headerBranding: {
        logoImageUrl: pickFirstString(
          firstHeaderBrand.logo_image_url,
          firstHeaderBrand.logoImageUrl,
          firstHeaderBrand.logo_url,
          firstHeaderBrand.logoUrl,
          firstHeaderBrand.brand_image_url,
          firstHeaderBrand.brandImageUrl,
          firstHeaderBrand.image,
          firstTheme.header_logo_image_url,
          firstTheme.headerLogoImageUrl,
          profile?.header_logo_image_url,
          profile?.headerLogoImageUrl
        ),
        brandText: pickFirstString(
          firstHeaderBrand.brand_text,
          firstHeaderBrand.brandText,
          firstHeaderBrand.text,
          firstTheme.header_brand_text,
          firstTheme.headerBrandText,
          profile?.header_brand_text,
          profile?.headerBrandText
        )
      },
      accentColor: normalizeThemeColor(
        pickFirstString(
          firstTheme.page_accent_color,
          firstTheme.pageAccentColor,
          firstTheme.accent_color,
          firstTheme.accentColor,
          profile?.page_accent_color,
          profile?.pageAccentColor
        )
      ),
      buttonColor: normalizeThemeColor(
        pickFirstString(
          firstTheme.button_color,
          firstTheme.buttonColor,
          firstTheme.button_accent_color,
          firstTheme.buttonAccentColor,
          profile?.button_color,
          profile?.buttonColor
        )
      ),
      buttonTone: normalizePreset(
        pickFirstString(
          firstTheme.button_tone,
          firstTheme.buttonTone,
          profile?.button_tone,
          profile?.buttonTone
        ),
        new Set(["brand", "soft", "ghost"]),
        "brand"
      ),
      fontPreset: normalizePreset(
        pickFirstString(
          firstTheme.font_style,
          firstTheme.fontStyle,
          firstTheme.font_preset,
          firstTheme.fontPreset,
          profile?.font_style,
          profile?.fontStyle
        ),
        new Set(["default", "editorial", "condensed", "mono"]),
        "default"
      ),
      layoutPreset: normalizePreset(
        pickFirstString(
          firstTheme.layout_preset,
          firstTheme.layoutPreset,
          profile?.layout_preset,
          profile?.layoutPreset
        ),
        new Set(["standard", "condensed", "expanded"]),
        "standard"
      ),
      imageVisibility: {
        showCover: normalizeVisibilityToggle(
          firstImageSettings.show_cover,
          firstImageSettings.showCover,
          firstTheme.show_cover_image,
          firstTheme.showCoverImage,
          profile?.show_cover_image,
          profile?.showCoverImage
        ),
        showAvatar: normalizeVisibilityToggle(
          firstImageSettings.show_avatar,
          firstImageSettings.showAvatar,
          firstTheme.show_avatar_image,
          firstTheme.showAvatarImage,
          profile?.show_avatar_image,
          profile?.showAvatarImage
        ),
        showBackground: normalizeVisibilityToggle(
          firstImageSettings.show_background,
          firstImageSettings.showBackground,
          firstTheme.show_background_image,
          firstTheme.showBackgroundImage,
          profile?.show_background_image,
          profile?.showBackgroundImage
        )
      },
      customCss: pickFirstString(
        firstAdvanced.profile_custom_css,
        firstAdvanced.profileCustomCss,
        firstTheme.profile_custom_css,
        firstTheme.profileCustomCss,
        firstTheme.custom_css,
        firstTheme.customCss,
        profile?.profile_custom_css,
        profile?.profileCustomCss
      )
    };
  }

  function normalizePublicProfile(profile, fallback = null, liveStatusMap = null) {
    const slug = normalizeSlug(
      profile?.public_slug ||
      profile?.slug ||
      profile?.username ||
      fallback?.public_slug ||
      fallback?.slug
    );
    const explicitListed = profile?.is_listed;
    const explicitEnabled = profile?.findmehere_enabled;
    const explicitEligible = profile?.findmehere_eligible;
    const hasCanonicalSlug = Boolean(slug);
    const accountType = String(profile?.account_type || fallback?.account_type || "").trim() || (String(profile?.role || fallback?.role || "").toLowerCase().includes("admin") ? "ADMIN" : String(profile?.role || fallback?.role || "").toLowerCase().includes("creator") ? "CREATOR" : "PUBLIC");
    const tier = String(profile?.tier || fallback?.tier || "").trim();
    return {
      slug,
      public_slug: slug,
      slug_aliases: Array.isArray(profile?.slug_aliases) ? profile.slug_aliases.map((item) => normalizeSlug(item)).filter(Boolean) : [],
      user_code: String(profile?.user_code || fallback?.user_code || "").trim(),
      display_name: String(profile?.display_name || fallback?.display_name || slug).trim() || slug,
      avatar_url: String(profile?.avatar_url || profile?.avatar || fallback?.avatar_url || fallback?.avatar || "").trim(),
      tier,
      role: String(profile?.role || fallback?.role || "").trim(),
      account_type: accountType,
      badges: normalizeFindmeBadges(
        profile?.findmehere_badges || profile?.findmehereBadges || profile?.badges || fallback?.findmehere_badges || fallback?.findmehereBadges || fallback?.badges,
        accountType,
        tier
      ),
      bio: String(profile?.bio || "").trim(),
      cover_image_url: pickFirstString(profile?.cover_image_url, profile?.banner_image_url, fallback?.cover_image_url, fallback?.banner_image_url) || FALLBACK_COVER,
      background_image_url: pickFirstString(profile?.background_image_url, fallback?.background_image_url),
      social_links: normalizeSocialLinks(profile?.social_links),
      custom_links: normalizeCustomLinks(profile?.custom_links || profile?.customLinks || fallback?.custom_links || fallback?.customLinks),
      is_listed: explicitListed === false ? false : profile?.listed === false ? false : profile?.community_listed === false ? false : true,
      is_anonymous: profile?.is_anonymous === true,
      account_status: String(profile?.account_status || profile?.status || fallback?.account_status || "").trim().toLowerCase(),
      streamsuites_profile_url: String(profile?.streamsuites_profile_url || fallback?.streamsuites_profile_url || "").trim(),
      findmehere_enabled: explicitEnabled === false ? false : true,
      findmehere_eligible: explicitEligible === false ? false : explicitEligible === true ? true : hasCanonicalSlug,
      findmehere_share_url: String(profile?.findmehere_share_url || fallback?.findmehere_share_url || (hasCanonicalSlug ? `${window.location.origin}/${slug}` : "")).trim(),
      can_edit: profile?.can_edit === true,
      live_status: mergeLiveStatuses(resolveLiveStatus(profile, liveStatusMap), resolveLiveStatus(fallback, liveStatusMap)),
      render_theme: normalizeProfileRenderOptions(profile, fallback)
    };
  }

  function isEligibleProfile(profile) {
    return Boolean(
      profile &&
      profile.slug &&
      (!profile.account_status || profile.account_status === "active") &&
      profile.findmehere_eligible === true &&
      profile.findmehere_enabled !== false &&
      profile.is_listed !== false
    );
  }

  function matchesAlphabet(profile, letter) {
    if (!letter || letter === "all") return true;
    return String(profile?.display_name || profile?.slug || "").trim().toUpperCase().startsWith(letter);
  }

  function matchesQuery(profile, query) {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return true;
    const liveStatus = getLiveStatus(profile);
    const haystack = [
      profile.display_name,
      profile.slug,
      profile.bio,
      profile.role,
      profile.account_type,
      profile.tier,
      liveStatus?.providerLabel,
      liveStatus?.title,
      ...profile.social_links.map((item) => `${item.network} ${item.url}`),
      ...profile.custom_links.map((item) => `${item.label} ${item.url}`)
    ].join(" ").toLowerCase();
    return haystack.includes(needle);
  }

  function sortProfiles(profiles) {
    return [...profiles].sort((left, right) => {
      const nameCompare = String(left.display_name || left.slug).localeCompare(String(right.display_name || right.slug));
      if (nameCompare !== 0) return nameCompare;
      return String(left.slug).localeCompare(String(right.slug));
    });
  }

  function sortLiveProfiles(profiles) {
    return [...profiles].sort((left, right) => {
      const leftLive = getLiveStatus(left);
      const rightLive = getLiveStatus(right);
      const leftViewers = leftLive?.viewerCount ?? -1;
      const rightViewers = rightLive?.viewerCount ?? -1;
      if (rightViewers !== leftViewers) return rightViewers - leftViewers;

      const leftChecked = Date.parse(leftLive?.lastCheckedAt || "") || 0;
      const rightChecked = Date.parse(rightLive?.lastCheckedAt || "") || 0;
      if (rightChecked !== leftChecked) return rightChecked - leftChecked;

      const leftStarted = Date.parse(leftLive?.startedAt || "") || 0;
      const rightStarted = Date.parse(rightLive?.startedAt || "") || 0;
      if (rightStarted !== leftStarted) return rightStarted - leftStarted;

      return String(left.display_name || left.slug).localeCompare(String(right.display_name || right.slug));
    });
  }

  function scoreLiveProfileIdentity(profile) {
    const normalizedName = normalizeSlug(profile?.display_name || "");
    const normalizedSlug = normalizeSlug(profile?.slug || "");
    let score = 0;
    if (normalizedName && normalizedSlug === normalizedName) score += 4;
    if (profile?.streamsuites_profile_url) score += 2;
    if (profile?.bio) score += 1;
    if (Array.isArray(profile?.social_links) && profile.social_links.length) score += 1;
    if (Array.isArray(profile?.custom_links) && profile.custom_links.length) score += 1;
    return score;
  }

  function dedupeLiveProfiles(profiles) {
    const map = new Map();
    profiles.forEach((profile) => {
      const liveStatus = getLiveStatus(profile);
      const key = [
        String(profile?.display_name || "").trim().toLowerCase(),
        String(liveStatus?.provider || "").trim().toLowerCase(),
        String(liveStatus?.title || "").trim().toLowerCase()
      ].join("|");
      const existing = map.get(key);
      if (!existing || scoreLiveProfileIdentity(profile) > scoreLiveProfileIdentity(existing)) {
        map.set(key, profile);
      }
    });
    return [...map.values()];
  }

  function resolveHeaderBranding(pageContext = {}) {
    const profile = pageContext.profile;
    const theme = profile?.render_theme;
    const logoImageUrl = pickFirstString(theme?.headerBranding?.logoImageUrl);
    const brandText = pickFirstString(theme?.headerBranding?.brandText);
    const isProfileOverride = pageContext.page === "profile" && Boolean(logoImageUrl || brandText);
    return {
      href: isProfileOverride && profile?.slug ? `/${encodeURIComponent(profile.slug)}` : "/",
      logoImageUrl,
      brandText,
      isProfileOverride
    };
  }

  function buildDefaultBrandNode() {
    const brand = create("a", "fmh-brand");
    brand.href = "/";

    const brandWordmark = create("img", "fmh-brand-wordmark");
    brandWordmark.src = FMH_WORDMARK_BLOCK_LOGO;
    brandWordmark.alt = "FindMeHere";
    brandWordmark.decoding = "async";

    const brandIcon = create("img", "fmh-brand-icon");
    brandIcon.src = FMH_ICON_LOGO;
    brandIcon.alt = "FindMeHere";
    brandIcon.decoding = "async";

    brand.append(brandWordmark, brandIcon);
    return brand;
  }

  function buildProfileBrandNode(branding, profile) {
    const brand = create("a", "fmh-brand fmh-brand-profile");
    brand.href = branding.href;
    brand.title = profile?.display_name ? `${profile.display_name} profile` : "Profile";

    const fallbackIcon = create("img", "fmh-brand-icon");
    fallbackIcon.src = FMH_ICON_LOGO;
    fallbackIcon.alt = "FindMeHere";
    fallbackIcon.decoding = "async";
    brand.appendChild(fallbackIcon);

    const lockup = create("span", "fmh-brand-profile-lockup");
    if (branding.logoImageUrl) {
      const logo = create("img", "fmh-brand-profile-image");
      logo.src = branding.logoImageUrl;
      logo.alt = branding.brandText || `${profile?.display_name || "Creator"} brand`;
      logo.decoding = "async";
      lockup.appendChild(logo);
    }
    if (branding.brandText) {
      lockup.appendChild(create("span", "fmh-brand-profile-text", branding.brandText));
    }
    brand.appendChild(lockup);
    return brand;
  }

  function buildUiIcon(pathData, className, viewBox) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    return svg;
  }

  function buildTopbar(pageContext = {}) {
    const bar = create("header", "fmh-topbar");
    const authState = pageContext.authState || getDefaultAuthState();
    const branding = resolveHeaderBranding(pageContext);
    const brand = branding.isProfileOverride
      ? buildProfileBrandNode(branding, pageContext.profile)
      : buildDefaultBrandNode();
    if (branding.isProfileOverride) {
      bar.dataset.branding = "profile";
    }

    const actions = create("div", "fmh-topbar-actions");
    const live = create("a", "fmh-button fmh-button-primary", "Live now");
    live.href = "/live";

    const streamSuites = create("a", "fmh-link-button fmh-icon-button", "");
    streamSuites.href = STREAMSUITES_HOME;
    streamSuites.target = "_blank";
    streamSuites.rel = "noopener noreferrer";
    streamSuites.setAttribute("aria-label", "Open StreamSuites");
    streamSuites.setAttribute("title", "Open StreamSuites");
    streamSuites.dataset.iconSource = STREAMSUITES_ICON;
    const streamSuitesIcon = buildUiIcon(STREAMSUITES_ICON_PATH, "fmh-button-icon fmh-button-icon-streamsuites", "0 0 1500 1500");
    streamSuites.appendChild(streamSuitesIcon);

    const login = create("a", "fmh-link-button fmh-account-button");
    const isAuthenticated = authState?.authenticated === true;
    if (isAuthenticated) {
      login.href = "/settings/";
      login.setAttribute("aria-label", `${authState.displayName || "Account"} account`);
      login.setAttribute("title", authState.displayName || "Account");
    } else {
      login.href = `${STREAMSUITES_HOME}/public-login.html`;
      login.target = "_blank";
      login.rel = "noopener noreferrer";
      login.setAttribute("aria-label", "Login");
      login.setAttribute("title", "Login");
    }
    const loginAvatar = create("span", "fmh-account-avatar");
    if (isAuthenticated && authState.avatarUrl) {
      loginAvatar.classList.add("has-image");
      const avatarImage = create("img");
      avatarImage.src = authState.avatarUrl;
      avatarImage.alt = "";
      avatarImage.decoding = "async";
      avatarImage.setAttribute("aria-hidden", "true");
      loginAvatar.appendChild(avatarImage);
    } else {
      loginAvatar.classList.add("is-fallback");
      login.dataset.iconSource = PROFILE_ICON;
      const fallbackAvatar = buildUiIcon(PROFILE_ICON_PATH, "fmh-button-icon fmh-button-icon-profile", "0 0 2134 2134");
      loginAvatar.appendChild(fallbackAvatar);
    }
    login.append(loginAvatar, create("span", "fmh-account-label", "Login"));

    const themeToggle = create("button", "fmh-link-button fmh-theme-toggle");
    const currentTheme = getActiveTheme();
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    themeToggle.type = "button";
    themeToggle.setAttribute("role", "switch");
    themeToggle.setAttribute("data-fmh-theme-toggle", "");
    themeToggle.setAttribute("aria-checked", currentTheme === "light" ? "true" : "false");
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    themeToggle.setAttribute("title", `Switch to ${nextTheme} mode`);
    themeToggle.dataset.themeCurrent = currentTheme;
    themeToggle.dataset.themeNext = nextTheme;
    const toggleTrack = create("span", "fmh-theme-toggle-track");
    toggleTrack.setAttribute("aria-hidden", "true");
    toggleTrack.append(
      create("span", "fmh-theme-toggle-icon fmh-theme-toggle-icon-sun"),
      create("span", "fmh-theme-toggle-icon fmh-theme-toggle-icon-moon"),
      (() => {
        const thumb = create("span", "fmh-theme-toggle-thumb");
        thumb.appendChild(create("span", "fmh-theme-toggle-thumb-core"));
        return thumb;
      })()
    );
    themeToggle.appendChild(toggleTrack);
    themeToggle.addEventListener("click", toggleTheme);

    actions.append(streamSuites, login, themeToggle, live);
    bar.append(brand, actions);
    return bar;
  }

  function buildFooter() {
    const shell = create("footer", "fmh-footer-shell");
    const bar = create("div", "fmh-footer-bar");

    const left = create("div", "fmh-footer-cluster");
    const links = create("div", "fmh-footer-links");
    [
      ["/", "Directory"],
      ["/live", "Live"],
      [STREAMSUITES_HOME, "StreamSuites"]
    ].forEach(([href, label]) => {
      const link = create("a", "fmh-footer-link", label);
      link.href = href;
      if (/^https?:\/\//i.test(href)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      links.appendChild(link);
    });
    left.appendChild(links);

    const meta = create("div", "fmh-footer-meta");
    meta.append(
      create("span", "", "FindMeHere public directory"),
      create("span", "", "Powered by StreamSuites")
    );

    bar.append(left, meta);
    shell.appendChild(bar);
    return shell;
  }

  function buildDirectoryHeroRoster(profiles) {
    const liveProfiles = sortLiveProfiles(profiles.filter((profile) => getLiveStatus(profile)));
    const liveSlugs = new Set(liveProfiles.map((profile) => profile.slug));
    const remainder = sortProfiles(profiles.filter((profile) => !liveSlugs.has(profile.slug)));
    return [...liveProfiles, ...remainder];
  }

  function buildShowcaseSlide(profile) {
    const theme = profile.render_theme || {};
    const liveStatus = getLiveStatus(profile);
    const slide = create("article", "fmh-showcase-slide");
    const media = create("div", "fmh-showcase-media");
    media.style.setProperty("--fmh-showcase-image", `url("${profile.cover_image_url || FALLBACK_COVER}")`);
    if (theme.accentColor) {
      media.style.setProperty("--fmh-showcase-accent", theme.accentColor);
    }

    const content = create("div", "fmh-showcase-content");
    const eyebrow = create("div", "fmh-showcase-eyebrow");
    eyebrow.appendChild(create("span", "fmh-chip", liveStatus ? "Live now" : "Featured creator"));
    eyebrow.appendChild(create("span", "fmh-card-url", toSharePath(profile).replace(/^https?:\/\//i, "")));

    const head = create("div", "fmh-showcase-head");
    const identity = create("div", "fmh-showcase-identity");
    identity.append(buildAvatar(profile, true));
    const copy = create("div", "fmh-showcase-copy");
    const title = create("div", "fmh-showcase-title");
    title.append(create("h2", "", profile.display_name));
    const liveBadge = buildLiveBadge(profile);
    if (liveBadge) title.appendChild(liveBadge);
    copy.append(
      title,
      create("p", "fmh-showcase-handle", `@${profile.slug}`),
      create("p", "", liveStatus?.title || profile.bio || "Open this creator's share-first FindMeHere page.")
    );
    identity.appendChild(copy);
    head.appendChild(identity);

    const rail = create("div", "fmh-showcase-rail");
    const meta = create("div", "fmh-showcase-meta");
    const badgeStrip = buildBadgeStrip(profile);
    if (badgeStrip) meta.appendChild(badgeStrip);
    [roleLabel(profile.role), tierLabel(profile.tier), ...buildLivePlatformSummary(profile)].filter(Boolean).forEach((item) => {
      meta.appendChild(create("span", "", item));
    });

    const actions = create("div", "fmh-showcase-actions");
    const openProfile = create("a", "fmh-button fmh-button-primary", "Open FindMeHere");
    openProfile.href = `/${encodeURIComponent(profile.slug)}`;
    actions.appendChild(openProfile);
    if (liveStatus?.url) {
      const watchStream = create("a", "fmh-link-button", "Watch stream");
      watchStream.href = liveStatus.url;
      watchStream.target = "_blank";
      watchStream.rel = "noopener noreferrer";
      actions.appendChild(watchStream);
    } else if (profile.streamsuites_profile_url) {
      const openStreamSuites = create("a", "fmh-link-button", "Open StreamSuites");
      openStreamSuites.href = profile.streamsuites_profile_url;
      openStreamSuites.target = "_blank";
      openStreamSuites.rel = "noopener noreferrer";
      actions.appendChild(openStreamSuites);
    }

    rail.append(meta, actions);
    head.appendChild(rail);
    content.append(eyebrow, head);
    media.appendChild(content);
    slide.appendChild(media);
    return slide;
  }

  function buildDirectoryShowcase(profiles) {
    const roster = buildDirectoryHeroRoster(profiles);
    const section = create("section", "fmh-showcase");
    if (!roster.length) return section;

    const viewport = create("div", "fmh-showcase-viewport");
    const track = create("div", "fmh-showcase-track");
    roster.forEach((profile) => track.appendChild(buildShowcaseSlide(profile)));
    viewport.appendChild(track);
    section.appendChild(viewport);

    let activeIndex = 0;
    const goTo = (index) => {
      activeIndex = (index + roster.length) % roster.length;
      track.style.transform = `translateX(-${activeIndex * 100}%)`;
      section.querySelectorAll("[data-fmh-showcase-dot]").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === activeIndex);
        button.setAttribute("aria-pressed", buttonIndex === activeIndex ? "true" : "false");
      });
    };

    if (roster.length > 1) {
      const chrome = create("div", "fmh-showcase-chrome");
      const arrows = create("div", "fmh-showcase-arrows");
      const previous = create("button", "fmh-link-button fmh-showcase-arrow", "Prev");
      previous.type = "button";
      previous.addEventListener("click", () => goTo(activeIndex - 1));
      const next = create("button", "fmh-link-button fmh-showcase-arrow", "Next");
      next.type = "button";
      next.addEventListener("click", () => goTo(activeIndex + 1));
      arrows.append(previous, next);

      const dots = create("div", "fmh-showcase-dots");
      roster.forEach((_profile, index) => {
        const dot = create("button", "fmh-showcase-dot");
        dot.type = "button";
        dot.setAttribute("data-fmh-showcase-dot", "");
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.addEventListener("click", () => goTo(index));
        dots.appendChild(dot);
      });
      chrome.append(arrows, dots);
      section.appendChild(chrome);

      const interval = window.setInterval(() => {
        if (!section.isConnected) {
          window.clearInterval(interval);
          return;
        }
        goTo(activeIndex + 1);
      }, 6500);
    }

    goTo(0);
    return section;
  }

  function buildDirectoryIntro(eligibleCount, liveCount) {
    const strip = create("section", "fmh-directory-intro fmh-panel");
    const copy = create("div", "fmh-discovery-copy");
    copy.append(
      create("span", "fmh-hero-kicker", "findmehere.live"),
      create("h1", "", "Discover creators through share-first public pages."),
      create("p", "", "Browse the live-priority slideshow first, then move straight into directory search, view toggles, and A-Z filters without the older bulky hero stack.")
    );

    const stats = create("div", "fmh-discovery-stats");
    [
      { value: String(liveCount), label: "Live right now" },
      { value: String(eligibleCount), label: "Eligible profiles" },
      { value: "A-Z", label: "Quick filters" },
      { value: "2 views", label: "Gallery and list" }
    ].forEach((item) => {
      const stat = create("div", "fmh-discovery-stat");
      stat.append(create("strong", "", item.value), create("span", "", item.label));
      stats.appendChild(stat);
    });

    const actions = create("div", "fmh-hero-actions");
    const browse = create("a", "fmh-button fmh-button-primary", "Browse directory");
    browse.href = "#directory";
    const live = create("a", "fmh-link-button", "See live now");
    live.href = "/live";
    actions.append(browse, live);

    strip.append(copy, stats, actions);
    return strip;
  }

  function buildSearch(query, onInput) {
    const wrap = create("div", "fmh-search-wrap");
    const shell = create("label", "fmh-search-shell");
    shell.append(create("span", "fmh-chip", "Search"));
    const input = create("input");
    input.type = "search";
    input.placeholder = "Search names, slugs, bio, or platform";
    input.value = query;
    input.addEventListener("input", () => onInput(input.value));
    shell.appendChild(input);
    wrap.appendChild(shell);
    return wrap;
  }

  function buildDirectoryCard(profile) {
    const card = create("article", "fmh-directory-card");
    const eyebrow = create("div", "fmh-card-eyebrow");
    eyebrow.append(create("span", "fmh-chip", "FindMeHere"), create("span", "fmh-card-url", toSharePath(profile).replace(/^https?:\/\//i, "")));
    const head = create("div", "fmh-card-head");
    const copy = create("div", "fmh-name-block");
    const line = create("div", "fmh-name-line");
    const titleRow = create("div", "fmh-title-row");
    titleRow.append(create("strong", "", profile.display_name));
    const liveBadge = buildLiveBadge(profile, true);
    if (liveBadge) titleRow.appendChild(liveBadge);
    line.append(titleRow, create("span", "fmh-handle", `@${profile.slug}`));
    copy.append(line, create("p", "", profile.bio || "FindMeHere share page"));
    head.append(buildAvatar(profile), copy);

    const meta = create("div", "fmh-card-meta");
    [roleLabel(profile.role), tierLabel(profile.tier), ...getPrimaryPlatforms(profile)]
      .filter(Boolean)
      .forEach((item) => meta.appendChild(create("span", "", item)));

    const footer = create("div", "fmh-card-footer");
    const share = create("span", "fmh-card-share-note", "Share-ready page");
    const link = create("a", "fmh-button fmh-button-primary", "Open FindMeHere");
    link.href = `/${encodeURIComponent(profile.slug)}`;
    footer.append(share, link);
    card.append(eyebrow, head, meta, footer);
    return card;
  }

  function buildDirectoryRow(profile) {
    const row = create("article", "fmh-directory-row");
    const head = create("div", "fmh-row-head");
    const copy = create("div", "fmh-row-copy");
    const title = create("div", "fmh-name-line");
    title.append(create("strong", "", profile.display_name));
    const liveBadge = buildLiveBadge(profile, true);
    if (liveBadge) title.appendChild(liveBadge);
    copy.append(title, create("p", "", profile.bio || `Share page for @${profile.slug}`));
    head.append(buildAvatar(profile), copy);

    const meta = create("div", "fmh-row-meta");
    [create("span", "", `@${profile.slug}`), create("span", "", roleLabel(profile.role))]
      .forEach((item) => meta.appendChild(item));
    if (profile.tier) meta.appendChild(create("span", "", tierLabel(profile.tier)));
    getPrimaryPlatforms(profile).forEach((item) => meta.appendChild(create("span", "", item)));

    const share = create("div", "fmh-row-share");
    share.append(create("span", "fmh-card-url", toSharePath(profile).replace(/^https?:\/\//i, "")));

    const link = create("a", "fmh-link-button", "Open FindMeHere");
    link.href = `/${encodeURIComponent(profile.slug)}`;
    row.append(head, meta, share, link);
    return row;
  }

  function buildLiveDirectoryCard(profile) {
    const liveStatus = getLiveStatus(profile);
    const card = create("article", "fmh-directory-card");
    const eyebrow = create("div", "fmh-card-eyebrow");
    eyebrow.append(create("span", "fmh-chip", "Live"), create("span", "fmh-card-url", toSharePath(profile).replace(/^https?:\/\//i, "")));

    const head = create("div", "fmh-card-head");
    const copy = create("div", "fmh-name-block");
    const line = create("div", "fmh-name-line");
    const titleRow = create("div", "fmh-title-row");
    titleRow.append(create("strong", "", profile.display_name));
    const liveBadge = buildLiveBadge(profile, true);
    if (liveBadge) titleRow.appendChild(liveBadge);
    line.append(titleRow, create("span", "fmh-handle", `@${profile.slug}`));
    copy.append(line, create("p", "", liveStatus?.title || profile.bio || "FindMeHere live listing"));
    head.append(buildAvatar(profile), copy);

    const meta = create("div", "fmh-card-meta");
    buildLivePlatformSummary(profile).forEach((item) => meta.appendChild(create("span", "", item)));
    if (liveStatus?.viewerCount != null) meta.appendChild(create("span", "", `${liveStatus.viewerCount.toLocaleString()} watching`));

    const footer = create("div", "fmh-card-footer");
    const share = create("span", "fmh-card-share-note", liveStatus?.lastCheckedAt ? `Checked ${new Date(liveStatus.lastCheckedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Authoritative live snapshot");
    const actions = create("div", "fmh-live-actions");
    const link = create("a", "fmh-button fmh-button-primary", "Open FindMeHere");
    link.href = `/${encodeURIComponent(profile.slug)}`;
    actions.appendChild(link);
    if (liveStatus?.url) {
      const watch = create("a", "fmh-link-button", "Watch stream");
      watch.href = liveStatus.url;
      watch.target = "_blank";
      watch.rel = "noopener noreferrer";
      actions.appendChild(watch);
    }
    footer.append(share, actions);
    card.append(eyebrow, head, meta, footer);
    return card;
  }

  function buildLiveDirectoryRow(profile) {
    const liveStatus = getLiveStatus(profile);
    const row = create("article", "fmh-directory-row");
    const head = create("div", "fmh-row-head");
    const copy = create("div", "fmh-row-copy");
    const title = create("div", "fmh-name-line");
    title.append(create("strong", "", profile.display_name), create("span", "fmh-handle", `@${profile.slug}`));
    const liveBadge = buildLiveBadge(profile, true);
    if (liveBadge) title.appendChild(liveBadge);
    copy.append(title, create("p", "", liveStatus?.title || profile.bio || `Live on ${liveStatus?.providerLabel || "FindMeHere"}`));
    head.append(buildAvatar(profile), copy);

    const meta = create("div", "fmh-row-meta");
    buildLivePlatformSummary(profile).forEach((item) => meta.appendChild(create("span", "", item)));
    if (liveStatus?.viewerCount != null) meta.appendChild(create("span", "", `${liveStatus.viewerCount.toLocaleString()} watching`));

    const share = create("div", "fmh-row-share");
    share.append(create("span", "fmh-card-url", toSharePath(profile).replace(/^https?:\/\//i, "")));

    const actions = create("div", "fmh-live-actions");
    const link = create("a", "fmh-link-button", "Open FindMeHere");
    link.href = `/${encodeURIComponent(profile.slug)}`;
    actions.appendChild(link);
    if (liveStatus?.url) {
      const watch = create("a", "fmh-link-button", "Watch stream");
      watch.href = liveStatus.url;
      watch.target = "_blank";
      watch.rel = "noopener noreferrer";
      actions.appendChild(watch);
    }

    row.append(head, meta, share, actions);
    return row;
  }

  function buildUnavailableState(reason, slug, authState) {
    setMeta("Profile unavailable | FindMeHere", "This FindMeHere route is unavailable because the profile is not listed or cannot be shown on FindMeHere.");
    setCanonical(slug ? `/${encodeURIComponent(slug)}` : "/");

    const { shell, main } = buildShellFrame({ page: "unavailable", authState });

    const route = create("section", "fmh-profile-route");
    const card = create("div", "fmh-panel fmh-unavailable-card");
    card.append(
      create("span", "fmh-profile-kicker", "Unavailable"),
      create("h1", "", "This profile is not currently listed on FindMeHere."),
      create("p", "", reason || (slug ? `The route /${slug} exists, but this creator is not currently available as a public FindMeHere listing.` : "The requested profile could not be shown on FindMeHere.")),
      create("p", "", "FindMeHere only shows creators who have an active public listing for this share-first surface.")
    );

    const actions = create("div", "fmh-unavailable-actions");
    const home = create("a", "fmh-button fmh-button-primary", "Back to directory");
    home.href = "/";
    const streamSuites = create("a", "fmh-link-button", "Open StreamSuites");
    streamSuites.href = STREAMSUITES_HOME;
    streamSuites.target = "_blank";
    streamSuites.rel = "noopener noreferrer";
    actions.append(home, streamSuites);
    card.appendChild(actions);
    route.appendChild(card);
    main.appendChild(route);
    return shell;
  }

  function renderDirectory(root, state) {
    const eligibleProfiles = sortProfiles(state.profiles.filter(isEligibleProfile));
    const filtered = eligibleProfiles.filter((profile) => matchesAlphabet(profile, state.letter) && matchesQuery(profile, state.query));
    const liveCount = eligibleProfiles.filter((profile) => getLiveStatus(profile)).length;

    setMeta("FindMeHere Directory | Share-first creator profiles", "Browse the FindMeHere directory, filter creators by name, and open standalone share pages backed by StreamSuites profile data.");
    setCanonical("/");
    updateDirectoryStateUrl(state);

    const { shell, main } = buildShellFrame({ page: "directory", authState: state.authState });
    main.append(buildDirectoryIntro(eligibleProfiles.length, liveCount), buildDirectoryShowcase(eligibleProfiles));

    const section = create("section", "");
    section.id = "directory";

    const toolbar = create("div", "fmh-directory-toolbar");
    const title = create("div", "fmh-section-title");
    title.append(create("span", "", "Directory"), create("h2", "", "Eligible FindMeHere profiles"));
    const summary = create("p", "");
    summary.innerHTML = `<span class="fmh-result-summary"><strong>${filtered.length}</strong> of ${eligibleProfiles.length} visible</span>`;
    title.appendChild(summary);
    toolbar.appendChild(title);

    const controls = create("div", "fmh-directory-controls");
    const search = buildSearch(state.query, (nextQuery) => {
      state.query = nextQuery;
      renderDirectory(root, state);
    });
    const searchInput = search.querySelector("input");
    const searchActions = create("div", "fmh-search-actions");
    if (state.query) {
      const clearButton = create("button", "fmh-link-button", "Clear");
      clearButton.type = "button";
      clearButton.addEventListener("click", () => {
        state.query = "";
        renderDirectory(root, state);
      });
      searchActions.appendChild(clearButton);
    }
    const searchHint = create("span", "fmh-search-hint", state.query ? `Filtering for "${state.query}"` : "Search names, slugs, bios, and primary platforms");
    searchActions.appendChild(searchHint);
    search.appendChild(searchActions);
    controls.appendChild(search);

    const actions = create("div", "fmh-directory-actions");
    const viewToggle = create("div", "fmh-view-toggle");
    [["gallery", "Gallery"], ["list", "List"]].forEach(([value, label]) => {
      const button = create("button", state.view === value ? "is-active" : "", label);
      button.type = "button";
      button.addEventListener("click", () => {
        state.view = value;
        renderDirectory(root, state);
      });
      viewToggle.appendChild(button);
    });

    const alpha = create("div", "fmh-alpha");
    [["all", "All"], ...Array.from({ length: 26 }, (_, index) => {
      const letter = String.fromCharCode(65 + index);
      return [letter, letter];
    })].forEach(([value, label]) => {
      const button = create("button", state.letter === value ? "is-active" : "", label);
      button.type = "button";
      button.addEventListener("click", () => {
        state.letter = value;
        renderDirectory(root, state);
      });
      alpha.appendChild(button);
    });

    actions.append(viewToggle, alpha);
    controls.appendChild(actions);
    toolbar.appendChild(controls);
    section.appendChild(toolbar);

    const active = create("div", "fmh-active-filters");
    active.appendChild(create("span", "fmh-chip", state.view === "gallery" ? "Gallery view" : "List view"));
    if (state.letter !== "all") active.appendChild(create("span", "fmh-chip", `Letter ${state.letter}`));
    if (state.query) active.appendChild(create("span", "fmh-chip", `Search: ${state.query}`));
    if (state.query || state.letter !== "all" || state.view !== "gallery") {
      const reset = create("button", "fmh-link-button", "Reset filters");
      reset.type = "button";
      reset.addEventListener("click", () => {
        state.query = "";
        state.letter = "all";
        state.view = "gallery";
        renderDirectory(root, state);
      });
      active.appendChild(reset);
    }
    section.appendChild(active);

    if (!filtered.length) {
      const empty = create("div", "fmh-empty");
      empty.append(
        create("h2", "", "No FindMeHere listings match that search."),
        create("p", "", "Try another name, clear the search, or switch back to the All alphabet filter to browse the full directory.")
      );
      section.appendChild(empty);
    } else {
      const results = create("div", "fmh-results");
      results.dataset.view = state.view;
      filtered.forEach((profile) => results.appendChild(state.view === "list" ? buildDirectoryRow(profile) : buildDirectoryCard(profile)));
      section.appendChild(results);
    }

    main.appendChild(section);
    clear(root);
    root.appendChild(shell);
  }

  function renderLiveDirectory(root, state) {
    const liveProfiles = sortLiveProfiles(
      dedupeLiveProfiles(state.profiles.filter((profile) => isEligibleProfile(profile) && getLiveStatus(profile)))
    );
    const filtered = liveProfiles.filter((profile) => matchesQuery(profile, state.query));

    setMeta("FindMeHere Live | Creators live right now", "Browse creators who are currently live and eligible to appear on FindMeHere.");
    setCanonical("/live");

    const { shell, main } = buildShellFrame({ page: "live", authState: state.authState });

    const hero = create("section", "fmh-hero");
    const left = create("div", "fmh-panel fmh-hero-copy");
    left.append(
      create("span", "fmh-hero-kicker", "findmehere.live/live"),
      create("h1", "", "Live right now on FindMeHere."),
      create("p", "", "This view keeps the live surface tight: only creators who are currently live in the authoritative StreamSuites payload and still eligible for FindMeHere.")
    );
    const heroActions = create("div", "fmh-hero-actions");
    const backToDirectory = create("a", "fmh-button fmh-button-primary", "Browse directory");
    backToDirectory.href = "/";
    heroActions.appendChild(backToDirectory);
    left.appendChild(heroActions);

    const right = create("div", "fmh-panel");
    const stats = create("div", "fmh-stat-grid");
    [
      { value: String(filtered.length), label: "Eligible live listings" },
      { value: "Live only", label: "No offline profiles mixed in" },
      { value: "Authoritative", label: "Centralized live payload" },
      { value: "Share ready", label: "FindMeHere links first" }
    ].forEach((item) => {
      const card = create("div", "fmh-stat-card");
      card.append(create("strong", "", item.value), create("span", "", item.label));
      stats.appendChild(card);
    });
    right.appendChild(stats);
    hero.append(left, right);
    main.appendChild(hero);

    const section = create("section", "");
    const toolbar = create("div", "fmh-directory-toolbar");
    const title = create("div", "fmh-section-title");
    title.append(create("span", "", "Live"), create("h2", "", "FindMeHere creators live right now"));
    title.appendChild(create("p", "", filtered.length ? `${filtered.length} creator${filtered.length === 1 ? "" : "s"} currently live` : "No eligible FindMeHere creators are live right now."));
    toolbar.appendChild(title);

    const controls = create("div", "fmh-directory-controls");
    const search = buildSearch(state.query, (nextQuery) => {
      state.query = nextQuery;
      renderLiveDirectory(root, state);
    });
    const searchActions = create("div", "fmh-search-actions");
    if (state.query) {
      const clearButton = create("button", "fmh-link-button", "Clear");
      clearButton.type = "button";
      clearButton.addEventListener("click", () => {
        state.query = "";
        renderLiveDirectory(root, state);
      });
      searchActions.appendChild(clearButton);
    }
    searchActions.appendChild(create("span", "fmh-search-hint", state.query ? `Filtering live creators for "${state.query}"` : "Search live names, slugs, titles, and providers"));
    search.appendChild(searchActions);
    controls.appendChild(search);

    const actions = create("div", "fmh-directory-actions");
    const viewToggle = create("div", "fmh-view-toggle");
    [["gallery", "Gallery"], ["list", "List"]].forEach(([value, label]) => {
      const button = create("button", state.view === value ? "is-active" : "", label);
      button.type = "button";
      button.addEventListener("click", () => {
        state.view = value;
        renderLiveDirectory(root, state);
      });
      viewToggle.appendChild(button);
    });
    actions.appendChild(viewToggle);
    controls.appendChild(actions);
    toolbar.appendChild(controls);
    section.appendChild(toolbar);

    if (!filtered.length) {
      const empty = create("div", "fmh-empty");
      empty.append(
        create("h2", "", state.query ? "No live creators match that search." : "Nobody is live on FindMeHere right now."),
        create("p", "", state.query ? "Try a different search or clear the filter to see all currently live eligible creators." : "Check back later or browse the full directory to discover creators before they go live.")
      );
      section.appendChild(empty);
    } else {
      const results = create("div", "fmh-results");
      results.dataset.view = state.view;
      filtered.forEach((profile) => results.appendChild(state.view === "list" ? buildLiveDirectoryRow(profile) : buildLiveDirectoryCard(profile)));
      section.appendChild(results);
    }

    main.appendChild(section);
    clear(root);
    root.appendChild(shell);
  }

  function buildLinkItem(item) {
    const link = create("a", "fmh-social-item");
    const href = /^https?:\/\//i.test(item.url) ? item.url : `https://${item.url.replace(/^\/+/, "")}`;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(create("strong", "", toTitle(item.network)), create("p", "", href));
    return link;
  }

  function buildCustomLinkItem(item) {
    const link = create("a", "fmh-social-item fmh-social-item-custom");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const iconWrap = create("span", "fmh-social-item-icon");
    const icon = create("img");
    icon.src = resolveCustomLinkIcon(item);
    icon.alt = "";
    icon.decoding = "async";
    icon.loading = "lazy";
    applyImageFallback(icon, CUSTOM_LINK_FALLBACK_ICON);
    iconWrap.appendChild(icon);

    const copy = create("span", "fmh-social-item-copy");
    copy.append(create("strong", "", item.label), create("p", "", item.url));

    link.append(iconWrap, copy);
    return link;
  }

  // Keep advanced profile CSS on a short leash: only approved local selectors and non-layout-breaking properties.
  function buildScopedProfileCustomCss(cssText) {
    const source = String(cssText || "").trim();
    if (!source) return "";
    if (/[<]/.test(source) || /@(?:import|media|supports|layer|keyframes|font-face)/i.test(source)) {
      return "";
    }

    const selectorMap = new Map([
      [".profile-root", `[${PROFILE_PAGE_SCOPE_ATTR}]`],
      [".profile-hero", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-hero`],
      [".profile-cover", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-cover`],
      [".profile-body", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-body`],
      [".profile-summary", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-summary`],
      [".profile-avatar", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-avatar`],
      [".profile-title", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-title`],
      [".profile-meta", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-meta`],
      [".profile-about", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-about`],
      [".profile-live", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-live-banner`],
      [".profile-actions", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-actions`],
      [".profile-grid", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-grid`],
      [".profile-section", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-profile-section`],
      [".profile-links", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-social-list`],
      [".profile-social-item", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-social-item`],
      [".profile-share", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-share-box`],
      [".profile-destination", `[${PROFILE_PAGE_SCOPE_ATTR}] .fmh-destination-box`]
    ]);
    const allowedProperties = new Set([
      "background",
      "background-color",
      "background-image",
      "background-size",
      "background-position",
      "border",
      "border-color",
      "border-radius",
      "box-shadow",
      "color",
      "opacity",
      "font-family",
      "font-size",
      "font-style",
      "font-weight",
      "letter-spacing",
      "line-height",
      "text-transform",
      "text-decoration",
      "text-shadow",
      "padding",
      "padding-block",
      "padding-inline",
      "margin",
      "margin-block",
      "margin-inline",
      "gap",
      "align-items",
      "justify-content",
      "backdrop-filter",
      "filter"
    ]);
    const blocks = [];
    const pattern = /([^{}]+)\{([^{}]+)\}/g;
    let match;
    while ((match = pattern.exec(source))) {
      const selectors = match[1].split(",").map((item) => item.trim()).filter(Boolean);
      const scopedSelectors = selectors.map((selector) => selectorMap.get(selector)).filter(Boolean);
      if (!scopedSelectors.length || scopedSelectors.length !== selectors.length) continue;

      const declarations = match[2]
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const separatorIndex = entry.indexOf(":");
          if (separatorIndex <= 0) return null;
          const property = entry.slice(0, separatorIndex).trim().toLowerCase();
          const value = entry.slice(separatorIndex + 1).trim();
          if (!allowedProperties.has(property)) return null;
          if (!value || /(?:expression|javascript:|data:text\/html|@import|url\s*\(\s*['"]?\s*javascript:)/i.test(value)) return null;
          return `${property}: ${value}`;
        })
        .filter(Boolean);
      if (!declarations.length) continue;
      blocks.push(`${scopedSelectors.join(", ")} { ${declarations.join("; ")}; }`);
    }
    return blocks.join("\n");
  }

  function applyProfileRenderTheme(route, profile) {
    const theme = profile?.render_theme || {};
    route.setAttribute(PROFILE_PAGE_SCOPE_ATTR, "");
    route.dataset.layoutPreset = theme.layoutPreset || "standard";
    route.dataset.fontPreset = theme.fontPreset || "default";
    route.dataset.buttonTone = theme.buttonTone || "brand";
    if (theme.accentColor) route.style.setProperty("--fmh-profile-accent", theme.accentColor);
    if (theme.buttonColor) route.style.setProperty("--fmh-profile-button", theme.buttonColor);
    if (theme.imageVisibility?.showBackground !== false && profile.background_image_url) {
      route.classList.add("has-profile-background");
      route.style.setProperty("--fmh-profile-background-image", `url(${JSON.stringify(profile.background_image_url)})`);
    }

    const scopedCss = buildScopedProfileCustomCss(theme.customCss);
    if (scopedCss) {
      const style = document.createElement("style");
      style.setAttribute("data-fmh-profile-custom-css", profile.slug || "profile");
      style.textContent = scopedCss;
      route.appendChild(style);
    }
  }

  async function fetchFindMeHereAuthState() {
    const fetchAuthState = window.StreamSuitesMembersSession?.fetchAuthState;
    if (typeof fetchAuthState !== "function") return getDefaultAuthState();
    try {
      return await fetchAuthState();
    } catch (_error) {
      return getDefaultAuthState();
    }
  }

  function renderProfile(root, profile, requestedSlug, authState) {
    if (!isEligibleProfile(profile)) {
      clear(root);
      root.appendChild(buildUnavailableState(`/${requestedSlug} loaded, but this account is not eligible for public FindMeHere listing.`, requestedSlug, authState));
      return;
    }

    if (profile.slug && requestedSlug && profile.slug !== requestedSlug) {
      window.history.replaceState({}, "", `/${encodeURIComponent(profile.slug)}`);
    }

    setMeta(`${profile.display_name} on FindMeHere`, profile.bio || `Open ${profile.display_name}'s FindMeHere share page on findmehere.live.`);
    setCanonical(`/${encodeURIComponent(profile.slug)}`);

    const { shell, main } = buildShellFrame({ page: "profile", profile, authState });

    const route = create("section", "fmh-profile-route");
    applyProfileRenderTheme(route, profile);
    const hero = create("article", "fmh-profile-hero");
    if (profile.render_theme?.imageVisibility?.showCover !== false) {
      const cover = create("div", "fmh-profile-cover");
      const coverImage = create("img");
      coverImage.src = profile.cover_image_url || FALLBACK_COVER;
      coverImage.alt = `${profile.display_name} cover`;
      cover.appendChild(coverImage);
      hero.appendChild(cover);
    } else {
      hero.classList.add("fmh-profile-hero-no-cover");
    }

    const body = create("div", "fmh-profile-body");
    const summary = create("div", "fmh-profile-summary");
    const title = create("div", "fmh-profile-title");
    title.append(create("span", "fmh-profile-kicker", "Share page"));
    const titleRow = create("div", "fmh-profile-title-row");
    titleRow.append(create("h1", "", profile.display_name));
    const liveBadge = buildLiveBadge(profile);
    if (liveBadge) titleRow.appendChild(liveBadge);
    title.append(titleRow, create("p", "", `@${profile.slug}`));
    const meta = create("div", "fmh-profile-meta");
    const badgeStrip = buildBadgeStrip(profile);
    if (badgeStrip) meta.appendChild(badgeStrip);
    [roleLabel(profile.role), tierLabel(profile.tier), ...getPrimaryPlatforms(profile)].filter(Boolean).forEach((item) => meta.appendChild(create("span", "", item)));
    title.appendChild(meta);
    if (profile.render_theme?.imageVisibility?.showAvatar !== false) {
      summary.append(buildAvatar(profile, true), title);
    } else {
      summary.appendChild(title);
    }
    body.append(summary, create("p", "fmh-profile-about", profile.bio || "This creator has not added a short bio yet."));
    if (getLiveStatus(profile)) {
      const banner = create("div", "fmh-live-banner");
      banner.appendChild(create("span", "fmh-live-summary", buildLiveSummary(profile)));
      if (profile.live_status?.title) banner.appendChild(create("p", "fmh-live-title", profile.live_status.title));
      if (profile.live_status?.url) {
        const watch = create("a", "fmh-live-link", "Watch stream");
        watch.href = profile.live_status.url;
        watch.target = "_blank";
        watch.rel = "noopener noreferrer";
        banner.appendChild(watch);
      }
      body.appendChild(banner);
    }

    const actions = create("div", "fmh-profile-actions");
    const back = create("a", "fmh-link-button", "Back to directory");
    back.href = "/";
    actions.appendChild(back);
    if (profile.streamsuites_profile_url) {
      const fullProfile = create("a", "fmh-button", "View full StreamSuites profile");
      fullProfile.href = profile.streamsuites_profile_url;
      fullProfile.target = "_blank";
      fullProfile.rel = "noopener noreferrer";
      actions.appendChild(fullProfile);
    }
    body.appendChild(actions);
    hero.appendChild(body);
    route.appendChild(hero);

    const grid = create("div", "fmh-profile-grid");

    const left = create("section", "fmh-profile-section");
    left.appendChild(create("h2", "", "Primary links"));
    const socialList = create("div", "fmh-social-list");
    if (profile.social_links.length) {
      profile.social_links.forEach((item) => socialList.appendChild(buildLinkItem(item)));
    }
    if (profile.custom_links.length) {
      profile.custom_links.forEach((item) => socialList.appendChild(buildCustomLinkItem(item)));
    }
    if (!profile.social_links.length && !profile.custom_links.length) {
      const empty = create("div", "fmh-empty");
      empty.append(create("h2", "", "Links coming soon"), create("p", "", "This FindMeHere page is active, but no public platform links are available in the current profile payload yet."));
      socialList.appendChild(empty);
    }
    left.appendChild(socialList);

    const right = create("div", "fmh-link-stack");
    const share = create("section", "fmh-profile-section");
    share.append(create("h2", "", "Share this FindMeHere URL"));
    const shareBox = create("div", "fmh-share-box");
    shareBox.appendChild(create("p", "", "Use this FindMeHere link when sharing this profile. The full StreamSuites profile stays available separately as a secondary destination."));
    const shareRow = create("div", "fmh-share-row");
    const shareUrl = toSharePath(profile);
    shareRow.append(create("div", "fmh-share-url", shareUrl));
    const copyButton = create("button", "fmh-copy-button", "Copy");
    copyButton.type = "button";
    copyButton.addEventListener("click", () => copyText(shareUrl, copyButton));
    shareRow.appendChild(copyButton);
    shareBox.appendChild(shareRow);
    if (typeof navigator.share === "function") {
      const nativeShare = create("button", "fmh-link-button", "Share");
      nativeShare.type = "button";
      nativeShare.addEventListener("click", async () => {
        try {
          await navigator.share({
            title: `${profile.display_name} on FindMeHere`,
            text: profile.bio || `Find ${profile.display_name} on FindMeHere`,
            url: shareUrl
          });
        } catch (_error) {
          // Ignore cancelled shares.
        }
      });
      shareBox.appendChild(nativeShare);
    }
    share.appendChild(shareBox);

    const destination = create("section", "fmh-profile-section");
    destination.append(create("h2", "", "Full profile"));
    const destinationBox = create("div", "fmh-destination-box");
    destinationBox.appendChild(create("p", "", profile.streamsuites_profile_url
      ? "Need the broader StreamSuites profile with additional public details and ecosystem context?"
      : "This share page is the public FindMeHere surface for this creator."));
    if (profile.streamsuites_profile_url) {
      const fullProfile = create("a", "fmh-link-button", "View full StreamSuites profile");
      fullProfile.href = profile.streamsuites_profile_url;
      fullProfile.target = "_blank";
      fullProfile.rel = "noopener noreferrer";
      destinationBox.appendChild(fullProfile);
    } else {
      destinationBox.appendChild(create("span", "fmh-chip", "Full StreamSuites profile unavailable"));
    }
    destination.appendChild(destinationBox);

    right.append(share, destination);
    grid.append(left, right);
    route.appendChild(grid);

    main.appendChild(route);
    clear(root);
    root.appendChild(shell);
  }

  async function loadDirectoryProfiles(liveStatusMap) {
    const seed = (await fetchDirectorySeed()).map(normalizeSeedProfile).filter((item) => item.slug);
    const bySlug = new Map();
    seed.forEach((item) => {
      const normalized = normalizePublicProfile(item, item, liveStatusMap);
      if (!normalized.slug || bySlug.has(normalized.slug)) return;
      bySlug.set(normalized.slug, normalized);
    });
    return [...bySlug.values()];
  }

  async function init() {
    const root = document.getElementById("app");
    if (!root) return;
    const trackPageVisit = () => {
      void window.StreamSuitesMembersSession?.trackDirectoryPageVisit?.();
    };

    applyTheme(readStoredTheme());

    clear(root);
    root.appendChild(create("div", "fmh-loading", "Loading FindMeHere"));

    const slug = getRouteSlug();
    const liveRoute = isLiveRoute();
    const [liveData, authState] = await Promise.all([
      fetchLiveStatusMap(),
      fetchFindMeHereAuthState()
    ]);

    try {
      if (liveRoute) {
        renderLiveDirectory(root, {
          profiles: await loadDirectoryProfiles(liveData.liveStatusMap),
          authState,
          query: "",
          letter: "all",
          view: "gallery"
        });
        trackPageVisit();
        return;
      }

      if (slug) {
        renderProfile(root, normalizePublicProfile(await fetchPublicProfile(slug), { slug }, liveData.liveStatusMap), slug, authState);
        trackPageVisit();
        return;
      }

      renderDirectory(root, {
        profiles: await loadDirectoryProfiles(liveData.liveStatusMap),
        authState,
        ...getInitialDirectoryState()
      });
      trackPageVisit();
    } catch (_error) {
      clear(root);
      root.appendChild(buildUnavailableState("FindMeHere could not load the latest public profile data right now.", slug, authState));
      trackPageVisit();
    }
  }

  window.addEventListener("DOMContentLoaded", init, { once: true });
})();
