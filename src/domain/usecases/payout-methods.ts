import { PayoutMethod, PayoutMethodType } from '@/domain/models';

export type CreatePayoutMethodParams = {
  type: PayoutMethodType;
  bankName?: string;
  accountNumber: string;
  holderName: string;
  holderLegalIdType: string;
  holderLegalId: string;
  makeDefault?: boolean;
};

export type UpdatePayoutMethodParams = Partial<CreatePayoutMethodParams>;

export interface PayoutMethods {
  list(): Promise<PayoutMethod[]>;
  create(params: CreatePayoutMethodParams): Promise<PayoutMethod>;
  update(
    id: string,
    params: UpdatePayoutMethodParams,
  ): Promise<PayoutMethod>;
  makeDefault(id: string): Promise<PayoutMethod>;
  delete(id: string): Promise<void>;
}
