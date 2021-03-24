import { createDirectiveTypeParams } from '@angular/compiler/src/render3/view/compiler';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: CartItem[] = [];
  totalQuantities: Subject<number> = new BehaviorSubject<number>(0);
  totalAmount: Subject<number> = new BehaviorSubject<number>(0);
  storage : Storage = localStorage;

  constructor() { 
    let data = this.storage.getItem('cartItems');
    if(data !== null){
      this.cartItems = JSON.parse(data);
      this.computeCarTotals();
    }
  }

  addToCart(cartItem: CartItem) {
    let existingCartItem: CartItem = undefined;

    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find(i => i.productId === cartItem.productId);
    }

    if (existingCartItem != undefined) {
      existingCartItem.quantity++;
    } else {
      this.cartItems.push(cartItem);
    }

    this.computeCarTotals();
  }

  computeCarTotals() {
    let totalAmount: number = 0;
    let totalQuantities: number = 0;

    for (let cartItem of this.cartItems) {
      totalAmount += cartItem.quantity * cartItem.unitPrice;
      totalQuantities += cartItem.quantity;
    }

    this.totalAmount.next(totalAmount);
    this.totalQuantities.next(totalQuantities);
    this.persistCartItems();
  }

  decrementProductQuantity(cartItem: CartItem) {
    cartItem.quantity--;
    if (cartItem.quantity === 0) {
      this.removeCartItem(cartItem);
    } else {
      this.computeCarTotals();
    }
  }

  removeCartItem(cartItem: CartItem) {
    const cartIndex: number = this.cartItems.findIndex(i => i.productId === cartItem.productId);
    if (cartIndex > -1) {
      this.cartItems.splice(cartIndex, 1);
      this.computeCarTotals();
    }
  }

  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
}
