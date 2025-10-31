export const environment = {
  production: false,
  apiUrl: "https://back-end-service-blog.vercel.app/api/v1",
  socketUrl: "https://back-end-service-blog.vercel.app",
  appName: "collab-blog",
  tokenKey: 'cb_access_token',
  refreshTokenKey: 'cb_refresh_token'
};

export const jwtWhitelistedDomains = ["https://back-end-service-blog.vercel.app"];
export const jwtBlacklistedRoutes = [];