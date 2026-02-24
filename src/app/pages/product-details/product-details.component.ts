import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product?: Product;
  loading = true;
  error = '';
  private routeSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly shopService: ShopService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        this.error = 'Invalid product.';
        this.loading = false;
        return;
      }

      this.loading = true;
      this.error = '';
      this.shopService.getProductById(id).subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: () => {
          this.error = 'Product details could not be loaded.';
          this.loading = false;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    this.cartService.addItem(this.product);
  }

  backToShop(): void {
    this.router.navigate(['/shop']);
  }
   getProductImage(product: Product): string {
  const imageMap: Record<string, string> = {
    'Jamaica Flag': 'assets/images/jamaicaflag.jpg',
    'Souvenir Cup': 'assets/images/jamaica cup.jpg',
    'Tour T-Shirt': 'assets/images/shirt.jpg',
    'Swamp Mug' : 'assets/images/mug.webp',
    'Safari Hat' : 'assets/images/hat.webp'
  };

  return imageMap[product.name] || 'assets/images/logo.png';
}
  
}
