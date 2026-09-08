export const environment = {
  production: false,
  azure: {
    clientId: 'TU_CLIENT_ID_AQUI',
    tenantId: 'TU_TENANT_ID_AQUI',
    authority: 'https://login.microsoftonline.com/TU_TENANT_ID_AQUI',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    protectedResourceScopes: ['api://TU_API_CLIENT_ID/access_as_user']
  },
  apiBaseUrl: 'http://localhost:8080/api'
};