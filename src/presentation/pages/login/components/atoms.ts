import { FormState } from '@/presentation/components/models';
import { atom } from 'recoil';

interface LoginState extends FormState {
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
}

export const loginState = atom<LoginState>({
  key: 'loginState',
  default: {
    isLoading: false,
    isFormInvalid: true,
    email: '',
    password: '',
    emailError: '',
    passwordError: '',
    mainError: '',
    dirtyFields: { email: false, password: false }
  }
});
