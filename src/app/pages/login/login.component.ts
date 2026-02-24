import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  mode: 'login' | 'register' = 'login';
  error = '';
  loading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  submit(): void {
    const normalizedEmail = this.email.trim().toLowerCase();
    const normalizedPassword = this.password.trim();

    this.error = '';

    if (!this.isValidEmail(normalizedEmail)) {
      this.error = 'Enter a valid email address.';
      return;
    }

    if (normalizedPassword.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    this.loading = true;

    if (this.mode === 'register') {
      this.register(normalizedEmail, normalizedPassword);
      return;
    }

    this.login(normalizedEmail, normalizedPassword);
  }

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.error = '';
  }

  private login(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/checkout';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private register(email: string, password: string): void {
    this.authService.register(email, password).subscribe({
      next: () => {
        this.mode = 'login';
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
      }
    });
  }

  private handleError(err: HttpErrorResponse): void {
    const serverMsg = err?.error?.message;
    this.error = typeof serverMsg === 'string' ? serverMsg : 'Authentication failed';
    this.loading = false;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }
}
