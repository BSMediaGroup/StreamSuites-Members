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

  function buildMetaPill(text, iconPath) {
    const pill = create("span", "meta-pill");
    if (iconPath) {
      const icon = create("img", "chip-icon");
      icon.src = iconPath;
      icon.alt = "";
      pill.appendChild(icon);
    }
    pill.appendChild(create("span", "", text));
    return pill;
  }

  function buildInfoSection(title, body) {
    const card = create("article", "profile-card");
    const heading = create("div", "section-heading");
    heading.appendChild(create("h2", "", title));
    card.append(heading, create("p", "members-profile-placeholder", body));
    return card;
  }

  function buildSidebarCards(profile) {
    const side = create("aside", "members-profile-section");

    const snapshot = create("article", "profile-card");
    const snapshotHeading = create("div", "section-heading");
    snapshotHeading.appendChild(create("h2", "", "Profile Snapshot"));
    snapshot.appendChild(snapshotHeading);
    const stats = create("div", "members-profile-stat-grid");
    [
      { value: profile.platform || "StreamSuites", label: "Primary platform" },
      { value: window.StreamSuitesMembersUi.roleLabel(profile.role), label: "Account role" },
      { value: (profile.tier || "core").toUpperCase(), label: "Membership tier" },
      { value: String(Object.keys(profile.socialLinks || {}).length), label: "Linked networks" }
    ].forEach((item) => {
      const stat = create("div", "members-profile-stat");
      stat.append(create("strong", "", item.value), create("span", "", item.label));
      stats.appendChild(stat);
    });
    snapshot.appendChild(stats);

    const share = create("article", "profile-card");
    const shareHeading = create("div", "section-heading");
    shareHeading.appendChild(create("h2", "", "Share"));
    share.append(
      shareHeading,
      window.StreamSuitesMembersUi.buildShareBox(new URL(window.location.pathname, window.location.origin).toString())
    );

    side.append(snapshot, share);
    return side;
  }

  function buildNotFoundState(root, rawSlug) {
    document.title = "Profile Not Found | StreamSuites Members";
    clear(root);
    root.className = "";

    const page = create("div", "members-profile-shell");
    const wrap = create("div", "members-profile-wrap");
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
    page.appendChild(wrap);
    root.appendChild(page);
  }

  function buildProfilePage(root, profile, canEdit, isPlaceholder) {
    document.title = `${profile.displayName} | StreamSuites Members`;
    clear(root);
    root.className = "";

    const page = create("div", "members-profile-shell");
    const wrap = create("div", "members-profile-wrap");

    const topbar = create("header", "members-profile-topbar");
    const brand = create("a", "members-profile-brand");
    brand.href = "/";
    const logo = create("img");
    logo.src = "/assets/logos/logo.png";
    logo.alt = "StreamSuites";
    const brandCopy = create("span", "members-profile-brand-copy");
    brandCopy.append(create("strong", "", "StreamSuites Members"), create("span", "", "Standalone profile route"));
    brand.append(logo, brandCopy);

    const nav = create("nav", "members-profile-nav");
    [
      ["/", "Hub"],
      ["/members/", "Directory"],
      ["/notices/", "Notices"],
      ["/settings/", "Settings"]
    ].forEach(([href, label]) => {
      const link = create("a", "members-profile-link", label);
      link.href = href;
      nav.appendChild(link);
    });
    topbar.append(brand, nav);

    const hero = create("section", "profile-card profile-card-expanded members-profile-hero");
    const cover = create("div", "members-profile-cover");
    const coverImage = create("img");
    coverImage.src = profile.coverImageUrl || "/assets/placeholders/defaultprofilecover.webp";
    coverImage.alt = `${profile.displayName} cover`;
    cover.appendChild(coverImage);
    hero.appendChild(cover);

    const heroBody = create("div", "members-profile-hero-body");
    const summary = create("div", "members-profile-summary");
    const avatar = window.StreamSuitesMembersUi.buildAvatar(profile, "members-profile-avatar");
    const summaryCopy = create("div", "members-profile-summary-copy");
    summaryCopy.appendChild(create("div", "members-profile-kicker", canEdit ? "Editable member profile" : isPlaceholder ? "Profile placeholder" : "Member profile"));

    const titleRow = create("div", "members-profile-title-row");
    titleRow.append(create("h1", "", profile.displayName), create("span", "members-profile-handle", `@${profile.userCode}`));
    summaryCopy.appendChild(titleRow);

    const meta = create("div", "members-profile-meta");
    meta.append(
      buildMetaPill(profile.platform, profile.platformIcon),
      buildMetaPill(window.StreamSuitesMembersUi.roleLabel(profile.role)),
      buildMetaPill((profile.tier || "core").toUpperCase())
    );
    summaryCopy.appendChild(meta);

    const bioText = profile.bio || "No bio provided yet.";
    const bio = create("p", "members-profile-placeholder", bioText);
    summaryCopy.appendChild(bio);

    const actions = create("div", "members-profile-actions");
    [
      ["/members/", "Back to directory"],
      ["/", "Open hub"]
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
    summaryCopy.appendChild(actions);

    summary.append(avatar, summaryCopy);
    heroBody.appendChild(summary);
    hero.appendChild(heroBody);

    const grid = create("div", "members-profile-grid");
    const main = create("section", "members-profile-section");
    main.append(
      buildInfoSection(
        "Profile Overview",
        canEdit
          ? "This standalone /u/<slug> page is using the same public profile hydration pattern as the original hub, with your authenticated profile data layered over the local fallback record."
          : "This standalone /u/<slug> page keeps the dedicated members route while using the original hub's hydrated public profile pattern where available."
      )
    );

    const socialCard = create("article", "profile-card");
    const socialHeading = create("div", "section-heading");
    socialHeading.appendChild(create("h2", "", "Linked Platforms"));
    socialCard.append(socialHeading, window.StreamSuitesMembersUi.buildSocialLinksRow(profile.socialLinks));
    main.appendChild(socialCard);

    if (isPlaceholder) {
      main.appendChild(
        buildInfoSection(
          "Placeholder Record",
          "No stored member record exists for this valid slug yet, so the route is rendering a polished placeholder frame instead of failing hard."
        )
      );
    }

    grid.append(main, buildSidebarCards(profile));
    wrap.append(topbar, hero, grid);
    page.appendChild(wrap);
    root.appendChild(page);
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
