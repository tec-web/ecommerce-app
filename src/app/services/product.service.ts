import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './../common/product';
import { ProductCategory } from './../common/product-category';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  baseUrl: string = "http://localhost:8080/api";

  constructor(private httpClient: HttpClient) { }

  getProductList(categoryId: number, pageNumber: number, pageSize: number): Observable<GetResponseProducts> {
    let searchUrl: string = `${this.baseUrl}/products/search/findByCategoryCategoryId?categoryId=${categoryId}`
      + `&page=${pageNumber}&size=${pageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductCategoryList(): Observable<ProductCategory[]> {
    let productCategoriesUrl: string = `${this.baseUrl}/category`;
    return this.httpClient.get<GetResponseCategories>(productCategoriesUrl).pipe(
      map(respose => respose._embedded.ProductCategory)
    );
  }

  searchProduct(keyword: string, pageNumber : number, pageSize : number): Observable<GetResponseProducts> {
    let searchProductUrl = `${this.baseUrl}/products/search/findByNameContaining?name=${keyword}`
     + `&page=${pageNumber}&size=${pageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchProductUrl);
  }

  findProductById(productId: number): Observable<Product> {
    let findProductUrl = `${this.baseUrl}/products/${productId}`;
    return this.httpClient.get<Product>(findProductUrl);
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseCategories {
  _embedded: {
    ProductCategory: ProductCategory[];
  }
}
