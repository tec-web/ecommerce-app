import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalAmount: number = 0;
  totalQuantities: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }

  listCartDetails() {
    this.cartItems = this.cartService.cartItems;

    this.cartService.totalAmount.subscribe(
      data => this.totalAmount = data
    );

    this.cartService.totalQuantities.subscribe(
      data => this.totalQuantities = data
    );

    this.cartService.computeCarTotals()
  }
  
  incrementProductQuantity(cartItem: CartItem){
    this.cartService.addToCart(cartItem);
  }

  decrementProductQuantity(cartItem: CartItem){
    this.cartService.decrementProductQuantity(cartItem);
  }
  
  removeProduct(cartItem: CartItem){
    this.cartService.removeCartItem(cartItem);
  }
}
