import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'Swamp Safari - Falmouth Trelawny';
  currentYear: number = new Date().getFullYear();
  toastMessage = '';
  navOpen = false;

  readonly isLoggedIn$: Observable<boolean> = this.authService.authState$;
  readonly cartCount$: Observable<number> = this.cartService.cart$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.qty, 0))
  );

  private toastTimeout?: ReturnType<typeof setTimeout>;
  private readonly notificationSub: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly router: Router
  ) {
    this.notificationSub = this.cartService.notifications$.subscribe((message) => {
      this.toastMessage = message;

      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }

      this.toastTimeout = setTimeout(() => {
        this.toastMessage = '';
      }, 2200);
    });
  }

  ngOnDestroy(): void {
    this.notificationSub.unsubscribe();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  logout(): void {
    this.authService.logout();
    this.navOpen = false;
    this.router.navigate(['/']);
  }

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  closeNav(): void {
    this.navOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.navOpen) {
      this.closeNav();
    }
  }
}
