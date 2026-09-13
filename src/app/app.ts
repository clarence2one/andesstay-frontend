import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth';

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
  tokenSnippet: string | null = null;
  private authSub: Subscription | null = null;

  ngOnInit(): void {
    this.authSub = this.authService.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.authService.getAccessToken().then((token) => {
          this.tokenSnippet = token ? token.slice(0, 48) + '...' : null;
        });
      } else {
        this.tokenSnippet = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  login(): void {
    this.authService.loginRedirect();
  }

  logout(): void {
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
}