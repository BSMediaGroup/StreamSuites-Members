(() => {
  const DIRECTORY_SEED_PATH = "/data/findmehere-directory.json";
  const LIVE_STATUS_PATH = "/data/live-status.json";
  const PUBLIC_PROFILE_ENDPOINT = "/api/public/profile";
  const STREAMSUITES_HOME = "https://streamsuites.app";
  const FINDMEHERE_HOME = "https://findmehere.live";
  const FALLBACK_COVER = "/assets/placeholders/defaultprofilecover.webp";
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

  function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (!parts.length) return "FM";
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }

  function parseViewerCount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed);
  }

  function normalizeLiveStatus(raw) {
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

  function buildLiveStatusMap(payload) {
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
    try {
      return buildLiveStatusMap(await fetchJson(LIVE_STATUS_PATH));
    } catch (_error) {
      return buildLiveStatusMap(EMPTY_LIVE_STATUS_SNAPSHOT);
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
    return {
      slug: normalizeSlug(item?.public_slug || item?.slug),
      public_slug: normalizeSlug(item?.public_slug || item?.slug),
      slug_aliases: Array.isArray(item?.slug_aliases) ? item.slug_aliases.map((value) => normalizeSlug(value)).filter(Boolean) : [],
      user_code: String(item?.user_code || "").trim(),
      display_name: String(item?.display_name || item?.public_slug || "").trim(),
      avatar_url: String(item?.avatar_url || "").trim(),
      role: String(item?.role || "").trim(),
      account_type: String(item?.account_type || "").trim(),
      tier: String(item?.tier || "").trim(),
      account_status: String(item?.account_status || item?.status || "").trim().toLowerCase(),
      streamsuites_profile_url: String(item?.streamsuites_profile_url || "").trim(),
      findmehere_enabled: item?.findmehere_enabled === false ? false : true,
      findmehere_eligible: item?.findmehere_eligible === false ? false : Boolean(normalizeSlug(item?.public_slug || item?.slug)),
      findmehere_share_url: String(item?.findmehere_share_url || "").trim()
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
    return {
      slug,
      public_slug: slug,
      slug_aliases: Array.isArray(profile?.slug_aliases) ? profile.slug_aliases.map((item) => normalizeSlug(item)).filter(Boolean) : [],
      user_code: String(profile?.user_code || fallback?.user_code || "").trim(),
      display_name: String(profile?.display_name || fallback?.display_name || slug).trim() || slug,
      avatar_url: String(profile?.avatar_url || profile?.avatar || fallback?.avatar_url || fallback?.avatar || "").trim(),
      tier: String(profile?.tier || fallback?.tier || "").trim(),
      role: String(profile?.role || fallback?.role || "").trim(),
      account_type: String(profile?.account_type || fallback?.account_type || "").trim(),
      bio: String(profile?.bio || "").trim(),
      cover_image_url: String(profile?.cover_image_url || "").trim() || FALLBACK_COVER,
      social_links: normalizeSocialLinks(profile?.social_links),
      is_listed: explicitListed === false ? false : profile?.listed === false ? false : profile?.community_listed === false ? false : true,
      is_anonymous: profile?.is_anonymous === true,
      account_status: String(profile?.account_status || profile?.status || fallback?.account_status || "").trim().toLowerCase(),
      streamsuites_profile_url: String(profile?.streamsuites_profile_url || fallback?.streamsuites_profile_url || "").trim(),
      findmehere_enabled: explicitEnabled === false ? false : true,
      findmehere_eligible: explicitEligible === false ? false : explicitEligible === true ? true : hasCanonicalSlug,
      findmehere_share_url: String(profile?.findmehere_share_url || fallback?.findmehere_share_url || (hasCanonicalSlug ? `${window.location.origin}/${slug}` : "")).trim(),
      can_edit: profile?.can_edit === true,
      live_status: resolveLiveStatus(profile, liveStatusMap) || resolveLiveStatus(fallback, liveStatusMap)
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
    const haystack = [
      profile.display_name,
      profile.slug,
      profile.bio,
      profile.role,
      profile.account_type,
      profile.tier,
      ...profile.social_links.map((item) => `${item.network} ${item.url}`)
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

  function buildTopbar() {
    const bar = create("header", "fmh-topbar");

    const brand = create("a", "fmh-brand");
    brand.href = "/";
    brand.append(
      create("div", "fmh-brand-mark", "FMH"),
      (() => {
        const copy = create("div", "fmh-brand-copy");
        copy.append(create("strong", "", "FindMeHere"), create("span", "", "Standalone share pages"));
        return copy;
      })()
    );

    const actions = create("div", "fmh-topbar-actions");
    const streamSuites = create("a", "fmh-link-button", "Open StreamSuites");
    streamSuites.href = STREAMSUITES_HOME;
    streamSuites.target = "_blank";
    streamSuites.rel = "noopener noreferrer";

    const creatorLogin = create("a", "fmh-button fmh-button-primary", "Creator Sign In");
    creatorLogin.href = `${STREAMSUITES_HOME}/public-login.html`;
    creatorLogin.target = "_blank";
    creatorLogin.rel = "noopener noreferrer";
    actions.append(streamSuites, creatorLogin);

    bar.append(brand, actions);
    return bar;
  }

  function buildHero(eligibleCount) {
    const hero = create("section", "fmh-hero");

    const left = create("div", "fmh-panel fmh-hero-copy");
    left.append(
      create("span", "fmh-hero-kicker", "findmehere.live"),
      create("h1", "", "Share-first profiles for the StreamSuites network."),
      create("p", "", "FindMeHere is the lightweight discovery surface for public share pages. Creator identity stays authoritative in StreamSuites, while this surface stays focused on clean directory browsing and direct profile links.")
    );
    const actions = create("div", "fmh-hero-actions");
    const browse = create("a", "fmh-button fmh-button-primary", "Browse directory");
    browse.href = "#directory";
    const setup = create("a", "fmh-link-button", "Set up your profile in StreamSuites");
    setup.href = STREAMSUITES_HOME;
    setup.target = "_blank";
    setup.rel = "noopener noreferrer";
    actions.append(browse, setup);
    left.appendChild(actions);

    const right = create("div", "fmh-panel");
    const stats = create("div", "fmh-stat-grid");
    [
      { value: String(eligibleCount), label: "Eligible FindMeHere profiles" },
      { value: "A-Z", label: "Quick alphabet filtering" },
      { value: "2 views", label: "Gallery and list layouts" },
      { value: "Share first", label: "FindMeHere URL only" }
    ].forEach((item) => {
      const card = create("div", "fmh-stat-card");
      card.append(create("strong", "", item.value), create("span", "", item.label));
      stats.appendChild(card);
    });
    right.appendChild(stats);

    hero.append(left, right);
    return hero;
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
    line.append(create("strong", "", profile.display_name), create("span", "fmh-handle", `@${profile.slug}`));
    const liveBadge = buildLiveBadge(profile, true);
    if (liveBadge) line.appendChild(liveBadge);
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

  function buildUnavailableState(reason, slug) {
    setMeta("Profile unavailable | FindMeHere", "This FindMeHere route is unavailable because the profile is not listed or cannot be shown on FindMeHere.");
    setCanonical(slug ? `/${encodeURIComponent(slug)}` : "/");

    const shell = create("div", "fmh-shell");
    shell.appendChild(buildTopbar());

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
    shell.appendChild(route);
    return shell;
  }

  function renderDirectory(root, state) {
    const eligibleProfiles = sortProfiles(state.profiles.filter(isEligibleProfile));
    const filtered = eligibleProfiles.filter((profile) => matchesAlphabet(profile, state.letter) && matchesQuery(profile, state.query));

    setMeta("FindMeHere Directory | Share-first creator profiles", "Browse the FindMeHere directory, filter creators by name, and open standalone share pages backed by StreamSuites profile data.");
    setCanonical("/");
    updateDirectoryStateUrl(state);

    const shell = create("div", "fmh-shell");
    shell.appendChild(buildTopbar());
    shell.appendChild(buildHero(eligibleProfiles.length));

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

    shell.appendChild(section);
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

  function renderProfile(root, profile, requestedSlug) {
    if (!isEligibleProfile(profile)) {
      clear(root);
      root.appendChild(buildUnavailableState(`/${requestedSlug} loaded, but this account is not eligible for public FindMeHere listing.`, requestedSlug));
      return;
    }

    if (profile.slug && requestedSlug && profile.slug !== requestedSlug) {
      window.history.replaceState({}, "", `/${encodeURIComponent(profile.slug)}`);
    }

    setMeta(`${profile.display_name} on FindMeHere`, profile.bio || `Open ${profile.display_name}'s FindMeHere share page on findmehere.live.`);
    setCanonical(`/${encodeURIComponent(profile.slug)}`);

    const shell = create("div", "fmh-shell");
    shell.appendChild(buildTopbar());

    const route = create("section", "fmh-profile-route");
    const hero = create("article", "fmh-profile-hero");
    const cover = create("div", "fmh-profile-cover");
    const coverImage = create("img");
    coverImage.src = profile.cover_image_url || FALLBACK_COVER;
    coverImage.alt = `${profile.display_name} cover`;
    cover.appendChild(coverImage);

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
    [roleLabel(profile.role), tierLabel(profile.tier), ...getPrimaryPlatforms(profile)].filter(Boolean).forEach((item) => meta.appendChild(create("span", "", item)));
    title.appendChild(meta);
    summary.append(buildAvatar(profile, true), title);
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
    hero.append(cover, body);
    route.appendChild(hero);

    const grid = create("div", "fmh-profile-grid");

    const left = create("section", "fmh-profile-section");
    left.appendChild(create("h2", "", "Primary links"));
    const socialList = create("div", "fmh-social-list");
    if (profile.social_links.length) {
      profile.social_links.forEach((item) => socialList.appendChild(buildLinkItem(item)));
    } else {
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

    shell.appendChild(route);
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

    clear(root);
    root.appendChild(create("div", "fmh-loading", "Loading FindMeHere"));

    const slug = getRouteSlug();
    const liveStatusMap = await fetchLiveStatusMap();

    try {
      if (slug) {
        renderProfile(root, normalizePublicProfile(await fetchPublicProfile(slug), { slug }, liveStatusMap), slug);
        return;
      }

      renderDirectory(root, {
        profiles: await loadDirectoryProfiles(liveStatusMap),
        ...getInitialDirectoryState()
      });
    } catch (_error) {
      clear(root);
      root.appendChild(buildUnavailableState("FindMeHere could not load the latest public profile data right now.", slug));
    }
  }

  window.addEventListener("DOMContentLoaded", init, { once: true });
})();
