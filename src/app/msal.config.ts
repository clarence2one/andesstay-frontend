import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  LogLevel
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';
import { environment } from '../environments/environment';

export function MSALInstanceFactory(): IPublicClientApplication {
  // Si se accede por localhost se usa la URI de desarrollo; si se accede
  // desde un túnel público (ej. presentación desde el celular), se usa el
  // origen actual de la página.
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const redirectUri = isLocal
    ? environment.azure.redirectUri
    : window.location.origin;

  return new PublicClientApplication({
    auth: {
      clientId: environment.azure.clientId,
      authority: environment.azure.authority,
      redirectUri,
      postLogoutRedirectUri: redirectUri
    },
    cache: {
      cacheLocation: 'localStorage'
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (!containsPii) {
            console.log(`[MSAL]: ${message}`);
          }
        },
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['api://e2d52786-8292-433e-a464-d575268eca38/read']
    }
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(
    `${environment.apiBaseUrl}/*`,
    environment.azure.protectedResourceScopes
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}