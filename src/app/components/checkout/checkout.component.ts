import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormsValidator } from 'src/app/validators/forms-validator';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkOutFormGroup: FormGroup;
  totalAmount: number = 0;
  totalQuantities: number = 0;
  ccMonths: number[] = [];
  ccYears: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage : Storage = localStorage;

  constructor(private formBuilder: FormBuilder,
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.checkOutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces]),

        lastName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces]),

        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces]),

        city: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces]),

        state: new FormControl('', [Validators.required]),

        country: new FormControl('', [Validators.required]),

        zipCode: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces])

      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces]),

        city: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces]),

        state: new FormControl('', [Validators.required]),

        country: new FormControl('', [Validators.required]),

        zipCode: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          FormsValidator.notOnlyWhitespaces]),

        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    const startMonth = new Date().getMonth() + 1;
    this.getMonthsForCreditCard(startMonth);
    this.getYearsForCreditCard();

    this.checkoutService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
    this.getCartTotals();
  }

  copyShippingAddressToBillingAddress(event) {
    if (event.target.checked) {
      this.checkOutFormGroup.controls.billingAddress
        .setValue(this.checkOutFormGroup.controls.shippingAddress.value);
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkOutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }
  }

  onSubmit() {
    if (this.checkOutFormGroup.invalid) {
      this.checkOutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice = this.totalAmount;
    order.totalQuantity = this.totalQuantities;

    let cartItems: CartItem[] = this.cartService.cartItems;
    let orderItems: OrderItem[] = cartItems.map(i => new OrderItem(i));

    let purchase: Purchase = new Purchase();
    purchase.customer = this.checkOutFormGroup.controls['customer'].value;
  
    purchase.shippingAddress = this.checkOutFormGroup.controls['shippingAddress'].value;
    const shippingState : State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry : Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkOutFormGroup.controls['billingAddress'].value;
    const billingState : State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry : Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe({
        next: response => {
          alert(`Your order has been received\nOrder tracking number: ${response.orderTrackingNumber}`);
          this.resetCart();
        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
    });

    console.log(this.checkOutFormGroup.get('customer').value);
  }

  resetCart(){
    this.cartService.cartItems = [];
    this.cartService.totalAmount.next(0);
    this.cartService.totalQuantities.next(0);
    this.checkOutFormGroup.reset();
    this.storage.removeItem('cartItems');
    this.router.navigateByUrl('/products');
  }

  getMonthsForCreditCard(startMonth: number) {
    this.checkoutService.getMonthsForCreditCard(startMonth).subscribe(
      data => {
        this.ccMonths = data;
      }
    )
  }

  getYearsForCreditCard() {
    this.checkoutService.getYearsForCreditCard().subscribe(
      data => {
        this.ccYears = data;
      }
    );
  }

  handleYearChange() {
    const creditCardFormGroup = this.checkOutFormGroup.get("creditCard");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const selectedYear = Number(creditCardFormGroup.value.expirationYear);
    let month = currentDate.getMonth() + 1;

    if (currentYear !== selectedYear) {
      month = 1;
    }

    this.checkoutService.getMonthsForCreditCard(month).subscribe(
      data => {
        this.ccMonths = data;
      }
    );
  }

  pullStatesForCountry(formGroupName: string) {
    const formGroup = this.checkOutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;

    this.checkoutService.getStatesByCountryCode(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else if (formGroupName === 'billingAddress') {
          this.billingAddressStates = data;
        }

        formGroup.get('state').setValue(data[0]);
      }
    )
  }

  getCartTotals() {
    this.cartService.totalAmount.subscribe(
      data => {
        this.totalAmount = data
      }
    )

    this.cartService.totalQuantities.subscribe(
      data => {
        this.totalQuantities = data
      }
    )
  }

  get firstName() { return this.checkOutFormGroup.get("customer.firstName"); }
  get lastName() { return this.checkOutFormGroup.get("customer.lastName"); }
  get email() { return this.checkOutFormGroup.get("customer.email"); }

  get shippingAddressStreet() { return this.checkOutFormGroup.get("shippingAddress.street"); }
  get shippingAddressCity() { return this.checkOutFormGroup.get("shippingAddress.city"); }
  get shippingAddressZipCode() { return this.checkOutFormGroup.get("shippingAddress.zipCode"); }
  get shippingAddressCountry() { return this.checkOutFormGroup.get("shippingAddress.country"); }
  get shippingAddressState() { return this.checkOutFormGroup.get("shippingAddress.state"); }

  get billingAddressStreet() { return this.checkOutFormGroup.get("billingAddress.street"); }
  get billingAddressCity() { return this.checkOutFormGroup.get("billingAddress.city"); }
  get billingAddressZipCode() { return this.checkOutFormGroup.get("billingAddress.zipCode"); }
  get billingAddressCountry() { return this.checkOutFormGroup.get("billingAddress.country"); }
  get billingAddressState() { return this.checkOutFormGroup.get("billingAddress.state"); }

  get creditCardType() { return this.checkOutFormGroup.get('creditCard.cardType') }
  get creditCardNumber() { return this.checkOutFormGroup.get('creditCard.cardNumber') }
  get creditCardNameOnCard() { return this.checkOutFormGroup.get('creditCard.nameOnCard') }
  get creditCardSecurityCode() { return this.checkOutFormGroup.get('creditCard.securityCode') }
}
