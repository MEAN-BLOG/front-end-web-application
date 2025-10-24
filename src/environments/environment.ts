export const environment = {
  production: false,
  apiUrl: process.env.API_URL,
  socketUrl: process.env.SOCKET_URL,
  appName: process.env.APP_NAME,
  tokenKey: process.env.TOKEN_KEY,
  refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
  tokenExpirationKey: process.env.TOKEN_EXPIRATION_KEY,
};

export const jwtWhitelistedDomains = [process.env.BASE_URL];
export const jwtBlacklistedRoutes = [];