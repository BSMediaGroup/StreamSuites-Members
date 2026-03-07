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

  function renderHome(host, data, query) {
    clear(host);
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        "Community",
        "Initial members hub ported from the existing public community shell."
      )
    );

    const latestNoticeSection = window.StreamSuitesMembersUi.buildSection("Latest Notice", "/notices/");
    const latestNotice = window.StreamSuitesMembersUi.filterNotices(data.notices, query)[0];
    if (latestNotice) {
      const card = create("article", "notice-card");
      card.append(
        create("h3", "", latestNotice.title),
        create("p", "", latestNotice.body),
        create(
          "div",
          "notice-meta",
          `${data.helpers.toTimestamp(latestNotice.createdAt)} | ${latestNotice.author.displayName}`
        )
      );
      latestNoticeSection.appendChild(card);
    } else {
      latestNoticeSection.appendChild(create("div", "empty-state", "No notices match this search."));
    }
    host.appendChild(latestNoticeSection);

    const membersSection = window.StreamSuitesMembersUi.buildSection("Members", "/members/");
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

    host.appendChild(
      create(
        "p",
        "members-shell-note",
        "Live data plumbing, auth-aware settings, and provider-backed status modules are intentionally deferred in this first members-repo port."
      )
    );
  }

  function renderMembers(host, data, query) {
    clear(host);
    host.appendChild(
      window.StreamSuitesMembersUi.buildPageHeading(
        "Members Directory",
        "Static member directory foundation ready for dedicated profile routes."
      )
    );
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
        "Published updates copied from the existing public hub dataset."
      )
    );
    const section = create("section", "section");
    const notices = window.StreamSuitesMembersUi.filterNotices(data.notices, query);
    notices.forEach((notice) => {
      const card = create("article", "notice-card");
      card.append(
        create("h3", "", notice.title),
        create("p", "", notice.body),
        create(
          "div",
          "notice-meta",
          `${notice.priority} | ${data.helpers.toTimestamp(notice.createdAt)} | ${notice.author.displayName}`
        )
      );
      section.appendChild(card);
    });
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
