export const environment = {
  production: false,
  apiUrl: "http://localhost:5000/api/v1",
  socketUrl: "http://localhost:5000/api",
  appName: "collab-blog",
  tokenKey: 'cb_access_token',
  refreshTokenKey: 'cb_refresh_token'
};

export const jwtWhitelistedDomains = ["http://localhost:5000"];
export const jwtBlacklistedRoutes = [];