import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = process.cwd();
const membersDataSource = fs.readFileSync(path.join(repoRoot, "js/members-data.js"), "utf8");

function instantiateMembersData(fetchImpl) {
  const context = {
    window: {},
    fetch: fetchImpl,
    console,
    URL,
    Map,
    Set
  };
  vm.runInNewContext(membersDataSource, context, { filename: "members-data.js" });
  return context.window.StreamSuitesMembersData;
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    }
  };
}

test("members authoritative live adapter enriches rumble entries from discovery metadata", async () => {
  const api = instantiateMembersData(async (resource) => {
    if (resource === "/shared/state/live_status.json") {
      return jsonResponse({
        schema_version: "v1",
        generated_at: "2026-04-13T09:00:00Z",
        creators: [
          {
            creator_id: "creator-1",
            display_name: "Creator One",
            is_live: true,
            active_provider: "rumble",
            active_status: {
              provider: "rumble",
              is_live: true,
              live_title: "",
              live_url: "",
              viewer_count: null,
              freshness: "fresh",
              stale: false
            },
            freshness: "fresh",
            stale: false
          }
        ]
      });
    }
    if (resource === "/shared/state/rumble_live_discovery.json") {
      return jsonResponse({
        schema_version: "v1",
        provider: "rumble",
        creators: [
          {
            creator_id: "creator-1",
            display_name: "Creator One",
            is_live: true,
            live_title: "Discovery Title",
            live_url: "https://rumble.com/v123-discovery",
            viewer_count: 44,
            last_checked_at: "2026-04-13T08:45:00Z"
          }
        ]
      });
    }
    return jsonResponse({ items: [] }, 404);
  });

  const liveData = await api.loadAuthoritativeLiveMaps();
  const resolved = liveData.liveStatusMap.get("creator-1");
  assert.equal(resolved?.provider, "rumble");
  assert.equal(resolved?.title, "Discovery Title");
  assert.equal(resolved?.url, "https://rumble.com/v123-discovery");
  assert.equal(resolved?.viewerCount, 44);
});

test("members authoritative live adapter does not create live state from discovery alone", () => {
  const api = instantiateMembersData(async () => jsonResponse({ items: [] }));
  const rumbleDiscoveryMap = api.buildRumbleDiscoveryMap({
    creators: [
      {
        creator_id: "creator-1",
        display_name: "Creator One",
        is_live: true,
        live_title: "Discovery Only",
        live_url: "https://rumble.com/v123-discovery-only"
      }
    ]
  });

  const liveStatusMap = api.buildLiveStatusMap(
    {
      creators: [
        {
          creator_id: "creator-1",
          display_name: "Creator One",
          is_live: false,
          active_provider: null,
          active_status: null,
          freshness: "fresh",
          stale: false
        }
      ]
    },
    rumbleDiscoveryMap
  );

  assert.equal(liveStatusMap.get("creator-1") || null, null);
  assert.equal(api.resolveLiveStatus({ user_code: "creator-1" }, liveStatusMap, rumbleDiscoveryMap), null);
});

test("members authoritative live adapter suppresses non-rumble live providers for this phase", () => {
  const api = instantiateMembersData(async () => jsonResponse({ items: [] }));
  const resolved = api.normalizeLiveStatus({
    is_live: true,
    active_provider: "twitch",
    active_status: {
      provider: "twitch",
      is_live: true,
      freshness: "fresh",
      stale: false
    },
    freshness: "fresh",
    stale: false
  });
  assert.equal(resolved, null);
});

test("members authoritative live adapter ignores embedded live payloads when aggregate truth is absent", () => {
  const api = instantiateMembersData(async () => jsonResponse({ items: [] }));
  const resolved = api.resolveLiveStatus(
    {
      user_code: "creator-1",
      live_status: {
        is_live: true,
        active_provider: "rumble",
        active_status: {
          provider: "rumble",
          is_live: true,
          live_title: "Embedded Sample",
          freshness: "fresh",
          stale: false
        },
        freshness: "fresh",
        stale: false
      }
    },
    new Map(),
    new Map()
  );
  assert.equal(resolved, null);
});

test("members live loader prefers shared runtime exports and keeps checked-in mirrors as fallback", async () => {
  const calls = [];
  const api = instantiateMembersData(async (resource) => {
    calls.push(resource);
    if (resource === "/shared/state/live_status.json") return jsonResponse({}, 404);
    if (resource === "/data/live-status.json") {
      return jsonResponse({
        schema_version: "v1",
        generated_at: "2026-04-13T09:00:00Z",
        creators: []
      });
    }
    if (resource === "/shared/state/rumble_live_discovery.json") return jsonResponse({}, 404);
    if (resource === "/data/rumble_live_discovery.json") return jsonResponse({}, 404);
    return jsonResponse({ items: [] });
  });

  const liveData = await api.loadAuthoritativeLiveMaps();
  assert.equal(liveData.liveStatusPayload.generated_at, "2026-04-13T09:00:00Z");
  assert.ok(calls.indexOf("/shared/state/live_status.json") !== -1);
  assert.ok(calls.indexOf("/data/live-status.json") !== -1);
  assert.ok(calls.indexOf("/shared/state/live_status.json") < calls.indexOf("/data/live-status.json"));
});

test("findmehere root shell loads the shared live adapter before the app and uses it for hydration", () => {
  const indexHtml = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const appSource = fs.readFileSync(path.join(repoRoot, "js/findmehere-app.js"), "utf8");

  assert.match(indexHtml, /<script src="\/js\/members-data\.js" defer><\/script>/);
  assert.match(appSource, /loadAuthoritativeLiveMaps/);
  assert.match(appSource, /loadDirectoryProfiles\(liveData\.liveStatusMap\)/);
  assert.doesNotMatch(appSource, /return normalizeLiveStatus\(profile\?\.live_status \|\| profile\?\.liveStatus\)/);
});
