declare module 'yookassa' {
  export default class YooKassa {
    constructor(options: { shopId: string; secretKey: string });
    createPayment(data: any, idempotenceKey?: string): Promise<any>;
    getPayment(paymentId: string): Promise<any>;
  }
}


