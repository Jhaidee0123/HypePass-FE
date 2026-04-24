import axios from 'axios';
import {
  Checkout,
  GuestInitiateCheckoutParams,
  InitiateCheckoutParams,
} from '@/domain/usecases';
import {
  InitiateCheckoutResponse,
  VerifyPaymentResult,
} from '@/domain/models';

export class RemoteCheckout implements Checkout {
  constructor(private readonly apiEndpoint: string) {}

  async initiate(
    params: InitiateCheckoutParams,
  ): Promise<InitiateCheckoutResponse> {
    const { data } = await axios.post<InitiateCheckoutResponse>(
      `${this.apiEndpoint}/checkout/initiate`,
      params,
      { withCredentials: true },
    );
    return data;
  }

  async initiateGuest(
    params: GuestInitiateCheckoutParams,
  ): Promise<InitiateCheckoutResponse> {
    const { data } = await axios.post<InitiateCheckoutResponse>(
      `${this.apiEndpoint}/checkout/guest-initiate`,
      params,
    );
    return data;
  }

  async verify(reference: string): Promise<VerifyPaymentResult> {
    const { data } = await axios.get<VerifyPaymentResult>(
      `${this.apiEndpoint}/checkout/verify/${reference}`,
      { withCredentials: true },
    );
    return data;
  }
}
