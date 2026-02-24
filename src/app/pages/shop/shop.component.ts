import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly shopService: ShopService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    this.shopService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load products right now.';
        this.loading = false;
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
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
