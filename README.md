# AndesStay Frontend (Angular + MSAL)

Frontend **Angular** del proyecto **AndesStay** (DSY1107 - Desarrollo Cloud Native I).
Implementa el flujo de login con **Microsoft Entra ID** usando la librería **MSAL**
(`@azure/msal-angular`), inyecta el **JWT** en las llamadas al backend mediante
`MsalInterceptor` y protege las rutas con `MsalGuard`.

## Características

- Login / logout con Entra ID (OIDC + PKCE) y lectura de **scopes (`scp`)** desde los claims del token.
- **Catálogo** consumido desde el microservicio `ms-andesstay-catalog` vía **AWS API Gateway**.
- **Reservas** con boleta (factura chilena, IVA 19%) persistidas en el microservicio
  `ms-andesstay-reservations` (con fallback local).
- **Reportes** y **Auditoría** de eventos (login, logout, reservas).
- Notificaciones (campana + toasts) y rol del usuario obtenido del microservicio
  `ms-andesstay-users`.

Rutas principales: `/login` (dashboard), `/catalog`, `/reservations`, `/booking/:id` (boleta),
`/reports`, `/audit`.

## Configuración del IDaaS

```ts
// src/environments/environment.ts
clientId: 'e2d52786-8292-433e-a464-d575268eca38'
tenantId: '5fb0afd3-b475-47e9-862b-1ce06143be35'
protectedResourceScopes: ['api://e2d52786-8292-433e-a464-d575268eca38/read']
apiBaseUrl: 'https://kid5q813hh.execute-api.us-east-1.amazonaws.com/api'
```

En el portal Entra la aplicación debe tener:
- Redirect URI → `http://localhost:4200`
- Application ID URI → `api://e2d52786-8292-433e-a464-d575268eca38`
- Scope propio `read` (y `write` si se reserva)
- Manifest: `requestedAccessTokenVersion: 2` (tokens v2)

## Desarrollo

```bash
npm install
ng serve          # http://localhost:4200
```

## Build de producción

```bash
ng build --configuration production
```

## Notas de presentación

- Para probar desde el celular se usa un túnel Cloudflare hacia el dev server (el redirect URI de
  MSAL se calcula dinámicamente desde `window.location.origin`).
- Credenciales del usuario demo del tenant: `andesstay@agustinfernandez.onmicrosoft.com`.