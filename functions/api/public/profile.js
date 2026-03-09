const UPSTREAM_PROFILE_URL = "https://api.streamsuites.app/api/public/profile";

function buildUpstreamUrl(requestUrl) {
  const upstream = new URL(UPSTREAM_PROFILE_URL);
  const incoming = new URL(requestUrl);
  incoming.searchParams.forEach((value, key) => {
    upstream.searchParams.set(key, value);
  });
  return upstream;
}

export async function onRequestGet(context) {
  const upstreamUrl = buildUpstreamUrl(context.request.url);
  const upstreamResponse = await fetch(upstreamUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
    redirect: "follow"
  });

  const headers = new Headers(upstreamResponse.headers);
  headers.set("Cache-Control", "no-store");
  headers.delete("Access-Control-Allow-Origin");
  headers.delete("Access-Control-Allow-Credentials");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers
  });
}
