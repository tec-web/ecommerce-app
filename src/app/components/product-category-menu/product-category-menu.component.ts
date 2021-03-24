import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ProductCategory } from 'src/app/common/product-category';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-category-menu',
  templateUrl: './product-category-menu.component.html',
  styleUrls: ['./product-category-menu.component.css']
})
export class ProductCategoryMenuComponent implements OnInit {
  categories : ProductCategory[];

  constructor(private productService : ProductService) {}

  ngOnInit(): void {
    this.getCategoryList();
  }

  getCategoryList(){
    this.productService.getProductCategoryList().subscribe(
      data => {
        this.categories = data;
      }
    )
  }
}
