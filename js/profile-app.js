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

  function buildBadgeList(profile) {
    const wrap = create("div", "members-profile-pill-row");
    const entries = [];

    if (profile.role) {
      entries.push(window.StreamSuitesMembersUi.roleLabel(profile.role));
    }
    if (profile.tier) {
      entries.push(`${String(profile.tier).toUpperCase()} tier`);
    }
    if (!entries.length) {
      entries.push("Badges coming soon");
    }

    entries.forEach((entry) => wrap.appendChild(create("span", "meta-pill", entry)));
    return wrap;
  }

  function buildPlatformLinks(profile) {
    const card = create("article", "profile-card");
    const heading = create("div", "section-heading");
    heading.appendChild(create("h2", "", "Linked Platforms"));
    card.appendChild(heading);
    card.appendChild(window.StreamSuitesMembersUi.buildSocialLinksRow(profile.socialLinks));
    if (!Object.keys(profile.socialLinks || {}).length) {
      card.appendChild(
        create(
          "p",
          "members-profile-placeholder",
          "Platform links are still placeholder-only in this migration pass. Profile wiring will expand after the dedicated members data layer is connected."
        )
      );
    }
    return card;
  }

  function buildRecentStatus(profile) {
    const card = create("article", "profile-card");
    const heading = create("div", "section-heading");
    heading.appendChild(create("h2", "", "Recent / Live Status"));
    card.appendChild(heading);

    const statusGrid = create("div", "members-profile-list");
    [
      {
        title: "Presence",
        body: `No live provider is connected yet for @${profile.userCode}. This tile is reserved for cross-platform live/offline presence.`
      },
      {
        title: "Recent Activity",
        body: "Recent clips, polls, scoreboards, and tallies will land here once the members repo adopts the related artifact feeds."
      }
    ].forEach((item) => {
      const row = create("article", "members-profile-list-item");
      row.append(create("strong", "", item.title), create("span", "", item.body));
      statusGrid.appendChild(row);
    });

    card.appendChild(statusGrid);
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

  function buildProfilePage(root, profile, isPlaceholder) {
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
      ["/notices/", "Notices"]
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
    summaryCopy.appendChild(create("div", "members-profile-kicker", isPlaceholder ? "Profile placeholder" : "Member profile"));

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

    summaryCopy.appendChild(
      create(
        "p",
        "members-profile-placeholder",
        profile.bio || "This dedicated profile is ready for future live member data and richer artifact modules."
      )
    );

    const heroBadges = create("div", "members-profile-section-block");
    heroBadges.append(create("h2", "", "Badges"), buildBadgeList(profile));
    summaryCopy.appendChild(heroBadges);

    const actions = create("div", "members-profile-actions");
    [
      ["/members/", "Back to directory"],
      ["/", "Open hub"]
    ].forEach(([href, label]) => {
      const link = create("a", "members-profile-link", label);
      link.href = href;
      actions.appendChild(link);
    });
    summaryCopy.appendChild(actions);

    summary.append(avatar, summaryCopy);
    heroBody.appendChild(summary);
    hero.appendChild(heroBody);

    const grid = create("div", "members-profile-grid");
    const main = create("section", "members-profile-section");
    main.append(
      buildInfoSection(
        "Profile Overview",
        "This standalone /u/<slug> page is intentionally outside the hub sidebar shell and is structured as the production-clean placeholder for the future member profile surface."
      ),
      buildInfoSection(
        "Bio",
        profile.bio || "Short bio placeholder. This section will become editable once member profile plumbing is migrated."
      ),
      buildPlatformLinks(profile),
      buildRecentStatus(profile)
    );

    if (isPlaceholder) {
      main.appendChild(
        buildInfoSection(
          "Placeholder Record",
          "No stored member record exists for this valid slug yet, so the route is rendering a polished placeholder profile frame instead of failing hard."
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

    const data = await window.StreamSuitesMembersData.load();
    const existingProfile =
      data.profilesByCode[normalizedSlug] ||
      data.profiles.find((item) => item.userCode === normalizedSlug || item.username === normalizedSlug) ||
      null;

    const profile = existingProfile || {
      ...window.StreamSuitesMembersData.DEFAULT_PROFILE,
      id: normalizedSlug,
      userCode: normalizedSlug,
      username: normalizedSlug,
      displayName: normalizedSlug.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      bio: "Placeholder member profile prepared for the dedicated /u/<slug> route.",
      socialLinks: {},
      isPlaceholder: true
    };

    buildProfilePage(root, profile, !existingProfile);
  }

  window.addEventListener("DOMContentLoaded", init, { once: true });
})();
