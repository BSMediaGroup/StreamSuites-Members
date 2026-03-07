(() => {
  const PAGE_CONFIG = {
    home: {
      title: "Community",
      searchPlaceholder: "Search members and notices"
    },
    members: {
      title: "Members",
      searchPlaceholder: "Search members"
    },
    notices: {
      title: "Notices",
      searchPlaceholder: "Search notices"
    }
  };

  function create(tag, className, text) {
    return window.StreamSuitesMembersUi.create(tag, className, text);
  }

  function clear(node) {
    return window.StreamSuitesMembersUi.clear(node);
  }

  function buildNoticeCard(notice, data, compact = false) {
    const card = create("article", `notice-card${compact ? " members-compact-card" : ""}`);
    const priority = create("span", `meta-pill members-priority-pill priority-${notice.priority}`, notice.priority);
    const meta = create(
      "div",
      "notice-meta",
      `${data.helpers.toTimestamp(notice.createdAt)} | ${notice.author.displayName}`
    );
    card.append(priority, create("h3", "", notice.title), create("p", "", notice.body), meta);
    return card;
  }

  function buildHubHero(data) {
    const hero = create("section", "members-home-hero");
    const copy = create("div", "members-home-hero-copy");
    const eyebrow = create("span", "members-home-eyebrow", "Members Surface");
    const title = create("h1", "", "Community hub foundation migrated into the dedicated members shell.");
    const text = create(
      "p",
      "",
      "This first pass ports the public discovery shell, directory framing, and notice surface into members.streamsuites.app while keeping deeper account and live integrations deferred."
    );
    copy.append(eyebrow, title, text);

    const stats = create("div", "members-home-stat-grid");
    [
      { value: String(data.profiles.filter((profile) => profile?.isListed !== false).length), label: "Listed profiles" },
      { value: String(data.notices.length), label: "Published notices" },
      { value: "Static", label: "Data mode" }
    ].forEach((item) => {
      const card = create("article", "members-home-stat-card");
      card.append(create("strong", "", item.value), create("span", "", item.label));
      stats.appendChild(card);
    });

    const actions = create("div", "members-home-actions");
    [
      ["/members/", "Browse members"],
      ["/notices/", "Read notices"],
      ["/u/testuser", "Open sample profile"]
    ].forEach(([href, label]) => {
      const link = create("a", "members-home-action", label);
      link.href = href;
      actions.appendChild(link);
    });

    hero.append(copy, stats, actions);
    return hero;
  }

  function buildHubOverview(data) {
    const wrap = create("section", "members-overview-grid");
    [
      {
        title: "Discovery Shell",
        body: "Sidebar navigation, search framing, cards, and panel styling now inherit the public community language instead of a blank placeholder."
      },
      {
        title: "Standalone Profiles",
        body: "Deep links under /u/<slug> stay outside the sidebar shell and render as full-page member profiles with dedicated framing."
      },
      {
        title: "Port Scope",
        body: `This pass carries ${data.notices.length} notice entries and ${data.profiles.length} profile records without adding live API or provider fetches yet.`
      }
    ].forEach((item) => {
      const card = create("article", "profile-card members-overview-card");
      card.append(create("h3", "", item.title), create("p", "members-shell-note", item.body));
      wrap.appendChild(card);
    });
    return wrap;
  }

  function renderHome(host, data, query) {
    clear(host);
    host.appendChild(buildHubHero(data));
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        "Community",
        "Latest notices and member discovery carried over from the existing public hub."
      )
    );
    host.appendChild(buildHubOverview(data));

    const latestNoticeSection = window.StreamSuitesMembersUi.buildSection("Latest Notice", "/notices/");
    const latestNotice = window.StreamSuitesMembersUi.filterNotices(data.notices, query)[0];
    if (latestNotice) {
      latestNoticeSection.appendChild(buildNoticeCard(latestNotice, data));
    } else {
      latestNoticeSection.appendChild(create("div", "empty-state", "No notices match this search."));
    }
    host.appendChild(latestNoticeSection);

    const membersSection = window.StreamSuitesMembersUi.buildSection("Featured Members", "/members/");
    const grid = create("div", "profile-grid");
    window.StreamSuitesMembersUi.filterProfiles(data.profiles, query)
      .slice(0, window.matchMedia("(max-width: 900px)").matches ? 4 : 8)
      .forEach((profile) => grid.appendChild(window.StreamSuitesMembersUi.buildProfileCard(profile)));
    if (grid.childElementCount) {
      membersSection.appendChild(grid);
    } else {
      membersSection.appendChild(create("div", "empty-state", "No members match this search."));
    }
    host.appendChild(membersSection);

    const noticePreviewSection = window.StreamSuitesMembersUi.buildSection("Recent Notice Feed", "/notices/");
    const feed = create("div", "members-overview-grid");
    window.StreamSuitesMembersUi.filterNotices(data.notices, query)
      .slice(0, 3)
      .forEach((notice) => feed.appendChild(buildNoticeCard(notice, data, true)));
    if (feed.childElementCount) {
      noticePreviewSection.appendChild(feed);
    } else {
      noticePreviewSection.appendChild(create("div", "empty-state", "No notice previews match this search."));
    }
    host.appendChild(noticePreviewSection);
  }

  function renderMembers(host, data, query) {
    clear(host);
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        "Members Directory",
        "Search all currently ported public community profiles inside the dedicated members repo."
      )
    );

    const intro = create("section", "members-overview-grid");
    [
      {
        title: "Dedicated Routing",
        body: "Cards link to /u/<slug> so creator profiles resolve as standalone pages instead of inside the hub sidebar shell."
      },
      {
        title: "Static Placeholder Data",
        body: "Profile cards currently use copied local JSON from the public hub while API and live status wiring remain intentionally disabled."
      }
    ].forEach((item) => {
      const card = create("article", "profile-card members-overview-card");
      card.append(create("h3", "", item.title), create("p", "members-shell-note", item.body));
      intro.appendChild(card);
    });
    host.appendChild(intro);

    const grid = create("section", "profile-grid");
    window.StreamSuitesMembersUi.filterProfiles(data.profiles, query)
      .forEach((profile) => grid.appendChild(window.StreamSuitesMembersUi.buildProfileCard(profile)));
    host.appendChild(grid);

    if (!grid.childElementCount) {
      host.appendChild(create("div", "empty-state", "No members match this search."));
    }
  }

  function renderNotices(host, data, query) {
    clear(host);
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        "Community Notices",
        "Published updates copied from the public hub to keep the members surface grounded in real existing content."
      )
    );

    const notices = window.StreamSuitesMembersUi.filterNotices(data.notices, query);
    const section = create("section", "section members-notice-stack");
    notices.forEach((notice) => section.appendChild(buildNoticeCard(notice, data)));
    host.appendChild(section);

    if (!notices.length) {
      host.appendChild(create("div", "empty-state", "No notices match this search."));
    }
  }

  async function init() {
    const pageId = document.body?.dataset?.membersPage || "home";
    const config = PAGE_CONFIG[pageId] || PAGE_CONFIG.home;
    const state = { query: "" };

    const shell = window.StreamSuitesMembersShell.mount({
      title: config.title,
      searchPlaceholder: config.searchPlaceholder,
      activeHref: window.location.pathname,
      onSearch(nextQuery) {
        state.query = nextQuery;
        render();
      }
    });

    shell.content.appendChild(create("div", "empty-state", "Loading members hub…"));
    const data = await window.StreamSuitesMembersData.load();

    function render() {
      if (pageId === "members") {
        renderMembers(shell.content, data, state.query);
        return;
      }
      if (pageId === "notices") {
        renderNotices(shell.content, data, state.query);
        return;
      }
      renderHome(shell.content, data, state.query);
    }

    render();
  }

  window.addEventListener("DOMContentLoaded", init, { once: true });
})();
