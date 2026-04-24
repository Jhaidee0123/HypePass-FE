import {
  InitiateCheckoutResponse,
  VerifyPaymentResult,
} from '@/domain/models';

export type InitiateCheckoutParams = {
  eventId: string;
  eventSessionId: string;
  ticketSectionId: string;
  ticketSalePhaseId: string;
  quantity: number;
  customerFullName?: string;
  customerEmail?: string;
  customerPhone: string;
  customerLegalId: string;
  customerLegalIdType: string;
  acceptedTermsVersion: string;
  acceptedPrivacyVersion: string;
};

export type GuestInitiateCheckoutParams = Required<
  Pick<
    InitiateCheckoutParams,
    | 'eventId'
    | 'eventSessionId'
    | 'ticketSectionId'
    | 'ticketSalePhaseId'
    | 'quantity'
    | 'customerFullName'
    | 'customerEmail'
    | 'customerPhone'
    | 'customerLegalId'
    | 'customerLegalIdType'
    | 'acceptedTermsVersion'
    | 'acceptedPrivacyVersion'
  >
>;

export interface Checkout {
  initiate(params: InitiateCheckoutParams): Promise<InitiateCheckoutResponse>;
  initiateGuest(
    params: GuestInitiateCheckoutParams,
  ): Promise<InitiateCheckoutResponse>;
  verify(reference: string): Promise<VerifyPaymentResult>;
}
