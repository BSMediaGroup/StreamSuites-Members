(() => {
  function create(tag, className, text) {
    return window.StreamSuitesMembersUi.create(tag, className, text);
  }

  function clear(node) {
    return window.StreamSuitesMembersUi.clear(node);
  }

  function slugFromPath() {
    const parts = String(window.location.pathname || "")
      .split("/")
      .filter(Boolean);
    const raw = parts.length > 1 ? parts[1] : "";
    return window.StreamSuitesMembersData.normalizeUserCode(raw, "public-user");
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

  function buildArtifactPlaceholder(profile) {
    const wrap = create("div", "members-profile-list");
    [
      {
        title: "Recent activity feed",
        body: `Placeholder activity block for @${profile.userCode}. Live artifact plumbing has not been ported into StreamSuites-Members yet.`
      },
      {
        title: "Pinned creator/media modules",
        body: "Reserved for clips, polls, scoreboards, and tallies once the dedicated member data pipeline is migrated."
      }
    ].forEach((item) => {
      const card = create("article", "members-profile-list-item");
      card.append(create("strong", "", item.title), create("span", "", item.body));
      wrap.appendChild(card);
    });
    return wrap;
  }

  function buildRelatedNotices(notices, profile) {
    const wrap = create("div", "members-profile-list");
    const relevant = notices
      .filter((notice) => {
        const haystack = `${notice.title} ${notice.body} ${notice.author.displayName}`.toLowerCase();
        return haystack.includes(profile.displayName.toLowerCase()) || haystack.includes(profile.userCode.toLowerCase());
      })
      .slice(0, 3);

    if (!relevant.length) {
      wrap.appendChild(
        create(
          "div",
          "members-profile-empty",
          "No profile-specific notices are wired yet. This panel is reserved for account updates and member-facing announcements."
        )
      );
      return wrap;
    }

    relevant.forEach((notice) => {
      const card = create("article", "members-profile-list-item");
      card.append(
        create("strong", "", notice.title),
        create("span", "", `${window.StreamSuitesMembersData.toTimestamp(notice.createdAt)} | ${notice.body}`)
      );
      wrap.appendChild(card);
    });
    return wrap;
  }

  function buildStats(profile) {
    const grid = create("div", "members-profile-stat-grid");
    [
      { value: profile.role.toUpperCase(), label: "Account Role" },
      { value: (profile.tier || "core").toUpperCase(), label: "Membership Tier" },
      { value: Object.keys(profile.socialLinks || {}).length.toString(), label: "Linked Networks" },
      { value: "Static", label: "Profile Source" }
    ].forEach((item) => {
      const card = create("div", "members-profile-stat");
      card.append(create("strong", "", item.value), create("span", "", item.label));
      grid.appendChild(card);
    });
    return grid;
  }

  async function init() {
    const root = document.getElementById("profile-app");
    if (!root) return;
    root.className = "members-profile-loading";
    root.textContent = "Loading profile";

    const slug = slugFromPath();
    const data = await window.StreamSuitesMembersData.load();
    const profile =
      data.profilesByCode[slug] ||
      data.profiles.find((item) => item.userCode === slug || item.username === slug) ||
      {
        ...window.StreamSuitesMembersData.DEFAULT_PROFILE,
        userCode: slug,
        username: slug,
        displayName: slug.replace(/[-_]+/g, " "),
        bio: "Placeholder member profile prepared for the dedicated /u/<slug> route.",
        isPlaceholder: true
      };

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
    if (!String(profile.avatar || "").trim()) {
      avatar.textContent = String(profile.displayName || "P").trim().charAt(0).toUpperCase() || "P";
      avatar.classList.add("is-fallback");
    }
    const summaryCopy = create("div", "members-profile-summary-copy");
    summaryCopy.appendChild(create("div", "members-profile-kicker", profile.isPlaceholder ? "Profile placeholder" : "Member profile"));
    const titleRow = create("div", "members-profile-title-row");
    titleRow.append(
      create("h1", "", profile.displayName),
      create("span", "members-profile-handle", `@${profile.userCode}`)
    );
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
        profile.bio || "Dedicated member profile route seeded from the existing community hub foundation."
      )
    );
    const actions = create("div", "members-profile-actions");
    const openDirectory = create("a", "members-profile-link", "Back to directory");
    openDirectory.href = "/members/";
    actions.appendChild(openDirectory);
    summaryCopy.appendChild(actions);
    summary.append(avatar, summaryCopy);
    heroBody.appendChild(summary);
    hero.appendChild(heroBody);

    const grid = create("div", "members-profile-grid");
    const main = create("section", "members-profile-section");
    const aboutCard = create("article", "profile-card");
    const aboutHeading = create("div", "section-heading");
    aboutHeading.appendChild(create("h2", "", "Profile Overview"));
    aboutCard.appendChild(aboutHeading);
    aboutCard.appendChild(
      create(
        "p",
        "members-profile-placeholder",
        "This is a standalone full-page profile foundation for Cloudflare Pages deep links. Live member data, artifacts, and account editing will be migrated later."
      )
    );
    aboutCard.appendChild(window.StreamSuitesMembersUi.buildSocialLinksRow(profile.socialLinks));
    aboutCard.appendChild(
      window.StreamSuitesMembersUi.buildShareBox(new URL(window.location.pathname, window.location.origin).toString())
    );

    const modulesCard = create("article", "profile-card");
    const modulesHeading = create("div", "section-heading");
    modulesHeading.appendChild(create("h2", "", "Planned Modules"));
    modulesCard.appendChild(modulesHeading);
    modulesCard.appendChild(buildArtifactPlaceholder(profile));
    main.append(aboutCard, modulesCard);

    const side = create("aside", "members-profile-section");
    const statsCard = create("article", "profile-card");
    const statsHeading = create("div", "section-heading");
    statsHeading.appendChild(create("h2", "", "Profile Snapshot"));
    statsCard.append(statsHeading, buildStats(profile));
    const noticeCard = create("article", "profile-card");
    const noticeHeading = create("div", "section-heading");
    noticeHeading.appendChild(create("h2", "", "Member Notices"));
    noticeCard.append(noticeHeading, buildRelatedNotices(data.notices, profile));
    side.append(statsCard, noticeCard);

    grid.append(main, side);
    wrap.append(topbar, hero, grid);
    page.appendChild(wrap);
    root.appendChild(page);
  }

  window.addEventListener("DOMContentLoaded", init, { once: true });
})();
