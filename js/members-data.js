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
    tier: "",
    badges: [],
    bio: "Community-visible profile used when creator metadata is unavailable.",
    coverImageUrl: FALLBACK_COVER,
    socialLinks: {},
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
      day: "numeric"
    });
  }

  function normalizeUserCode(value, fallback = "public-user") {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || fallback;
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
    if (raw === "streamsuites" || raw === "streamsuite") return "streamsuites";
    return PLATFORM_ICON_MAP[raw] ? raw : "generic";
  }

  function normalizeRole(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw.includes("admin")) return "admin";
    if (raw.includes("creator")) return "creator";
    return "viewer";
  }

  function normalizeTier(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "gold" || raw === "pro") return raw;
    return "core";
  }

  function buildBadges(role, tier) {
    if (role === "admin") return [{ kind: "role", value: "admin", label: "ADMIN" }];
    if (role === "creator") return [{ kind: "tier", value: tier, label: String(tier || "core").toUpperCase() }];
    return [];
  }

  function platformIconFor(platform) {
    const key = normalizePlatformKey(platform);
    return PLATFORM_ICON_MAP[key] || PLATFORM_ICON_MAP.generic;
  }

  function normalizeProfile(raw) {
    const seed = raw?.user_code || raw?.userCode || raw?.username || raw?.id;
    const userCode = normalizeUserCode(seed);
    const role = normalizeRole(raw?.role || raw?.account_type || raw?.accountType);
    const tier = normalizeTier(raw?.tier);
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
      tier,
      badges: buildBadges(role, tier),
      bio: String(raw?.bio || "").trim(),
      coverImageUrl: String(raw?.cover_image_url || raw?.coverImageUrl || FALLBACK_COVER).trim() || FALLBACK_COVER,
      socialLinks: normalizeSocialLinks(raw?.social_links || raw?.socialLinks),
      isListed: raw?.is_listed !== false && raw?.listed !== false
    };
  }

  function buildProfiles(items) {
    const profiles = [];
    const byCode = Object.create(null);
    const byId = Object.create(null);

    const add = (profile) => {
      if (!profile || !profile.userCode) return;
      profiles.push(profile);
      byCode[profile.userCode] = profile;
      byCode[normalizeUserCode(profile.username, "")] = profile;
      byId[profile.id] = profile;
    };

    add({ ...DEFAULT_PROFILE });
    items.forEach((item) => add(normalizeProfile(item)));

    return { profiles, profilesByCode: byCode, profilesById: byId };
  }

  function normalizeNotice(raw, profilesByCode, index) {
    const authorRef = normalizeUserCode(raw?.author || "");
    const author = profilesByCode[authorRef] || DEFAULT_PROFILE;
    return {
      id: String(raw?.id || `notice-${index + 1}`).trim(),
      title: String(raw?.title || "Untitled notice").trim() || "Untitled notice",
      body: String(raw?.body || "").trim(),
      priority: String(raw?.priority || "normal").trim().toLowerCase() || "normal",
      createdAt: raw?.created_at || raw?.createdAt || "",
      author
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
          .map((item, index) => normalizeNotice(item, profileState.profilesByCode, index))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return {
          ...profileState,
          notices,
          helpers: {
            toTimestamp,
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
    platformIconFor,
    toTimestamp
  };
})();
