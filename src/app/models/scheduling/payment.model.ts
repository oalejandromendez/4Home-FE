import { environment } from "src/environments/environment";

export class PaymentModel {
  merchantId: string;
  accountId: string;
  description: string;
  referenceCode: string;
  amount: string;
  tax: string;
  taxReturnBase: string;
  currency: string;
  signature: string;
  test: string;
  buyerEmail: string;
  buyerFullName: string;
  payerDocument: string;
  telephone: string;
  responseUrl: string;
  confirmationUrl: string;
  extra1: string;
  extra2: string;
  extra3: string;

  constructor() {
    this.merchantId = environment.merchantId;
    this.accountId = environment.accountId;
    this.tax = '0';
    this.taxReturnBase = '0';
    this.currency = 'COP';
    this.test = '1';
  }
}
