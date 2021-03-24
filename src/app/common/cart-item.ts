import { Product } from "./product";

export class CartItem {
    productId: number;
    name: string;
    unitPrice: number;
    imageUrl: string;
    quantity: number;

    constructor(product: Product) {
        this.productId = product.productId;
        this.name = product.name;
        this.unitPrice = product.unitPrice;
        this.imageUrl = product.imageUrl;
        this.quantity = 1;
    }
}
