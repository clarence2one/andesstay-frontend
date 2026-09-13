import { Injectable, inject } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult } from '@azure/msal-browser';
import { BehaviorSubject, Observable, filter, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private msalService = inject(MsalService);
  private msalBroadcast = inject(MsalBroadcastService);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initAuth();
  }

  private initAuth(): void {
    // Procesa el redirect de vuelta desde Microsoft en cualquier ruta
    // (Authorization Code + PKCE).
    this.msalService.handleRedirectObservable().subscribe({
      next: (result: AuthenticationResult | null) => {
        if (result && result.account) {
          this.msalService.instance.setActiveAccount(result.account);
          this.isAuthenticatedSubject.next(true);
        }
        this.checkAccount();
      },
      error: () => {
        this.checkAccount();
      }
    });

    this.msalBroadcast.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS)
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        this.msalService.instance.setActiveAccount(payload.account);
        this.isAuthenticatedSubject.next(true);
      });
  }

  private checkAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
    }
    this.isAuthenticatedSubject.next(!!this.msalService.instance.getActiveAccount());
  }

  loginRedirect(): void {
    this.msalService.loginRedirect();
  }

  logoutRedirect(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri
    });
  }

  getUserName(): string | undefined {
    return this.msalService.instance.getActiveAccount()?.name;
  }

  getUserProfile(): { name?: string; email?: string } | null {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return null;
    const claims = (account.idTokenClaims || {}) as Record<string, unknown>;
    const email = (claims['email'] as string) || account.username || (claims['preferred_username'] as string);
    return { name: account.name, email };
  }

  getAccessToken(): Promise<string | null> {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return Promise.resolve(null);
    return firstValueFrom(
      this.msalService.acquireTokenSilent({
        scopes: environment.azure.protectedResourceScopes,
        account
      })
    )
      .then((result) => result.accessToken)
      .catch(() => null);
  }
}