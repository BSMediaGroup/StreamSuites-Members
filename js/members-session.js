(() => {
  const AUTH_API_BASE = "https://api.streamsuites.app";
  const AUTH_ME_URL = `${AUTH_API_BASE}/api/public/me`;
  const AUTH_PUBLIC_PROFILE_URL = `${AUTH_API_BASE}/api/public/profile`;
  const AUTH_PUBLIC_PROFILE_ME_URL = `${AUTH_API_BASE}/api/public/profile/me`;
  const AUTH_LOGOUT_URL = `${AUTH_API_BASE}/auth/logout`;
  const DIRECTORY_PAGE_VISIT_URL = `${AUTH_API_BASE}/api/public/analytics/page-visit?surface=directory`;
  const CREATOR_DASHBOARD_URL = "https://creator.streamsuites.app";
  const ADMIN_DASHBOARD_URL = "https://admin.streamsuites.app";
  const AUTH_COMPLETE_MESSAGE_TYPE = "ss_members_auth_complete";
  const DIRECTORY_SURFACE = "directory";
  const DIRECTORY_SESSION_MARKER_KEY = "ss_directory_session_marker";
  let directoryPageVisitPromise = null;

  function canTrackDirectoryPageVisit() {
    if (typeof window === "undefined" || typeof fetch !== "function" || !window.location) return false;
    const protocol = String(window.location.protocol || "").toLowerCase();
    return protocol === "http:" || protocol === "https:";
  }

  function readSessionStorage() {
    try {
      return window.sessionStorage;
    } catch (_error) {
      return null;
    }
  }

  function buildDirectorySessionMarker() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `dir-${window.crypto.randomUUID()}`;
    }
    return `dir-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getOrCreateDirectorySessionMarker() {
    const storage = readSessionStorage();
    const current = storage?.getItem(DIRECTORY_SESSION_MARKER_KEY);
    if (current) return current;
    const created = buildDirectorySessionMarker();
    storage?.setItem(DIRECTORY_SESSION_MARKER_KEY, created);
    return created;
  }

  function normalizeDirectoryPath(pathname) {
    const raw = String(pathname || "/").trim() || "/";
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  function inferDirectoryPageKey(pathname) {
    const bodyPage = String(document.body?.dataset?.membersPage || "").trim().toLowerCase();
    if (bodyPage) return bodyPage;

    const normalizedPath = normalizeDirectoryPath(pathname).replace(/\/+$/, "") || "/";
    if (normalizedPath === "/") return "directory";
    if (normalizedPath === "/live") return "live";
    if (normalizedPath === "/members") return "members";
    if (normalizedPath === "/notices") return "notices";
    if (normalizedPath === "/settings") return "settings";
    if (normalizedPath === "/auth-complete") return "auth-complete";
    if (normalizedPath.startsWith("/u/")) return "profile";

    const parts = normalizedPath.split("/").filter(Boolean);
    if (parts.length === 1) return "profile";
    return parts[parts.length - 1] || "directory";
  }

  function buildDirectoryPageVisitPayload() {
    const path = normalizeDirectoryPath(window.location.pathname);
    if (!path) return null;
    return {
      path,
      page_key: inferDirectoryPageKey(path),
      title: String(document.title || "").trim() || null,
      referrer: String(document.referrer || "").trim() || null,
      session_marker: getOrCreateDirectorySessionMarker(),
      timestamp: new Date().toISOString(),
      surface: DIRECTORY_SURFACE
    };
  }

  async function trackDirectoryPageVisit() {
    if (directoryPageVisitPromise || !canTrackDirectoryPageVisit()) {
      return directoryPageVisitPromise;
    }
    const payload = buildDirectoryPageVisitPayload();
    if (!payload) return null;

    directoryPageVisitPromise = fetch(DIRECTORY_PAGE_VISIT_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      keepalive: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch(() => null);

    return directoryPageVisitPromise;
  }

  function scheduleDirectoryPageVisit() {
    if (!canTrackDirectoryPageVisit()) return;
    if (document.body?.classList.contains("findmehere-page")) return;
    const invoke = () => {
      void trackDirectoryPageVisit();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", invoke, { once: true });
      return;
    }
    window.setTimeout(invoke, 0);
  }

  function normalizeAccountType(value) {
    const normalized = String(value || "").trim().toUpperCase();
    if (normalized === "ADMIN" || normalized === "CREATOR" || normalized === "PUBLIC") {
      return normalized;
    }
    return "";
  }

  function readAuthenticated(payload) {
    const candidates = [
      payload?.authenticated,
      payload?.is_authenticated,
      payload?.isAuthenticated,
      payload?.data?.authenticated,
      payload?.data?.is_authenticated,
      payload?.data?.isAuthenticated
    ];
    return candidates.some((value) => value === true);
  }

  function normalizeTier(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "gold" || raw === "pro") return raw;
    return "core";
  }

  function buildAccountBadges(accountType, tier) {
    const role = accountType === "ADMIN" ? "admin" : accountType === "CREATOR" ? "creator" : "viewer";
    const badges = [];
    if (role === "admin") {
      badges.push({ key: "admin", kind: "role", value: "admin", label: "Admin" });
      badges.push({ key: normalizeTier(tier), kind: "tier", value: normalizeTier(tier), label: normalizeTier(tier).toUpperCase() });
      return badges;
    }
    if (role === "creator") {
      badges.push({ key: normalizeTier(tier), kind: "tier", value: normalizeTier(tier), label: normalizeTier(tier).toUpperCase() });
    }
    return badges;
  }

  function normalizeAuthState(payload) {
    const authenticated = readAuthenticated(payload);
    if (!authenticated) {
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

    const accountType =
      normalizeAccountType(payload?.account_type) ||
      normalizeAccountType(payload?.role) ||
      normalizeAccountType(payload?.data?.role) ||
      normalizeAccountType(payload?.user?.role) ||
      (payload?.is_admin ? "ADMIN" : payload?.is_creator ? "CREATOR" : "PUBLIC");
    const tier = normalizeTier(
      payload?.tier ||
      payload?.data?.tier ||
      payload?.user?.tier ||
      "core"
    );

    return {
      authenticated: true,
      accountId: String(
        payload?.account_id ||
        payload?.data?.account_id ||
        payload?.user?.internal_id ||
        payload?.user?.id ||
        ""
      ).trim(),
      userCode: window.StreamSuitesMembersData.normalizeUserCode(
        payload?.user_code ||
        payload?.data?.user_code ||
        payload?.user?.user_code ||
        payload?.creator?.user_code ||
        payload?.username ||
        payload?.user?.username ||
        "public-user"
      ),
      displayName: String(
        payload?.display_name ||
        payload?.data?.display_name ||
        payload?.user?.display_name ||
        payload?.creator?.display_name ||
        payload?.creator?.name ||
        payload?.name ||
        "User"
      ).trim() || "User",
      avatarUrl: String(
        payload?.avatar_url ||
        payload?.data?.avatar_url ||
        payload?.user?.avatar_url ||
        payload?.creator?.avatar_url ||
        ""
      ).trim(),
      accountType,
      tier,
      badges:
        typeof window.StreamSuitesMembersUi?.normalizeAuthoritativeBadges === "function"
          ? window.StreamSuitesMembersUi.normalizeAuthoritativeBadges(
              payload?.findmehere_badges || payload?.findmehereBadges || payload?.badges,
              accountType,
              tier
            )
          : buildAccountBadges(accountType, tier)
    };
  }

  function buildAccountMenuItems(authState) {
    if (!authState?.authenticated) {
      return [
        { label: "Public Login", action: "public_login" },
        {
          label: "Creator Login",
          href: "https://api.streamsuites.app/auth/login/google?surface=creator",
          target: "_blank",
          rel: "noopener noreferrer",
          action: "creator_login"
        },
        { label: "Sign up", action: "public_signup", subtle: true }
      ];
    }

    const items = [
      {
        label: "Profile",
        href: window.StreamSuitesMembersUi.buildProfileHref(authState.userCode || "public-user"),
        action: "profile"
      }
    ];

    items.push({
      label: "Account Settings",
      href: "/settings/",
      action: "account_settings"
    });

    if (authState.accountType === "CREATOR" || authState.accountType === "ADMIN") {
      items.push({ separator: true });
      items.push({
        label: "Creator Dashboard",
        href: CREATOR_DASHBOARD_URL,
        target: "_blank",
        rel: "noopener noreferrer",
        action: "creator_dashboard"
      });
    }

    if (authState.accountType === "ADMIN") {
      items.push({
        label: "Admin Dashboard",
        href: ADMIN_DASHBOARD_URL,
        target: "_blank",
        rel: "noopener noreferrer",
        action: "admin_dashboard"
      });
    }

    items.push({ separator: true });
    items.push({ label: "Logout", action: "logout" });
    return items;
  }

  function applyAuthStateToShell(shell, authState, onMenuAction) {
    shell.updateOptions({
      accountLabel: authState?.authenticated ? authState.displayName : "Login",
      accountAvatar: authState?.authenticated ? authState.avatarUrl : "",
      accountBadges: authState?.authenticated ? authState.badges : [],
      accountAuthenticated: Boolean(authState?.authenticated),
      accountMenuItems: buildAccountMenuItems(authState),
      onAccountMenuAction(action, item) {
        if (typeof onMenuAction === "function") {
          onMenuAction(String(action || ""), item || null);
        }
      }
    });
  }

  async function fetchAuthState() {
    const response = await fetch(AUTH_ME_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error(`auth me request failed (${response.status})`);
    }
    const payload = await response.json();
    return normalizeAuthState(payload);
  }

  async function logout() {
    await fetch(AUTH_LOGOUT_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
  }

  async function fetchPublicProfileByCode(userCode) {
    const endpoint = new URL(AUTH_PUBLIC_PROFILE_URL);
    endpoint.searchParams.set("u", window.StreamSuitesMembersData.normalizeUserCode(userCode));
    const response = await fetch(endpoint.toString(), {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error(`public profile request failed (${response.status})`);
    }
    const payload = await response.json();
    return payload?.profile && typeof payload.profile === "object" ? payload.profile : payload;
  }

  async function fetchMyPublicProfile() {
    const response = await fetch(AUTH_PUBLIC_PROFILE_ME_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error(`public profile me request failed (${response.status})`);
    }
    const payload = await response.json();
    return payload?.profile && typeof payload.profile === "object" ? payload.profile : payload;
  }

  async function saveMyPublicProfile(payload) {
    const response = await fetch(AUTH_PUBLIC_PROFILE_ME_URL, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload || {})
    });
    const responsePayload = await response.json().catch(() => ({}));
    if (!response.ok || responsePayload?.success === false) {
      throw new Error(String(responsePayload?.error || "").trim() || `save failed (${response.status})`);
    }
    return responsePayload?.profile && typeof responsePayload.profile === "object"
      ? responsePayload.profile
      : responsePayload;
  }

  window.StreamSuitesMembersSession = {
    AUTH_API_BASE,
    AUTH_COMPLETE_MESSAGE_TYPE,
    DIRECTORY_SURFACE,
    normalizeAuthState,
    buildAccountBadges,
    buildAccountMenuItems,
    applyAuthStateToShell,
    fetchAuthState,
    logout,
    fetchPublicProfileByCode,
    fetchMyPublicProfile,
    saveMyPublicProfile,
    trackDirectoryPageVisit
  };

  scheduleDirectoryPageVisit();
})();
