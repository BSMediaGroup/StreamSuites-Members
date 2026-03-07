(() => {
  const ROLE_ICON_MAP = Object.freeze({
    admin: "/assets/icons/tierbadge-admin.svg"
  });

  const TIER_ICON_MAP = Object.freeze({
    core: "/assets/icons/tierbadge-core.svg",
    gold: "/assets/icons/tierbadge-gold.svg",
    pro: "/assets/icons/tierbadge-pro.svg"
  });

  const SOCIAL_ICON_MAP = Object.freeze({
    youtube: "/assets/icons/youtube.svg",
    rumble: "/assets/icons/rumble.svg",
    discord: "/assets/icons/discord.svg",
    x: "/assets/icons/x.svg",
    twitter: "/assets/icons/twitter.svg",
    twitch: "/assets/icons/twitch.svg",
    kick: "/assets/icons/kick.svg",
    github: "/assets/icons/github.svg",
    website: "/assets/icons/ui/globe.svg",
    tiktok: "/assets/icons/ui/widget.svg"
  });

  const UI_ICON_MAP = Object.freeze({
    copy: "/assets/icons/ui/portal.svg",
    check: "/assets/icons/ui/tickyes.svg"
  });

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function createIcon(path, className = "button-icon-mask") {
    const icon = create("span", className);
    icon.setAttribute("aria-hidden", "true");
    icon.style.setProperty("--icon-mask", `url("${String(path || "").trim()}")`);
    return icon;
  }

  function normalizeRoleForUi(value) {
    const role = String(value || "").trim().toLowerCase();
    if (role.includes("admin")) return "admin";
    if (role.includes("creator")) return "creator";
    return "viewer";
  }

  function normalizeTierForUi(value) {
    const tier = String(value || "").trim().toLowerCase();
    if (tier === "gold" || tier === "pro") return tier;
    return "core";
  }

  function roleLabel(role) {
    if (role === "admin") return "ADMIN";
    if (role === "creator") return "CREATOR";
    return "VIEWER";
  }

  function buildProfileHref(profileOrCode) {
    const rawCode =
      typeof profileOrCode === "string"
        ? profileOrCode
        : profileOrCode?.userCode || profileOrCode?.username || profileOrCode?.id || "public-user";
    const code = window.StreamSuitesMembersData.normalizeUserCode(rawCode, "public-user");
    return `/u/${encodeURIComponent(code)}`;
  }

  function buildAvatar(profile, className = "creator-avatar") {
    const avatar = create("span", className);
    const image = String(profile?.avatar || "").trim();
    if (image) {
      avatar.style.backgroundImage = `url(${image})`;
      avatar.classList.add("has-image");
      return avatar;
    }
    avatar.textContent = String(profile?.displayName || "P").trim().charAt(0).toUpperCase() || "P";
    avatar.classList.add("is-fallback");
    return avatar;
  }

  function createBadgeIcon(type, value) {
    const icon = create("img", "badge-icon");
    const normalized = String(value || "").trim().toLowerCase();
    if (type === "tier") {
      icon.src = TIER_ICON_MAP[normalized] || TIER_ICON_MAP.core;
      icon.alt = `${normalized || "core"} tier`;
      icon.classList.add("badge-icon-tier", "ss-tier-badge");
      icon.setAttribute("data-ss-badge-kind", "tier");
      return icon;
    }
    icon.src = ROLE_ICON_MAP[normalized] || ROLE_ICON_MAP.admin;
    icon.alt = `${normalized || "viewer"} role`;
    icon.classList.add("badge-icon-role", "ss-role-badge");
    icon.setAttribute("data-ss-badge-kind", "role");
    return icon;
  }

  function buildBadgeSuffix(profile, options = {}) {
    const includeRoleChip = Boolean(options.includeRoleChip);
    const row = create("span", "creator-badges ss-role-badges");
    row.setAttribute("data-ss-role-badge", "");
    const role = normalizeRoleForUi(profile?.role);
    const tier = normalizeTierForUi(profile?.tier);
    if (role === "admin") {
      row.appendChild(createBadgeIcon("role", "admin"));
    } else if (role === "creator") {
      row.appendChild(createBadgeIcon("tier", tier));
    }

    if (includeRoleChip) {
      row.appendChild(create("span", "badge-role-chip", roleLabel(role)));
    }
    return row;
  }

  function setHoverDataAttr(node, name, value) {
    if (!node || !name) return;
    const text = String(value || "").trim();
    if (text) {
      node.setAttribute(name, text);
      return;
    }
    node.removeAttribute(name);
  }

  function setHoverJsonAttr(node, name, value) {
    if (!node || !name) return;
    if (value == null) {
      node.removeAttribute(name);
      return;
    }
    let text = "";
    try {
      text = JSON.stringify(value);
    } catch (_err) {
      text = "";
    }
    if (text && text !== "{}" && text !== "[]") {
      node.setAttribute(name, text);
      return;
    }
    node.removeAttribute(name);
  }

  function applyProfileHoverAttrs(node, profile) {
    if (!node || !profile || typeof profile !== "object") return;
    node.classList.add("ss-profile-hover");
    setHoverDataAttr(node, "data-ss-profile-href", buildProfileHref(profile));
    setHoverDataAttr(node, "data-ss-user-code", profile.userCode || profile.username || profile.id);
    setHoverDataAttr(node, "data-ss-user-id", profile.id || profile.userCode || profile.username);
    setHoverDataAttr(node, "data-ss-display-name", profile.displayName || profile.username || "Public User");
    setHoverDataAttr(node, "data-ss-avatar-url", profile.avatar || "");
    setHoverDataAttr(node, "data-ss-role", roleLabel(normalizeRoleForUi(profile.role)));
    setHoverDataAttr(node, "data-ss-bio", profile.bio || "");
    setHoverDataAttr(node, "data-ss-cover-url", profile.coverImageUrl || "");
    setHoverJsonAttr(node, "data-ss-social-links", profile.socialLinks || {});
    setHoverJsonAttr(node, "data-ss-badges", Array.isArray(profile.badges) ? profile.badges : []);
  }

  function buildCreatorMeta(profile, options = {}) {
    const expanded = Boolean(options.expanded);
    const includeRoleChip = Boolean(options.includeRoleChip);
    const row = create("div", "creator-meta");
    if (expanded) row.classList.add("is-expanded");
    applyProfileHoverAttrs(row, profile);

    const avatar = buildAvatar(profile);
    if (expanded) avatar.classList.add("is-expanded");
    row.appendChild(avatar);

    const textWrap = create("div", "creator-meta-text");
    const top = create("div", "creator-meta-top");
    top.append(
      create("span", "creator-name", profile?.displayName || "Public User"),
      buildBadgeSuffix(profile, { includeRoleChip })
    );
    const bottom = create("div", "creator-meta-bottom", profile?.platform || "StreamSuites");
    textWrap.append(top, bottom);
    row.appendChild(textWrap);
    return row;
  }

  function buildProfileCard(profile, options = {}) {
    const card = create("article", "profile-card");
    applyProfileHoverAttrs(card, profile);
    card.appendChild(buildCreatorMeta(profile, { expanded: true, includeRoleChip: false }));
    card.appendChild(create("p", "item-snippet", profile.bio || "Community member profile synchronized from the public hub."));

    const meta = create("div", "item-meta");
    meta.appendChild(create("span", "meta-pill", roleLabel(normalizeRoleForUi(profile.role))));
    if (profile.tier) meta.appendChild(create("span", "meta-pill", String(profile.tier).toUpperCase()));
    if (options.submeta) meta.appendChild(create("span", "meta-pill", options.submeta));
    card.appendChild(meta);

    const link = create("a", "see-all", options.linkLabel || "Open profile");
    link.href = buildProfileHref(profile);
    card.appendChild(link);
    return card;
  }

  function buildPageHeading(title, subtitle) {
    const heading = create("section", "page-heading page-heading-compact");
    heading.append(create("h1", "", title), create("p", "", subtitle || ""));
    return heading;
  }

  function buildSection(title, seeAllHref) {
    const section = create("section", "section");
    const head = create("div", "section-heading");
    head.appendChild(create("h2", "", title));
    if (seeAllHref) {
      const link = create("a", "see-all", "See all");
      link.href = seeAllHref;
      head.appendChild(link);
    }
    section.appendChild(head);
    return section;
  }

  function copyTextToClipboard(text) {
    const payload = String(text || "");
    if (!payload) return Promise.resolve(false);
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(payload).then(() => true, () => false);
    }
    return Promise.resolve(false);
  }

  function buildShareBox(url) {
    const box = create("div", "share-box");
    const text = create("code", "share-link-text", url);
    text.setAttribute("title", url);
    const button = create("button", "share-copy-btn");
    button.type = "button";
    button.setAttribute("aria-label", "Copy share link");
    button.appendChild(createIcon(UI_ICON_MAP.copy));
    button.addEventListener("click", () => {
      copyTextToClipboard(url).then((copied) => {
        button.innerHTML = "";
        button.appendChild(createIcon(copied ? UI_ICON_MAP.check : UI_ICON_MAP.copy));
      });
    });
    box.append(text, button);
    return box;
  }

  function buildSocialLinksRow(socialLinks) {
    const row = create("div", "profile-social-row");
    const entries = Object.entries(socialLinks || {});
    if (!entries.length) {
      row.appendChild(create("span", "muted", "No social links set."));
      return row;
    }
    entries.forEach(([network, url]) => {
      const href = String(url || "").trim();
      if (!href) return;
      const anchor = create("a", "social-icon-btn");
      anchor.href = /^https?:\/\//i.test(href) ? href : `https://${href.replace(/^\/+/, "")}`;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.setAttribute("aria-label", network);
      const icon = create("img");
      icon.src = SOCIAL_ICON_MAP[String(network || "").toLowerCase()] || SOCIAL_ICON_MAP.website;
      icon.alt = "";
      anchor.appendChild(icon);
      row.appendChild(anchor);
    });
    return row;
  }

  function filterProfiles(profiles, query) {
    const needle = String(query || "").trim().toLowerCase();
    return profiles.filter((profile) => {
      if (profile?.isListed === false) return false;
      if (!needle) return true;
      const haystack = [
        profile.displayName,
        profile.username,
        profile.role,
        profile.platform,
        profile.bio
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }

  function filterNotices(notices, query) {
    const needle = String(query || "").trim().toLowerCase();
    return notices.filter((notice) => {
      if (!needle) return true;
      const haystack = [
        notice.title,
        notice.body,
        notice.priority,
        notice.author?.displayName
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }

  window.StreamSuitesMembersUi = {
    create,
    clear,
    createIcon,
    normalizeRoleForUi,
    normalizeTierForUi,
    roleLabel,
    buildProfileHref,
    buildAvatar,
    buildCreatorMeta,
    buildProfileCard,
    buildPageHeading,
    buildSection,
    buildShareBox,
    buildSocialLinksRow,
    applyProfileHoverAttrs,
    filterProfiles,
    filterNotices
  };
})();
