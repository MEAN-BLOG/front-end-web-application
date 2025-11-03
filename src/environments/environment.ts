export const firebaseConfig = {
  apiKey: 'AIzaSyBH6gEwcuuwBBDu_Enk5Q9TpU0xsywuQPo',
  authDomain: 'progess-e18eb.firebaseapp.com',
  projectId: 'progess-e18eb',
  storageBucket: 'progess-e18eb.appspot.com',
  messagingSenderId: '356981403720',
  appId: '1:356981403720:web:2cb77c70163f60ed00a87d',
};

export const environment = {
  production: false,
  apiUrl: 'https://blog-back-end-4f1o.onrender.com/api/v1',
  socketUrl: 'https://blog-back-end-4f1o.onrender.com',
  appName: 'collab-blog',
  tokenKey: 'cb_access_token',
  refreshTokenKey: 'cb_refresh_token',
  firebase: firebaseConfig,
};

export const jwtWhitelistedDomains = ['https://blog-back-end-4f1o.onrender.com'];
export const jwtBlacklistedRoutes = [];
