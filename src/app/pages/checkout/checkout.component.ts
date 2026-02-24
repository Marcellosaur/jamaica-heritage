import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartItem } from '../../models/cart-item';
import { CartService } from '../../services/cart.service';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  loading = false;
  error = '';
  success = '';

  shippingFullName = '';
  shippingAddressLine1 = '';
  shippingCity = '';
  shippingParish = '';
  shippingPostalCode = '';

  cardName = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  private cartSub?: Subscription;

  constructor(
    private readonly cartService: CartService,
    private readonly shopService: ShopService,
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

  getTotal(): number {
    return this.cartService.getCartTotal();
  }

  placeOrder(): void {
    if (!this.items.length) {
      this.error = 'Your cart is empty.';
      return;
    }

    if (!this.areCheckoutDetailsValid()) {
      this.error = 'Please complete all shipping details and valid card info (16-digit card, MM/YY expiry, 3-4 digit CVV).';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const payload = this.items.map((item) => ({
      productId: item.product.id,
      qty: item.qty
    }));

    this.shopService.checkout(payload).subscribe({
      next: (res) => {
        this.cartService.clearCart();
        this.success = `Order #${res.orderId} placed successfully.`;
      },
      error: (err) => {
        const serverMsg = err?.error?.message;
        this.error = typeof serverMsg === 'string' ? serverMsg : 'Checkout failed';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  goToShop(): void {
    this.router.navigate(['/shop']);
  }

  onFieldChange(): void {
    this.error = '';
  }

  private areCheckoutDetailsValid(): boolean {
    const cardDigits = this.cardNumber.replace(/\D/g, '');

    return Boolean(
      /^[A-Za-z][A-Za-z\s'-]{1,119}$/.test(this.shippingFullName.trim()) &&
      this.shippingAddressLine1.trim().length >= 5 &&
      this.shippingCity.trim().length >= 2 &&
      this.shippingParish.trim().length >= 2 &&
      /^[A-Za-z0-9\s-]{3,12}$/.test(this.shippingPostalCode.trim()) &&
      /^[A-Za-z][A-Za-z\s'-]{1,119}$/.test(this.cardName.trim()) &&
      /^\d{16}$/.test(cardDigits) &&
      /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(this.cardExpiry.trim()) &&
      /^\d{3,4}$/.test(this.cardCvv.trim())
    );
  }
}
