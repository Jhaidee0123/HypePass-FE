/**
 * Hook: useLogout
 *
 * Returns a function that signs out the user via Better Auth,
 * clears the Recoil state, and redirects to /login.
 */
import { currentAccountState } from '@/presentation/components';
import { authClient } from '@/lib/auth-client';
import { useNavigate } from 'react-router';
import { useRecoilValue } from 'recoil';

type ResultType = () => void;

export const useLogout = (): ResultType => {
  const navigate = useNavigate();
  const { setCurrentAccount } = useRecoilValue(currentAccountState);
  return async (): Promise<void> => {
    await authClient.signOut();
    setCurrentAccount(undefined);
    navigate('/login');
  };
};
