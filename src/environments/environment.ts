// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  host: 'http://localhost/4Home/public',
  payu: 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu',
  responseUrl: 'http://localhost:4200/finance/response',
  confirmationUrl: 'http://localhost/4Home/public/api/payment/confirmation',
  apiLogin: 'pRRXKOl8ikMmt9u',
  apiKey: '4Vj8eK4rloUd272L48hsrarnUA',
  accountId: '512321',
  merchantId: '508029'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
