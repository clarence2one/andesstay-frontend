import { Injectable, inject } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult } from '@azure/msal-browser';
import { BehaviorSubject, Observable, filter } from 'rxjs';

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
    this.msalService.instance.initialize().then(() => {
      this.checkAccount();
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
    this.msalService.logoutRedirect();
  }

  getUserName(): string | undefined {
    return this.msalService.instance.getActiveAccount()?.name;
  }
}