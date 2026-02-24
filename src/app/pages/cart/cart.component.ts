import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartItem } from '../../models/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  private cartSub?: Subscription;

  constructor(
    private readonly cartService: CartService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cartSub = this.cartService.cart$.subscribe((items) => {
      this.items = items;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  updateQuantity(productId: number, qtyValue: string): void {
    const qty = Number(qtyValue);
    this.cartService.updateQuantity(productId, qty);
  }

  remove(productId: number): void {
    this.cartService.removeItem(productId);
  }

  getTotal(): number {
    return this.cartService.getCartTotal();
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
