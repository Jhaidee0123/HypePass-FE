import appConfig from '@/main/config/app-config';
import { Transfer } from '@/domain/usecases';
import { RemoteTransfer } from '@/data/usecases/remote-transfer';

export const makeTransfer = (): Transfer =>
  new RemoteTransfer(appConfig.api.ENDPOINT);
