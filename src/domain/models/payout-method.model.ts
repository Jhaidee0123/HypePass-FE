export type PayoutMethodType =
  | 'nequi'
  | 'daviplata'
  | 'bancolombia_savings'
  | 'bancolombia_checking'
  | 'bancolombia_other'
  | 'other_bank';

export type WompiAccountType = 'AHORROS' | 'CORRIENTE';

export type PayoutMethod = {
  id: string;
  userId: string;
  type: PayoutMethodType;
  bankName: string | null;
  accountNumber: string;
  holderName: string;
  holderLegalIdType: string;
  holderLegalId: string;
  isDefault: boolean;
  verifiedAt: string | null;
  /** UUID del banco según catálogo de Wompi (`/banks`). Null en filas
   *  legacy creadas antes del payout automático. */
  wompiBankId: string | null;
  /** AHORROS / CORRIENTE — requerido por Wompi Payouts cuando aplica. */
  accountType: WompiAccountType | null;
  createdAt: string;
  updatedAt: string;
};

export const PAYOUT_METHOD_TYPES: PayoutMethodType[] = [
  'nequi',
  'daviplata',
  'bancolombia_savings',
  'bancolombia_checking',
  'bancolombia_other',
  'other_bank',
];
