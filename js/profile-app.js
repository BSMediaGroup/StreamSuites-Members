(() => {
  function create(tag, className, text) {
    return window.StreamSuitesMembersUi.create(tag, className, text);
  }

  function clear(node) {
    return window.StreamSuitesMembersUi.clear(node);
  }

  function readRouteSlug() {
    const parts = String(window.location.pathname || "")
      .split("/")
      .filter(Boolean);
    return parts[0] === "u" && parts.length > 1 ? String(parts[1] || "").trim() : "";
  }

  function buildStandaloneShell(root) {
    clear(root);
    root.className = "";

    const page = create("div", "members-profile-shell members-profile-route");
    const wrap = create("div", "members-profile-wrap members-profile-route-wrap");
    page.appendChild(wrap);
    root.appendChild(page);
    return wrap;
  }

  function buildNotFoundState(root, rawSlug) {
    document.title = "Profile Not Found | StreamSuites Members";
    const wrap = buildStandaloneShell(root);
    const card = create("section", "profile-card profile-card-expanded members-profile-not-found");
    card.append(
      create("span", "members-home-eyebrow", "Invalid profile route"),
      create("h1", "", "This member profile could not be resolved."),
      create(
        "p",
        "members-profile-placeholder",
        rawSlug
          ? `The slug "${rawSlug}" is missing or malformed for the dedicated /u/<slug> route.`
          : "This route is missing a member slug. Use a path such as /u/testuser."
      )
    );

    const actions = create("div", "members-profile-actions");
    [
      ["/", "Return to hub"],
      ["/members/", "Browse members"],
      ["/u/testuser", "Open sample route"]
    ].forEach(([href, label]) => {
      const link = create("a", "members-profile-link", label);
      link.href = href;
      actions.appendChild(link);
    });
    card.appendChild(actions);
    wrap.appendChild(card);
  }

  function buildRouteHeader(profile, canEdit) {
    const header = create("section", "page-heading page-heading-compact members-profile-route-header");
    const back = create("a", "see-all members-profile-route-back", "Back to members");
    back.href = "/members/";
    header.append(
      back,
      create("h1", "", profile.displayName),
      create(
        "p",
        "",
        `${profile.platform || "StreamSuites"} | ${window.StreamSuitesMembersUi.roleLabel(profile.role)}${
          canEdit ? " | Editable profile" : ""
        }`
      )
    );
    return header;
  }

  function buildPlaceholderCard() {
    const card = create("article", "profile-card");
    const heading = create("div", "section-heading");
    heading.appendChild(create("h2", "", "Placeholder Record"));
    card.append(
      heading,
      create(
        "p",
        "members-profile-placeholder",
        "No stored member record exists for this valid slug yet, so this dedicated route is using the standalone public-profile body with placeholder data instead of failing hard."
      )
    );
    return card;
  }

  function buildProfilePage(root, profile, canEdit, isPlaceholder) {
    const toast = window.StreamSuitesMembersToast;
    document.title = `${profile.displayName} | StreamSuites Members`;
    const wrap = buildStandaloneShell(root);

    wrap.appendChild(buildRouteHeader(profile, canEdit));

    const stack = create("div", "members-profile-route-stack");
    const profileCard = create("article", "profile-card profile-card-expanded");

    const coverWrap = create("div", "profile-cover");
    const coverImage = create("img");
    coverImage.src = profile.coverImageUrl || "/assets/placeholders/defaultprofilecover.webp";
    coverImage.alt = `${profile.displayName} cover`;
    coverWrap.appendChild(coverImage);
    profileCard.appendChild(coverWrap);

    profileCard.appendChild(window.StreamSuitesMembersUi.buildCreatorMeta(profile, { expanded: true, includeRoleChip: true }));
    const liveBanner = window.StreamSuitesMembersUi.buildProfileLiveBanner(profile);
    if (liveBanner) profileCard.appendChild(liveBanner);

    const socialHeader = create("div", "profile-inline-header");
    socialHeader.append(create("h3", "", "Social Links"));
    if (canEdit) {
      const editSocial = create("a", "edit-affordance", "Edit");
      editSocial.href = "/settings/";
      socialHeader.appendChild(editSocial);
    }
    profileCard.append(socialHeader, window.StreamSuitesMembersUi.buildSocialLinksRow(profile.socialLinks));

    const bioHeader = create("div", "profile-inline-header");
    bioHeader.append(create("h3", "", "Bio"));
    const bioBody = create("p", "profile-bio-text", profile.bio || "No bio provided yet.");
    profileCard.append(bioHeader, bioBody);

    const shareHeader = create("div", "profile-inline-header");
    shareHeader.appendChild(create("h3", "", "Profile Share Link"));
    profileCard.append(shareHeader, window.StreamSuitesMembersUi.buildShareBox(new URL(window.location.pathname, window.location.origin).toString()));

    if (canEdit) {
      const privacyWrap = create("label", "profile-visibility-toggle");
      const toggle = create("input");
      toggle.type = "checkbox";
      toggle.checked = profile.isAnonymous === true;
      const text = create("span", "", "Anonymous / Private profile");
      const status = create("span", "muted");
      privacyWrap.append(toggle, text, status);
      profileCard.appendChild(privacyWrap);

      toggle.addEventListener("change", async () => {
        status.textContent = "Saving...";
        toggle.disabled = true;
        try {
          const updated = await window.StreamSuitesMembersSession.saveMyPublicProfile({ anonymous: toggle.checked });
          profile.isAnonymous = updated?.is_anonymous === true || updated?.anonymous === true;
          toggle.checked = profile.isAnonymous;
          status.textContent = "";
          toast?.success?.(
            profile.isAnonymous ? "Anonymous mode enabled." : "Public profile visibility restored.",
            {
              key: "members-profile-privacy",
              title: "Profile updated"
            }
          );
        } catch (error) {
          toggle.checked = !toggle.checked;
          status.textContent = "";
          toast?.error?.(error instanceof Error ? error.message : "Save failed", {
            key: "members-profile-privacy",
            title: "Save failed",
            autoDismissMs: 6800
          });
        } finally {
          toggle.disabled = false;
        }
      });
    }

    stack.appendChild(profileCard);

    const actions = create("div", "members-profile-actions members-profile-route-actions");
    [
      ["/", "Open hub"],
      ["/members/", "Browse members"]
    ].forEach(([href, label]) => {
      const link = create("a", "members-profile-link", label);
      link.href = href;
      actions.appendChild(link);
    });
    if (canEdit) {
      const settings = create("a", "members-profile-link", "Edit in settings");
      settings.href = "/settings/";
      actions.appendChild(settings);
    }
    stack.appendChild(actions);

    if (isPlaceholder) {
      stack.appendChild(buildPlaceholderCard());
    }

    wrap.appendChild(stack);
  }

  async function init() {
    const root = document.getElementById("profile-app");
    if (!root) return;

    root.className = "members-profile-loading";
    root.textContent = "Loading profile";

    const rawSlug = readRouteSlug();
    if (!rawSlug || !window.StreamSuitesMembersData.isValidUserCode(rawSlug)) {
      buildNotFoundState(root, rawSlug);
      return;
    }

    const normalizedSlug = window.StreamSuitesMembersData.normalizeUserCode(rawSlug, "");
    if (!normalizedSlug) {
      buildNotFoundState(root, rawSlug);
      return;
    }

    const [data, authState] = await Promise.all([
      window.StreamSuitesMembersData.load(),
      window.StreamSuitesMembersSession.fetchAuthState().catch(() => window.StreamSuitesMembersSession.normalizeAuthState(null))
    ]);

    const fallbackProfile = window.StreamSuitesMembersData.resolveProfile(data, normalizedSlug);
    const isOwner = Boolean(authState?.authenticated) && authState.userCode === normalizedSlug;

    let profile = fallbackProfile;
    let isPlaceholder = profile.userCode !== normalizedSlug;

    try {
      const payload = isOwner
        ? await window.StreamSuitesMembersSession.fetchMyPublicProfile()
        : await window.StreamSuitesMembersSession.fetchPublicProfileByCode(normalizedSlug);
      profile = window.StreamSuitesMembersData.normalizeProfilePayload(payload, fallbackProfile, normalizedSlug);
      isPlaceholder = false;
    } catch (_error) {
      if (fallbackProfile.userCode === normalizedSlug) {
        profile = fallbackProfile;
        isPlaceholder = false;
      } else {
        profile = {
          ...window.StreamSuitesMembersData.DEFAULT_PROFILE,
          id: normalizedSlug,
          userCode: normalizedSlug,
          username: normalizedSlug,
          displayName: normalizedSlug.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
          bio: "Placeholder member profile prepared for the dedicated /u/<slug> route.",
          socialLinks: {}
        };
        isPlaceholder = true;
      }
    }

    buildProfilePage(root, profile, isOwner, isPlaceholder);
  }

  window.addEventListener("DOMContentLoaded", init, { once: true });
})();
