export const environment = {
  production: false,
  azure: {
    clientId: 'e2d52786-8292-433e-a464-d575268eca38',
    tenantId: '5fb0afd3-b475-47e9-862b-1ce06143be35',
    authority: 'https://login.microsoftonline.com/5fb0afd3-b475-47e9-862b-1ce06143be35',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    protectedResourceScopes: ['api://e2d52786-8292-433e-a464-d575268eca38/read']
  },
  apiBaseUrl: 'https://kid5q813hh.execute-api.us-east-1.amazonaws.com/api'
};