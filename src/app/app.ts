import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth';
import { AuditService, AuditEvent } from './services/audit';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  title = 'AndesStay Platform';
  authService = inject(AuthService);
  private auditService = inject(AuditService);

  tokenSnippet: string | null = null;
  showNotifs = false;
  notifs: AuditEvent[] = [];
  toast: AuditEvent | null = null;

  private authSub: Subscription | null = null;
  private notifSub: Subscription | null = null;
  private toastSub: Subscription | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.authSub = this.authService.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.authService.getAccessToken().then((token) => {
          this.tokenSnippet = token ? token.slice(0, 48) + '...' : null;
        });
        this.reportLogin();
        this.auditLogin();
      } else {
        this.tokenSnippet = null;
      }
    });

    this.notifSub = this.auditService.list$.subscribe((events) => {
      this.notifs = events.slice(0, 5);
    });

    this.toastSub = this.auditService.toast$.subscribe((event) => {
      this.toast = event;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => (this.toast = null), 4200);
    });
  }

  private reportLogin(): void {
    // Envía una sola vez por sesión de navegador el correo/nombre + IP registrada
    // por el visit-log (útil para saber quién accedió al link compartido).
    if (sessionStorage.getItem('as_reported')) return;
    const profile = this.authService.getUserProfile();
    if (!profile || !profile.email) return;
    sessionStorage.setItem('as_reported', '1');
    fetch(`${window.location.origin}/__who`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: profile.email, name: profile.name || '' })
    }).catch(() => {});
  }

  private auditLogin(): void {
    if (sessionStorage.getItem('as_audit_login')) return;
    sessionStorage.setItem('as_audit_login', '1');
    const profile = this.authService.getUserProfile();
    this.auditService.log('login', 'Inicio de sesión', profile?.email || profile?.name);
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.notifSub?.unsubscribe();
    this.toastSub?.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  login(): void {
    this.authService.loginRedirect();
  }

  logout(): void {
    const profile = this.authService.getUserProfile();
    this.auditService.log('logout', 'Cierre de sesión', profile?.email || profile?.name);
    this.authService.logoutRedirect();
  }

  copyToken(): void {
    this.authService.getAccessToken().then((token) => {
      if (token) {
        navigator.clipboard.writeText(token);
        alert('JWT copiado al portapapeles');
      } else {
        alert('No hay token disponible');
      }
    });
  }

  toggleNotifs(): void {
    this.showNotifs = !this.showNotifs;
  }

  clearNotifs(): void {
    this.auditService.clear();
    this.showNotifs = false;
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
  }
}