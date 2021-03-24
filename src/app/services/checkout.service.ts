import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../common/country';
import { Purchase } from '../common/purchase';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  baseUrl: string = "http://localhost:8080/api";

  constructor(private httpClient: HttpClient) { }

  getMonthsForCreditCard(startMonth: number): Observable<number[]> {
    const data: number[] = [];
    for (let month = startMonth; month <= 12; month++) {
      data.push(month);
    }
    return of(data);
  }

  getYearsForCreditCard(): Observable<number[]> {
    const data: number[] = [];
    const startYear: number = new Date().getFullYear();
    const finishYear: number = startYear + 10;
    for (let year = startYear; year <= finishYear; year++) {
      data.push(year);
    }
    return of(data);
  }

  getCountries(): Observable<Country[]> {
    const countriesUrl = `${this.baseUrl}/country`;
    return this.httpClient.get<GetResponseCountries>(countriesUrl).pipe(
      map(
        response => response._embedded.countries
      )
    );
  }

  getStatesByCountryCode(countryCode: string): Observable<State[]> {
    const statesUrl = `${this.baseUrl}/states/search/findByCountryCode?code=${countryCode}`;
    return this.httpClient.get<GetResponseStates>(statesUrl).pipe(
      map(
        response => response._embedded.states
      )
    )
  }

  placeOrder(purchase: Purchase): Observable<any> {
    const placeOrderUrl = `${this.baseUrl}/checkout/purchase`
    console.log(purchase);
    console.log('>>>>>>>>>>>>>>>')
    console.log(JSON.stringify(purchase));
    return this.httpClient.post<Purchase>(placeOrderUrl, purchase);
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[];
  }
}
