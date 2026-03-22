import { onRequestGet as __api_public_profile_js_onRequestGet } from "G:\\StreamSuites-Members\\functions\\api\\public\\profile.js"

export const routes = [
    {
      routePath: "/api/public/profile",
      mountPath: "/api/public",
      method: "GET",
      middlewares: [],
      modules: [__api_public_profile_js_onRequestGet],
    },
  ]