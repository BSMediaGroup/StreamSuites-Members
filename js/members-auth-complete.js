(() => {
  const ME_API_URL = "https://api.streamsuites.app/api/public/me";
  const LOGIN_URL = "https://streamsuites.app/public-login.html";
  const DEFAULT_RETURN_TO = `${window.location.origin}/`;
  const AUTH_COMPLETE_MESSAGE_TYPE = "ss_members_auth_complete";
  const CLOSE_FALLBACK_DELAY_MS = 700;

  const statusEl = document.getElementById("members-auth-complete-status");
  const backLinkEl = document.getElementById("members-auth-complete-back");
  const loginLinkEl = document.getElementById("members-auth-complete-login");
  const toast = window.StreamSuitesMembersToast;

  const params = new URLSearchParams(window.location.search || "");
  const returnTo = normalizeReturnTo(params.get("return_to") || DEFAULT_RETURN_TO);

  function normalizeReturnTo(value) {
    if (!value || typeof value !== "string") return DEFAULT_RETURN_TO;
    try {
      const parsed = new URL(value, window.location.origin);
      if (parsed.origin !== window.location.origin && parsed.origin !== "https://members.streamsuites.app") {
        return DEFAULT_RETURN_TO;
      }
      return parsed.href;
    } catch (_err) {
      return DEFAULT_RETURN_TO;
    }
  }

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message || "";
  }

  function setError(message) {
    const text = String(message || "").trim();
    if (!text) {
      toast?.dismiss?.("members-auth-complete-error");
      return;
    }
    toast?.error?.(text, {
      key: "members-auth-complete-error",
      title: "Sign-in error",
      autoDismissMs: 7200
    });
  }

  function isAuthenticatedPayload(payload) {
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

  async function checkSession() {
    const response = await fetch(ME_API_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return false;
    const payload = await response.json();
    return isAuthenticatedPayload(payload);
  }

  function wireLinks() {
    if (backLinkEl instanceof HTMLAnchorElement) {
      backLinkEl.href = returnTo;
    }
    if (loginLinkEl instanceof HTMLAnchorElement) {
      const loginUrl = new URL(LOGIN_URL);
      loginUrl.searchParams.set("return_to", returnTo);
      loginLinkEl.href = loginUrl.toString();
    }
  }

  function notifyOpener() {
    if (!window.opener || typeof window.opener.postMessage !== "function") return;
    try {
      const targetOrigin = new URL(returnTo).origin;
      window.opener.postMessage({ type: AUTH_COMPLETE_MESSAGE_TYPE }, targetOrigin);
      if (targetOrigin !== "https://members.streamsuites.app") {
        window.opener.postMessage({ type: AUTH_COMPLETE_MESSAGE_TYPE }, "https://members.streamsuites.app");
      }
    } catch (_err) {
      // Ignore postMessage errors in cross-window edge cases.
    }
  }

  async function complete() {
    wireLinks();
    try {
      const authenticated = await checkSession();
      if (!authenticated) {
        setStatus("You are not signed in yet.");
        setError("Complete login to continue.");
        return;
      }

      setStatus("Signed in. Returning to your page...");
      setError("");
      notifyOpener();

      if (window.opener && !window.opener.closed) {
        try {
          window.close();
        } catch (_err) {
          // Ignore close failures; redirect fallback below.
        }
      }

      window.setTimeout(() => {
        if (!window.closed) {
          window.location.replace(returnTo);
        }
      }, CLOSE_FALLBACK_DELAY_MS);
    } catch (_err) {
      setStatus("Unable to verify session.");
      setError("Auth API unavailable. Please retry login.");
    }
  }

  complete();
})();
