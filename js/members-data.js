(() => {
  const DATA_PATHS = {
    profiles: "/data/profiles.json",
    notices: "/data/notices.json",
    liveStatus: ["/shared/state/live_status.json", "/data/live-status.json"],
    rumbleDiscovery: ["/shared/state/rumble_live_discovery.json", "/data/rumble_live_discovery.json"]
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
  const SOCIAL_PLATFORM_REGISTRY = Object.freeze([
    { key: "rumble", label: "Rumble", icon: "/assets/icons/rumble.svg", aliases: ["rumble"], tier: "first-class" },
    { key: "youtube", label: "YouTube", icon: "/assets/icons/youtube.svg", aliases: ["youtube", "yt"], tier: "first-class" },
    { key: "twitch", label: "Twitch", icon: "/assets/icons/twitch.svg", aliases: ["twitch"], tier: "first-class" },
    { key: "kick", label: "Kick", icon: "/assets/icons/kick.svg", aliases: ["kick"], tier: "first-class" },
    { key: "pilled", label: "Pilled", icon: "/assets/icons/pilled.svg", aliases: ["pilled"], tier: "first-class" },
    { key: "discord", label: "Discord", icon: "/assets/icons/discord.svg", aliases: ["discord"], tier: "first-class" },
    { key: "x", label: "X", icon: "/assets/icons/x.svg", aliases: ["x", "twitter"], tier: "first-class" },
    { key: "instagram", label: "Instagram", icon: "/assets/icons/instagram.svg", aliases: ["instagram", "insta"], tier: "first-class" },
    { key: "tiktok", label: "TikTok", icon: "/assets/icons/tiktok.svg", aliases: ["tiktok", "tik_tok"], tier: "first-class" },
    { key: "facebook", label: "Facebook", icon: "/assets/icons/facebook.svg", aliases: ["facebook", "fb"], tier: "first-class" },
    { key: "threads", label: "Threads", icon: "/assets/icons/threads.svg", aliases: ["threads"], tier: "first-class" },
    { key: "reddit", label: "Reddit", icon: "/assets/icons/reddit.svg", aliases: ["reddit"], tier: "first-class" },
    { key: "telegram", label: "Telegram", icon: "/assets/icons/telegram.svg", aliases: ["telegram"], tier: "first-class" },
    {
      key: "whatsappchannels",
      label: "WhatsApp Channels",
      icon: "/assets/icons/whatsapp.svg",
      aliases: ["whatsappchannels", "whatsappchannel", "whatsapp_channels", "whatsapp_channel", "whatsapp"],
      tier: "first-class"
    },
    { key: "patreon", label: "Patreon", icon: "/assets/icons/patreon.svg", aliases: ["patreon"], tier: "first-class" },
    { key: "substack", label: "Substack", icon: "/assets/icons/substack.svg", aliases: ["substack"], tier: "first-class" },
    { key: "soundcloud", label: "SoundCloud", icon: "/assets/icons/soundcloud.svg", aliases: ["soundcloud", "sound_cloud"], tier: "first-class" },
    {
      key: "applepodcasts",
      label: "Apple Podcasts",
      icon: "/assets/icons/applepodcasts.svg",
      aliases: ["applepodcasts", "apple_podcasts", "applepodcast", "apple_podcast"],
      tier: "first-class"
    },
    { key: "website", label: "Website", icon: "/assets/icons/website.svg", aliases: ["website", "site", "web", "url", "homepage"], tier: "first-class" },
    { key: "bluesky", label: "Bluesky", icon: "/assets/icons/bluesky.svg", aliases: ["bluesky", "bsky"], tier: "extended" },
    { key: "locals", label: "Locals", icon: "/assets/icons/locals.svg", aliases: ["locals"], tier: "extended" },
    { key: "spotify", label: "Spotify", icon: "/assets/icons/spotify.svg", aliases: ["spotify"], tier: "extended" },
    { key: "vimeo", label: "Vimeo", icon: "/assets/icons/vimeo.svg", aliases: ["vimeo"], tier: "extended" },
    { key: "dailymotion", label: "Dailymotion", icon: "/assets/icons/dailymotion.svg", aliases: ["dailymotion"], tier: "extended" },
    { key: "odysee", label: "Odysee", icon: "/assets/icons/odysee.svg", aliases: ["odysee"], tier: "extended" },
    { key: "trovo", label: "Trovo", icon: "/assets/icons/trovo.svg", aliases: ["trovo"], tier: "extended" },
    { key: "snapchat", label: "Snapchat", icon: "/assets/icons/snapchat.svg", aliases: ["snapchat"], tier: "extended" },
    { key: "pinterest", label: "Pinterest", icon: "/assets/icons/pinterest.svg", aliases: ["pinterest"], tier: "extended" },
    { key: "kofi", label: "Ko-fi", icon: "/assets/icons/kofi.svg", aliases: ["kofi", "ko-fi", "ko_fi"], tier: "extended" },
    { key: "github", label: "GitHub", icon: "/assets/icons/github.svg", aliases: ["github"], tier: "extended" },
    { key: "minds", label: "Minds", icon: "/assets/icons/minds.svg", aliases: ["minds"], tier: "extended" },
    { key: "custom", label: "Custom", icon: "/assets/icons/link.svg", aliases: ["custom", "link"], tier: "extended" }
  ]);
  const SOCIAL_PLATFORM_METADATA = Object.freeze(
    SOCIAL_PLATFORM_REGISTRY.reduce((acc, entry, index) => {
      acc[entry.key] = Object.freeze({ ...entry, order: index });
      return acc;
    }, {})
  );
  const SOCIAL_PLATFORM_ALIAS_MAP = Object.freeze(
    SOCIAL_PLATFORM_REGISTRY.reduce((acc, entry) => {
      entry.aliases.forEach((alias) => {
        acc[alias.replace(/[\s_-]+/g, "").toLowerCase()] = entry.key;
      });
      return acc;
    }, {})
  );
  const SOCIAL_PLATFORM_ORDER = Object.freeze(SOCIAL_PLATFORM_REGISTRY.map((entry) => entry.key));

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
    isListed: true,
    liveStatus: null
  });

  const EMPTY_LIVE_STATUS_SNAPSHOT = Object.freeze({
    schema_version: "v1",
    generated_at: null,
    providers: [],
    creators: []
  });
  const EMPTY_RUMBLE_DISCOVERY_SNAPSHOT = Object.freeze({
    schema_version: "v1",
    provider: "rumble",
    generated_at: null,
    scan: {},
    streams: [],
    creators: []
  });
  const AUTHORITATIVE_LIVE_PROVIDERS = new Set(["rumble"]);

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

  async function loadJsonFromPaths(paths, fallback) {
    const candidates = Array.isArray(paths) ? paths : [paths];
    for (const path of candidates) {
      try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) continue;
        return await response.json();
      } catch (_error) {
        // Try the next candidate.
      }
    }
    return fallback;
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

  function normalizeSocialNetworkKey(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
    if (!normalized) return "";
    return SOCIAL_PLATFORM_ALIAS_MAP[normalized] || normalized;
  }

  function normalizeSocialLinks(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value).reduce((acc, [key, raw]) => {
      const network = normalizeSocialNetworkKey(key);
      const url = String(raw || "").trim();
      if (!network || !url) return acc;
      if (!acc[network]) acc[network] = url;
      return acc;
    }, {});
  }

  function normalizeExternalUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^(mailto:|tel:)/i.test(raw)) return raw;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return "";
    return `https://${raw.replace(/^\/+/, "")}`;
  }

  function socialPlatformMeta(key) {
    return SOCIAL_PLATFORM_METADATA[normalizeSocialNetworkKey(key)] || null;
  }

  function socialIconPath(key) {
    return socialPlatformMeta(key)?.icon || "/assets/icons/link.svg";
  }

  function socialLabel(key) {
    const meta = socialPlatformMeta(key);
    if (meta?.label) return meta.label;
    const raw = String(key || "").trim().replace(/[_-]+/g, " ");
    return raw ? raw.replace(/\b\w/g, (char) => char.toUpperCase()) : "Custom";
  }

  function collectOrderedSocialEntries(value) {
    const normalized = normalizeSocialLinks(value);
    const entries = [];
    const seen = new Set();
    SOCIAL_PLATFORM_ORDER.forEach((network) => {
      const url = normalizeExternalUrl(normalized[network]);
      if (!url) return;
      entries.push({
        network,
        url,
        label: socialLabel(network),
        iconPath: socialIconPath(network)
      });
      seen.add(network);
    });
    Object.entries(normalized).forEach(([network, rawUrl]) => {
      if (seen.has(network)) return;
      const url = normalizeExternalUrl(rawUrl);
      if (!url) return;
      entries.push({
        network,
        url,
        label: socialLabel(network),
        iconPath: socialIconPath(network)
      });
    });
    return entries;
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
    if (!AUTHORITATIVE_LIVE_PROVIDERS.has(provider)) return null;
    return {
      isLive: true,
      provider,
      providerLabel: toTitle(provider || "live"),
      title: String(activeStatus?.live_title || activeStatus?.liveTitle || "").trim(),
      url: String(activeStatus?.live_url || activeStatus?.liveUrl || "").trim(),
      viewerCount: parseViewerCount(activeStatus?.viewer_count || activeStatus?.viewerCount),
      startedAt: String(activeStatus?.started_at || activeStatus?.startedAt || "").trim(),
      lastCheckedAt: String(
        raw?.last_checked_at || raw?.lastCheckedAt || activeStatus?.last_checked_at || activeStatus?.lastCheckedAt || ""
      ).trim()
    };
  }

  function normalizeRumbleDiscoveryStatus(raw) {
    if (!raw || typeof raw !== "object" || raw?.is_live !== true) return null;
    return {
      isLive: true,
      provider: "rumble",
      providerLabel: "Rumble",
      title: String(raw?.live_title || "").trim(),
      url: String(raw?.live_url || raw?.channel_url || "").trim(),
      viewerCount: parseViewerCount(raw?.viewer_count),
      startedAt: String(raw?.started_at || "").trim(),
      lastCheckedAt: String(raw?.last_checked_at || "").trim(),
      channelUrl: String(raw?.channel_url || "").trim(),
      channelSlug: String(raw?.channel_slug || "").trim(),
      streamKey: String(raw?.stream_key || "").trim(),
      numericVideoId: String(raw?.numeric_video_id || "").trim()
    };
  }

  function mergeLiveStatuses(primary, fallback) {
    if (!primary?.isLive) return fallback?.isLive ? { ...fallback } : null;
    if (!fallback?.isLive || primary.provider !== fallback.provider) return { ...primary };
    return {
      ...fallback,
      ...primary,
      title: primary.title || fallback.title || "",
      url: primary.url || fallback.url || "",
      viewerCount: primary.viewerCount ?? fallback.viewerCount ?? null,
      startedAt: primary.startedAt || fallback.startedAt || "",
      lastCheckedAt: primary.lastCheckedAt || fallback.lastCheckedAt || "",
      channelUrl: primary.channelUrl || fallback.channelUrl || "",
      channelSlug: primary.channelSlug || fallback.channelSlug || "",
      streamKey: primary.streamKey || fallback.streamKey || "",
      numericVideoId: primary.numericVideoId || fallback.numericVideoId || ""
    };
  }

  function enrichAuthoritativeLiveStatus(authoritative, discovery) {
    if (!authoritative?.isLive) return null;
    return mergeLiveStatuses(authoritative, discovery);
  }

  function buildRumbleDiscoveryMap(payload) {
    const map = new Map();
    const add = (entry) => {
      const normalized = normalizeRumbleDiscoveryStatus(entry);
      if (!normalized) return;
      [
        entry?.creator_id,
        entry?.display_name,
        entry?.channel_slug,
        entry?.channel_url
      ].forEach((value) => {
        const key = normalizeUserCode(value, "");
        if (key) map.set(key, normalized);
      });
    };

    (Array.isArray(payload?.creators) ? payload.creators : []).forEach(add);
    (Array.isArray(payload?.streams) ? payload.streams : []).forEach((entry) => {
      const matched = entry?.matched_creator;
      add({
        creator_id: matched?.creator_id,
        display_name: matched?.display_name,
        channel_slug: entry?.channel?.slug || matched?.matched_value,
        channel_url: entry?.channel?.canonical_url,
        is_live: entry?.is_live === true,
        live_title: entry?.title,
        live_url: entry?.watch_url,
        viewer_count: entry?.viewer_count,
        started_at: entry?.started_at
      });
    });

    return map;
  }

  function resolveRumbleDiscovery(raw, rumbleDiscoveryMap) {
    const candidates = [
      raw?.id,
      raw?.creator_id,
      raw?.creatorId,
      raw?.public_slug,
      raw?.publicSlug,
      raw?.slug,
      raw?.user_code,
      raw?.userCode,
      raw?.username,
      raw?.display_name,
      raw?.displayName,
      raw?.name,
      raw?.social_links?.rumble,
      raw?.socialLinks?.rumble
    ];
    for (const candidate of candidates) {
      const key = normalizeUserCode(candidate, "");
      if (key && rumbleDiscoveryMap?.has(key)) {
        return rumbleDiscoveryMap.get(key) || null;
      }
    }
    return null;
  }

  function buildLiveStatusMap(payload, rumbleDiscoveryMap = null) {
    const map = new Map();
    const items = Array.isArray(payload?.creators) ? payload.creators : [];
    items.forEach((entry) => {
      const normalized = enrichAuthoritativeLiveStatus(normalizeLiveStatus(entry), resolveRumbleDiscovery(entry, rumbleDiscoveryMap));
      if (!normalized) return;
      [
        entry?.creator_id,
        entry?.creatorId,
        entry?.display_name,
        entry?.displayName
      ].forEach((value) => {
        const key = normalizeUserCode(value, "");
        if (key) map.set(key, normalized);
      });
    });
    return map;
  }

  function hasEmbeddedLiveStatus(raw) {
    if (!raw || typeof raw !== "object") return false;
    return Object.prototype.hasOwnProperty.call(raw, "live_status") || Object.prototype.hasOwnProperty.call(raw, "liveStatus");
  }

  function resolveMappedLiveStatus(raw, liveStatusMap) {
    const candidates = [
      raw?.id,
      raw?.creator_id,
      raw?.creatorId,
      raw?.public_slug,
      raw?.publicSlug,
      raw?.slug,
      raw?.user_code,
      raw?.userCode,
      raw?.username,
      raw?.display_name,
      raw?.displayName,
      raw?.name
    ];
    for (const candidate of candidates) {
      const key = normalizeUserCode(candidate, "");
      if (key && liveStatusMap?.has(key)) {
        return liveStatusMap.get(key) || null;
      }
    }
    return null;
  }

  function resolveLiveStatus(raw, liveStatusMap, rumbleDiscoveryMap = null) {
    const authoritative = resolveMappedLiveStatus(raw, liveStatusMap);
    return enrichAuthoritativeLiveStatus(authoritative, resolveRumbleDiscovery(raw, rumbleDiscoveryMap));
  }

  async function loadAuthoritativeLiveMaps() {
    const [liveStatusPayload, rumbleDiscoveryPayload] = await Promise.all([
      loadJsonFromPaths(DATA_PATHS.liveStatus, EMPTY_LIVE_STATUS_SNAPSHOT),
      loadJsonFromPaths(DATA_PATHS.rumbleDiscovery, EMPTY_RUMBLE_DISCOVERY_SNAPSHOT)
    ]);
    const rumbleDiscoveryMap = buildRumbleDiscoveryMap(rumbleDiscoveryPayload);
    return {
      liveStatusPayload,
      rumbleDiscoveryPayload,
      rumbleDiscoveryMap,
      liveStatusMap: buildLiveStatusMap(liveStatusPayload, rumbleDiscoveryMap)
    };
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
    const badges = [];
    if (normalizedRole === "admin") {
      badges.push({ key: "admin", kind: "role", value: "admin", label: "Admin" });
      return badges;
    }
    if (normalizedRole === "creator") {
      badges.push({ key: tierValue, kind: "tier", value: tierValue, label: tierValue.toUpperCase() });
    }
    return badges;
  }

  function normalizeProfile(raw, liveStatusMap = null) {
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
      badges:
        typeof window.StreamSuitesMembersUi?.normalizeAuthoritativeBadges === "function"
          ? window.StreamSuitesMembersUi.normalizeAuthoritativeBadges(
              raw?.findmehere_badges || raw?.findmehereBadges || raw?.badges,
              normalizeAccountType(raw?.account_type || raw?.accountType, role),
              tier
            )
          : buildBadges(role, tier),
      bio: String(raw?.bio || raw?.summary || "").trim(),
      coverImageUrl: String(raw?.cover_image_url || raw?.coverImageUrl || FALLBACK_COVER).trim() || FALLBACK_COVER,
      socialLinks: normalizeSocialLinks(raw?.social_links || raw?.socialLinks),
      isAnonymous: raw?.is_anonymous === true || raw?.anonymous === true,
      isListed: raw?.is_listed !== false && raw?.listed !== false,
      liveStatus: resolveLiveStatus(raw, liveStatusMap)
    };
  }

  function buildProfiles(items, liveStatusMap = null) {
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
    items.forEach((item) => add(normalizeProfile(item, liveStatusMap)));

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
      badges:
        typeof window.StreamSuitesMembersUi?.normalizeAuthoritativeBadges === "function"
          ? window.StreamSuitesMembersUi.normalizeAuthoritativeBadges(
              payload?.findmehere_badges || payload?.findmehereBadges || payload?.badges,
              accountType,
              tier
            )
          : buildBadges(role, tier),
      bio: String(payload?.bio || fallbackProfile?.bio || "").trim(),
      coverImageUrl:
        String(payload?.cover_image_url || payload?.coverImageUrl || fallbackProfile?.coverImageUrl || FALLBACK_COVER).trim() ||
        FALLBACK_COVER,
      socialLinks: normalizeSocialLinks(payload?.social_links || payload?.socialLinks || fallbackProfile?.socialLinks),
      isAnonymous: payload?.is_anonymous === true || payload?.anonymous === true || fallbackProfile?.isAnonymous === true,
      isListed: payload?.is_listed !== false && payload?.listed !== false && fallbackProfile?.isListed !== false,
      liveStatus: fallbackProfile?.liveStatus || null
    };
  }

  async function load() {
    if (!cachePromise) {
      cachePromise = Promise.all([
        loadJson(DATA_PATHS.profiles, { items: [] }),
        loadJson(DATA_PATHS.notices, { items: [] }),
        loadAuthoritativeLiveMaps()
      ]).then(([profilesPayload, noticesPayload, liveData]) => {
        const profileState = buildProfiles(toArray(profilesPayload), liveData.liveStatusMap);
        const notices = toArray(noticesPayload)
          .map((item, index) => normalizeNotice(item, profileState, index))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
          ...profileState,
          notices,
          liveStatus: liveData.liveStatusPayload,
          rumbleDiscovery: liveData.rumbleDiscoveryPayload,
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
    SOCIAL_PLATFORM_REGISTRY,
    normalizeUserCode,
    isValidUserCode,
    normalizeSocialNetworkKey,
    normalizeSocialLinks,
    collectOrderedSocialEntries,
    socialIconPath,
    socialLabel,
    normalizeLiveStatus,
    mergeLiveStatuses,
    buildRumbleDiscoveryMap,
    buildLiveStatusMap,
    resolveLiveStatus,
    loadAuthoritativeLiveMaps,
    normalizeProfilePayload,
    resolveProfile,
    platformIconFor,
    toTimestamp,
    toTitle
  };
})();
