(() => {
  const PAGE_CONFIG = {
    home: {
      title: "Community",
      searchPlaceholder: "Search members and notices",
      activeHref: "/",
      render: renderHome
    },
    members: {
      title: "Members",
      searchPlaceholder: "Search members",
      activeHref: "/members/",
      render: renderMembers
    },
    notices: {
      title: "Notices",
      searchPlaceholder: "Search notices",
      activeHref: "/notices/",
      render: renderNotices
    },
    settings: {
      title: "Account Settings",
      searchPlaceholder: "Search",
      activeHref: "/settings/",
      showSearch: false,
      render: renderSettings
    }
  };

  function create(tag, className, text) {
    return window.StreamSuitesMembersUi.create(tag, className, text);
  }

  function clear(node) {
    return window.StreamSuitesMembersUi.clear(node);
  }

  function buildNoticeCard(notice, compact = false) {
    const card = create("article", `notice-card${compact ? " members-compact-card" : ""}`);
    const priority = create("span", `meta-pill members-priority-pill priority-${notice.priority}`, notice.priority);
    const meta = create(
      "div",
      "notice-meta",
      `${window.StreamSuitesMembersData.toTimestamp(notice.createdAt)} | ${notice.author.displayName}`
    );
    window.StreamSuitesMembersUi.applyProfileHoverAttrs(card, notice.author);
    card.append(priority, create("h3", "", notice.title), create("p", "", notice.body), meta);
    return card;
  }

  function renderHome(ctx) {
    const { host, data, state, authState } = ctx;
    clear(host);
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        authState?.authenticated ? `Community, ${authState.displayName}` : "Community",
        "Latest notices and public member directory behavior migrated from the original community hub."
      )
    );

    const latestNotice = window.StreamSuitesMembersUi.filterNotices(data.notices, state.query)[0] || null;
    const noticeSection = window.StreamSuitesMembersUi.buildSection("Latest Notice", "/notices/");
    if (latestNotice) {
      noticeSection.appendChild(buildNoticeCard(latestNotice));
    } else {
      noticeSection.appendChild(create("div", "empty-state", "No notices published yet."));
    }
    host.appendChild(noticeSection);

    const memberSection = window.StreamSuitesMembersUi.buildSection("Members", "/members/");
    const members = window.StreamSuitesMembersUi.filterProfiles(data.profiles, state.query)
      .slice(0, window.matchMedia("(max-width: 900px)").matches ? 4 : 8);
    const grid = create("div", "profile-grid");
    members.forEach((profile) => {
      grid.appendChild(window.StreamSuitesMembersUi.buildProfileCard(profile));
    });
    memberSection.appendChild(grid);
    if (!members.length) {
      memberSection.appendChild(create("div", "empty-state", "No members match this search."));
    }
    host.appendChild(memberSection);

    const updates = window.StreamSuitesMembersUi.buildSection("Recent Notice Feed", "/notices/");
    const feed = create("div", "members-overview-grid");
    window.StreamSuitesMembersUi.filterNotices(data.notices, state.query)
      .slice(0, 3)
      .forEach((notice) => feed.appendChild(buildNoticeCard(notice, true)));
    if (feed.childElementCount) {
      updates.appendChild(feed);
    } else {
      updates.appendChild(create("div", "empty-state", "No notices match this search."));
    }
    host.appendChild(updates);
  }

  function renderMembers(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        "Members Directory",
        "Search all currently migrated community profiles inside the dedicated members surface."
      )
    );

    const grid = create("section", "profile-grid");
    const members = window.StreamSuitesMembersUi.filterProfiles(data.profiles, state.query);
    members.forEach((profile) => {
      grid.appendChild(window.StreamSuitesMembersUi.buildProfileCard(profile));
    });
    host.appendChild(grid);

    if (!members.length) {
      host.appendChild(create("div", "empty-state", "No members match this search."));
    }
  }

  function renderNotices(ctx) {
    const { host, data, state } = ctx;
    clear(host);
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        "Community Notices",
        "All published notices and updates carried from the public community baseline."
      )
    );

    const notices = window.StreamSuitesMembersUi.filterNotices(data.notices, state.query);
    const section = create("section", "section members-notice-stack");
    notices.forEach((notice) => section.appendChild(buildNoticeCard(notice)));
    host.appendChild(section);

    if (!notices.length) {
      host.appendChild(create("div", "empty-state", "No notices match this search."));
    }
  }

  function buildSettingsField(labelText, inputNode, helpText = "") {
    const label = create("label", "settings-field");
    label.appendChild(create("span", "settings-label", labelText));
    label.appendChild(inputNode);
    if (helpText) label.appendChild(create("span", "settings-help", helpText));
    return label;
  }

  function renderSettings(ctx) {
    const { host, authState } = ctx;
    const toast = window.StreamSuitesMembersToast;
    clear(host);
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        "Account Settings",
        "Manage visibility, bio, cover image, and social links for the public-facing members profile."
      )
    );

    if (!authState?.authenticated) {
      host.appendChild(create("div", "empty-state", "Log in to access Account Settings."));
      return;
    }

    const panel = create("section", "profile-card settings-form");
    const status = create("div", "muted");
    const form = create("form", "settings-grid");
    form.addEventListener("submit", (event) => event.preventDefault());

    const visibilityToggle = create("input");
    visibilityToggle.type = "checkbox";
    visibilityToggle.name = "anonymous";
    form.appendChild(buildSettingsField("Profile visibility", visibilityToggle, "Enable anonymous profile mode."));

    const listingToggle = create("input");
    listingToggle.type = "checkbox";
    listingToggle.name = "listed";
    listingToggle.checked = true;
    form.appendChild(buildSettingsField("Community directory listing", listingToggle, "Show this profile in the members directory."));

    const coverInput = create("input");
    coverInput.type = "url";
    coverInput.name = "cover_image_url";
    coverInput.placeholder = "/assets/placeholders/defaultprofilecover.webp";
    form.appendChild(buildSettingsField("Cover image URL", coverInput));

    const bioInput = create("textarea");
    bioInput.name = "bio";
    bioInput.rows = 5;
    form.appendChild(buildSettingsField("Bio", bioInput));

    const socialField = create("div", "settings-field");
    socialField.appendChild(create("span", "settings-label", "Social links"));
    const socialInputs = {};
    ["youtube", "rumble", "discord", "x", "twitch", "kick", "github", "website"].forEach((key) => {
      const row = create("label", "settings-social-row");
      const label = create("span", "", key.toUpperCase());
      const input = create("input");
      input.type = "url";
      input.placeholder = `${key} URL`;
      socialInputs[key] = input;
      row.append(label, input);
      socialField.appendChild(row);
    });
    form.appendChild(socialField);

    const saveButton = create("button", "filter-chip active settings-save-btn", "Save settings");
    saveButton.type = "button";
    saveButton.addEventListener("click", async () => {
      status.textContent = "Saving...";
      saveButton.disabled = true;
      try {
        const socialPayload = Object.entries(socialInputs).reduce((acc, [key, input]) => {
          const value = String(input.value || "").trim();
          if (!value) return acc;
          acc[key] = value;
          return acc;
        }, {});

        const updated = await window.StreamSuitesMembersSession.saveMyPublicProfile({
          anonymous: visibilityToggle.checked,
          listed: listingToggle.checked,
          cover_image_url: String(coverInput.value || "").trim(),
          bio: String(bioInput.value || "").trim(),
          social_links: socialPayload
        });

        const normalizedSocial = window.StreamSuitesMembersData.normalizeSocialLinks(
          updated?.social_links || updated?.socialLinks
        );
        visibilityToggle.checked = updated?.is_anonymous === true || updated?.anonymous === true;
        listingToggle.checked = updated?.is_listed !== false && updated?.listed !== false;
        coverInput.value = String(updated?.cover_image_url || updated?.coverImageUrl || "").trim();
        bioInput.value = String(updated?.bio || "").trim();
        Object.entries(socialInputs).forEach(([key, input]) => {
          input.value = normalizedSocial[key] || "";
        });
        status.textContent = "";
        toast?.success?.("Profile settings saved.", {
          key: "members-settings-save",
          title: "Saved"
        });
      } catch (error) {
        status.textContent = "";
        toast?.error?.(error instanceof Error ? error.message : "Save failed", {
          key: "members-settings-save",
          title: "Save failed",
          autoDismissMs: 6800
        });
      } finally {
        saveButton.disabled = false;
      }
    });

    form.appendChild(saveButton);
    panel.append(form, status);
    host.appendChild(panel);

    (async () => {
      try {
        const profile = await window.StreamSuitesMembersSession.fetchMyPublicProfile();
        const social = window.StreamSuitesMembersData.normalizeSocialLinks(profile?.social_links || profile?.socialLinks);
        visibilityToggle.checked = profile?.is_anonymous === true || profile?.anonymous === true;
        listingToggle.checked = profile?.is_listed !== false && profile?.listed !== false;
        coverInput.value = String(profile?.cover_image_url || profile?.coverImageUrl || "").trim();
        bioInput.value = String(profile?.bio || "").trim();
        Object.entries(socialInputs).forEach(([key, input]) => {
          input.value = social[key] || "";
        });
      } catch (_error) {
        status.textContent = "";
        toast?.error?.("Unable to load settings from Auth API.", {
          key: "members-settings-load",
          title: "Load failed",
          autoDismissMs: 6800
        });
      }
    })();
  }

  function init() {
    const pageId = document.body?.dataset?.membersPage || "home";
    const config = PAGE_CONFIG[pageId] || PAGE_CONFIG.home;
    const state = { query: "" };
    let data = null;
    let authState = window.StreamSuitesMembersSession.normalizeAuthState(null);

    const shell = window.StreamSuitesMembersShell.mount({
      title: config.title,
      searchPlaceholder: config.searchPlaceholder,
      activeHref: config.activeHref,
      showSearch: config.showSearch,
      accountLabel: "Login",
      onSearch(nextQuery) {
        state.query = nextQuery;
        render();
      },
      onAccountMenuAction: handleAccountMenuAction
    });

    function render() {
      if (!data) return;
      config.render({ host: shell.content, data, state, authState, shell });
    }

    function applyAuth() {
      window.StreamSuitesMembersSession.applyAuthStateToShell(shell, authState, handleAccountMenuAction);
    }

    async function refreshAuthWidget(force = false) {
      try {
        authState = await window.StreamSuitesMembersSession.fetchAuthState();
      } catch (_error) {
        if (force) {
          authState = window.StreamSuitesMembersSession.normalizeAuthState(null);
        }
      } finally {
        applyAuth();
        render();
      }
    }

    async function handleAccountMenuAction(action) {
      if (action === "public_login") {
        shell.openAuthModal("login");
        return;
      }
      if (action === "public_signup") {
        shell.openAuthModal("signup");
        return;
      }
      if (action !== "logout") return;

      try {
        await window.StreamSuitesMembersSession.logout();
      } catch (_error) {
        // Refresh local auth state regardless of logout response.
      }
      await refreshAuthWidget(true);
    }

    window.addEventListener("message", (event) => {
      if (!event?.data || event.data.type !== window.StreamSuitesMembersSession.AUTH_COMPLETE_MESSAGE_TYPE) return;
      if (event.origin !== window.location.origin && event.origin !== "https://members.streamsuites.app") return;
      refreshAuthWidget(true);
    });

    shell.content.appendChild(create("div", "empty-state", "Loading members hub..."));

    Promise.all([
      window.StreamSuitesMembersData.load(),
      refreshAuthWidget(false)
    ]).then(([loadedData]) => {
      data = loadedData;
      render();
    });
  }

  window.addEventListener("DOMContentLoaded", init, { once: true });
})();
