(() => {
  const DATA_PATHS = {
    profiles: "/data/profiles.json",
    notices: "/data/notices.json"
  };

  const FALLBACK_AVATAR = "/assets/logos/logocircle.png";
  const FALLBACK_COVER = "/assets/placeholders/defaultprofilecover.webp";

  const PLATFORM_ICON_MAP = Object.freeze({
    rumble: "/assets/icons/rumble.svg",
    youtube: "/assets/icons/youtube.svg",
    twitch: "/assets/icons/twitch.svg",
    kick: "/assets/icons/kick.svg",
    twitter: "/assets/icons/twitter.svg",
    x: "/assets/icons/x.svg",
    discord: "/assets/icons/discord.svg",
    streamsuites: "/assets/icons/pilled.svg",
    generic: "/assets/icons/pilled.svg"
  });

  const DEFAULT_PROFILE = Object.freeze({
    id: "public-user",
    userCode: "public-user",
    username: "public-user",
    displayName: "Public User",
    avatar: FALLBACK_AVATAR,
    platform: "StreamSuites",
    platformKey: "streamsuites",
    platformIcon: PLATFORM_ICON_MAP.streamsuites,
    role: "viewer",
    accountType: "PUBLIC",
    tier: "",
    badges: [],
    bio: "Community-visible profile used when creator metadata is unavailable.",
    coverImageUrl: FALLBACK_COVER,
    socialLinks: {},
    isAnonymous: false,
    isListed: true
  });

  let cachePromise = null;

  function toArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  }

  async function loadJson(path, fallback) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) return fallback;
      return await response.json();
    } catch (_error) {
      return fallback;
    }
  }

  function toTimestamp(value) {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function toTitle(value) {
    if (!value) return "Pending";
    return String(value)
      .replace(/[_-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  function normalizeUserCode(value, fallback = "public-user") {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized);
    if (!normalized || isUuidLike) return fallback;
    return normalized;
  }

  function isValidUserCode(value) {
    return /^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/i.test(String(value || "").trim());
  }

  function normalizeSocialLinks(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value).reduce((acc, [key, raw]) => {
      const network = String(key || "").trim().toLowerCase();
      const url = String(raw || "").trim();
      if (!network || !url) return acc;
      acc[network] = url;
      return acc;
    }, {});
  }

  function normalizePlatformKey(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "generic";
    if (raw === "streamsuite" || raw === "streamsuites") return "streamsuites";
    return PLATFORM_ICON_MAP[raw] ? raw : "generic";
  }

  function normalizeRole(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw.includes("admin")) return "admin";
    if (raw.includes("creator")) return "creator";
    return "viewer";
  }

  function normalizeAccountType(value, role) {
    const normalized = String(value || "").trim().toUpperCase();
    if (normalized === "ADMIN" || normalized === "CREATOR" || normalized === "PUBLIC") {
      return normalized;
    }
    if (role === "admin") return "ADMIN";
    if (role === "creator") return "CREATOR";
    return "PUBLIC";
  }

  function normalizeTier(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw || raw === "open") return "core";
    if (raw === "gold" || raw === "pro") return raw;
    return "core";
  }

  function platformIconFor(platform) {
    const key = normalizePlatformKey(platform);
    return PLATFORM_ICON_MAP[key] || PLATFORM_ICON_MAP.generic;
  }

  function roleLabel(role) {
    if (role === "admin") return "ADMIN";
    if (role === "creator") return "CREATOR";
    return "VIEWER";
  }

  function buildBadges(role, tier) {
    const normalizedRole = role === "admin" ? "admin" : role === "creator" ? "creator" : "viewer";
    const tierValue = normalizeTier(tier);
    const badges = [{ kind: "role-chip", value: normalizedRole, label: roleLabel(normalizedRole) }];
    if (normalizedRole === "admin") {
      badges.unshift({ kind: "role-icon", value: "admin" });
      return badges;
    }
    if (normalizedRole === "creator") {
      badges.unshift({ kind: "tier-icon", value: tierValue });
    }
    return badges;
  }

  function normalizeProfile(raw) {
    const userCode = normalizeUserCode(raw?.user_code || raw?.userCode || raw?.username || raw?.id);
    const role = normalizeRole(raw?.role || raw?.account_type || raw?.accountType);
    const tier = normalizeTier(raw?.tier || raw?.plan_tier || raw?.membership_tier);
    const platform = String(raw?.platform || "StreamSuites").trim() || "StreamSuites";
    return {
      id: String(raw?.id || userCode).trim() || userCode,
      userCode,
      username: String(raw?.username || userCode).trim() || userCode,
      displayName: String(raw?.display_name || raw?.displayName || raw?.name || userCode).trim() || userCode,
      avatar: String(raw?.avatar || raw?.avatar_url || raw?.avatarUrl || FALLBACK_AVATAR).trim() || FALLBACK_AVATAR,
      platform,
      platformKey: normalizePlatformKey(platform),
      platformIcon: platformIconFor(platform),
      role,
      accountType: normalizeAccountType(raw?.account_type || raw?.accountType, role),
      tier,
      badges: buildBadges(role, tier),
      bio: String(raw?.bio || raw?.summary || "").trim(),
      coverImageUrl: String(raw?.cover_image_url || raw?.coverImageUrl || FALLBACK_COVER).trim() || FALLBACK_COVER,
      socialLinks: normalizeSocialLinks(raw?.social_links || raw?.socialLinks),
      isAnonymous: raw?.is_anonymous === true || raw?.anonymous === true,
      isListed: raw?.is_listed !== false && raw?.listed !== false
    };
  }

  function buildProfiles(items) {
    const profiles = [];
    const profilesByCode = Object.create(null);
    const profilesById = Object.create(null);
    const profilesByLookup = Object.create(null);

    const add = (profile) => {
      if (!profile || !profile.userCode) return;
      profiles.push(profile);
      profilesByCode[profile.userCode] = profile;
      profilesById[profile.id] = profile;
      [
        profile.userCode,
        profile.username,
        profile.id,
        profile.displayName
      ].forEach((value) => {
        const normalized = normalizeUserCode(value, "");
        if (normalized) profilesByLookup[normalized] = profile;
      });
    };

    add({ ...DEFAULT_PROFILE });
    items.forEach((item) => add(normalizeProfile(item)));

    return { profiles, profilesByCode, profilesById, profilesByLookup };
  }

  function resolveProfile(state, value) {
    const normalized = normalizeUserCode(value, "");
    if (!normalized) return state.profilesById[DEFAULT_PROFILE.id] || DEFAULT_PROFILE;
    const direct =
      state.profilesByCode[normalized] ||
      state.profilesById[normalized] ||
      state.profilesByLookup[normalized];
    if (direct) return direct;

    const aliasMatch = (state.profiles || []).find((profile) => {
      const displayName = String(profile?.displayName || "").trim();
      const firstName = displayName.split(/\s+/)[0] || "";
      const aliases = [profile?.userCode, profile?.username, profile?.id, displayName, firstName];
      return aliases.some((entry) => normalizeUserCode(entry || "", "") === normalized);
    });

    return aliasMatch || state.profilesById[DEFAULT_PROFILE.id] || DEFAULT_PROFILE;
  }

  function normalizeNotice(raw, profileState, index) {
    const author = resolveProfile(profileState, raw?.author || raw?.author_code || raw?.author_id || "");
    return {
      id: String(raw?.id || `notice-${index + 1}`).trim(),
      title: String(raw?.title || "Untitled notice").trim() || "Untitled notice",
      body: String(raw?.body || raw?.summary || "").trim(),
      priority: String(raw?.priority || "normal").trim().toLowerCase() || "normal",
      createdAt: raw?.created_at || raw?.createdAt || "",
      author
    };
  }

  function normalizeProfilePayload(payload, fallbackProfile, fallbackCode) {
    const accountType =
      normalizeAccountType(payload?.account_type || payload?.accountType) ||
      (String(payload?.role || "").toLowerCase().includes("admin")
        ? "ADMIN"
        : String(payload?.role || "").toLowerCase().includes("creator")
          ? "CREATOR"
          : "PUBLIC");
    const role = accountType === "ADMIN" ? "admin" : accountType === "CREATOR" ? "creator" : "viewer";
    const tier = normalizeTier(payload?.tier || fallbackProfile?.tier || "core");
    const userCode = normalizeUserCode(
      payload?.user_code || payload?.userCode || fallbackProfile?.userCode || fallbackCode || "public-user"
    );
    return {
      id: fallbackProfile?.id || userCode,
      userCode,
      username: fallbackProfile?.username || userCode,
      displayName:
        String(payload?.display_name || payload?.displayName || fallbackProfile?.displayName || "Public User").trim() ||
        "Public User",
      avatar:
        String(payload?.avatar_url || payload?.avatarUrl || fallbackProfile?.avatar || FALLBACK_AVATAR).trim() ||
        FALLBACK_AVATAR,
      platform: fallbackProfile?.platform || "StreamSuites",
      platformKey: fallbackProfile?.platformKey || "streamsuites",
      platformIcon: fallbackProfile?.platformIcon || PLATFORM_ICON_MAP.streamsuites,
      role,
      accountType,
      tier,
      badges: buildBadges(role, tier),
      bio: String(payload?.bio || fallbackProfile?.bio || "").trim(),
      coverImageUrl:
        String(payload?.cover_image_url || payload?.coverImageUrl || fallbackProfile?.coverImageUrl || FALLBACK_COVER).trim() ||
        FALLBACK_COVER,
      socialLinks: normalizeSocialLinks(payload?.social_links || payload?.socialLinks || fallbackProfile?.socialLinks),
      isAnonymous: payload?.is_anonymous === true || payload?.anonymous === true || fallbackProfile?.isAnonymous === true,
      isListed: payload?.is_listed !== false && payload?.listed !== false && fallbackProfile?.isListed !== false
    };
  }

  async function load() {
    if (!cachePromise) {
      cachePromise = Promise.all([
        loadJson(DATA_PATHS.profiles, { items: [] }),
        loadJson(DATA_PATHS.notices, { items: [] })
      ]).then(([profilesPayload, noticesPayload]) => {
        const profileState = buildProfiles(toArray(profilesPayload));
        const notices = toArray(noticesPayload)
          .map((item, index) => normalizeNotice(item, profileState, index))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
          ...profileState,
          notices,
          helpers: {
            toTimestamp,
            toTitle,
            normalizeUserCode,
            platformIconFor
          }
        };
      });
    }
    return cachePromise;
  }

  window.StreamSuitesMembersData = {
    load,
    DEFAULT_PROFILE,
    normalizeUserCode,
    isValidUserCode,
    normalizeSocialLinks,
    normalizeProfilePayload,
    resolveProfile,
    platformIconFor,
    toTimestamp,
    toTitle
  };
})();
