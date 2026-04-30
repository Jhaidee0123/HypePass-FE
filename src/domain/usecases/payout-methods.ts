import {
  PayoutMethod,
  PayoutMethodType,
  WompiAccountType,
} from '@/domain/models';

export type CreatePayoutMethodParams = {
  type: PayoutMethodType;
  bankName?: string;
  accountNumber: string;
  holderName: string;
  holderLegalIdType: string;
  holderLegalId: string;
  makeDefault?: boolean;
  wompiBankId?: string;
  accountType?: WompiAccountType;
};

export type UpdatePayoutMethodParams = Partial<CreatePayoutMethodParams>;

export type PayoutBank = {
  id: string;
  name: string;
};

export interface PayoutMethods {
  list(): Promise<PayoutMethod[]>;
  listBanks(): Promise<PayoutBank[]>;
  create(params: CreatePayoutMethodParams): Promise<PayoutMethod>;
  update(
    id: string,
    params: UpdatePayoutMethodParams,
  ): Promise<PayoutMethod>;
  makeDefault(id: string): Promise<PayoutMethod>;
  delete(id: string): Promise<void>;
}
