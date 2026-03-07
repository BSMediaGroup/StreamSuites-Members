(() => {
  const AUTH_API_BASE = "https://api.streamsuites.app";
  const AUTH_ME_URL = `${AUTH_API_BASE}/api/public/me`;
  const AUTH_PUBLIC_PROFILE_URL = `${AUTH_API_BASE}/api/public/profile`;
  const AUTH_PUBLIC_PROFILE_ME_URL = `${AUTH_API_BASE}/api/public/profile/me`;
  const AUTH_LOGOUT_URL = `${AUTH_API_BASE}/auth/logout`;
  const CREATOR_DASHBOARD_URL = "https://creator.streamsuites.app";
  const ADMIN_DASHBOARD_URL = "https://admin.streamsuites.app";
  const AUTH_COMPLETE_MESSAGE_TYPE = "ss_members_auth_complete";

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
    const badges = [{ kind: "role-chip", value: role, label: window.StreamSuitesMembersUi.roleLabel(role) }];
    if (role === "admin") {
      badges.unshift({ kind: "role-icon", value: "admin" });
      return badges;
    }
    if (role === "creator") {
      badges.unshift({ kind: "tier-icon", value: normalizeTier(tier) });
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
      badges: buildAccountBadges(accountType, tier)
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
    normalizeAuthState,
    buildAccountBadges,
    buildAccountMenuItems,
    applyAuthStateToShell,
    fetchAuthState,
    logout,
    fetchPublicProfileByCode,
    fetchMyPublicProfile,
    saveMyPublicProfile
  };
})();
