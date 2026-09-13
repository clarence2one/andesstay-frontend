import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  environment = environment;
  private authSub: Subscription | null = null;

  ngOnInit(): void {
    this.authSub = this.authService.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.router.navigate(['/catalog']);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  login(): void {
    this.authService.loginRedirect();
  }
}