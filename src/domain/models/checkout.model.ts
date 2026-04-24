export type InitiateCheckoutResponse = {
  orderId: string;
  paymentId: string;
  reference: string;
  amountInCents: number;
  currency: string;
  signature: string;
  publicKey: string;
  customerEmail: string;
  customerFullName: string;
  customerPhone: string;
  customerLegalId: string;
  customerLegalIdType: string;
  reservedUntil: string;
};

export type VerifyPaymentResult = {
  paymentId: string;
  orderId: string;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'refunded'
    | 'chargeback'
    | 'unknown';
  orderStatus: string;
  amount: number;
  currency: string;
  reference: string;
  ticketIds: string[];
};
