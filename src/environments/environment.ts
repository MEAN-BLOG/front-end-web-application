export const environment = {
  production: false,
  apiUrl: "https://blog-back-end-4f1o.onrender.com/api/v1",
  socketUrl: "https://blog-back-end-4f1o.onrender.com",
  appName: "collab-blog",
  tokenKey: 'cb_access_token',
  refreshTokenKey: 'cb_refresh_token'
};

export const jwtWhitelistedDomains = ["https://blog-back-end-4f1o.onrender.com"];
export const jwtBlacklistedRoutes = [];