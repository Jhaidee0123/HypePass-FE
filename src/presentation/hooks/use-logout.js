var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Hook: useLogout
 *
 * Returns a function that signs out the user via Better Auth,
 * clears the Recoil state, and redirects to /login.
 */
import { currentAccountState } from "../components";
import { authClient } from "../../lib/auth-client";
import { useNavigate } from 'react-router';
import { useRecoilValue } from 'recoil';
export const useLogout = () => {
    const navigate = useNavigate();
    const { setCurrentAccount } = useRecoilValue(currentAccountState);
    return () => __awaiter(void 0, void 0, void 0, function* () {
        yield authClient.signOut();
        setCurrentAccount(undefined);
        navigate('/login');
    });
};
