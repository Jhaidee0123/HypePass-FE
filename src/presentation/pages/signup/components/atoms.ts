import { FormState } from '@/presentation/components/models';
import { atom } from 'recoil';

interface SignUpState extends FormState {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptedConsent: boolean;
  nameError: string;
  emailError: string;
  passwordError: string;
  passwordConfirmationError: string;
}

export const signUpState = atom<SignUpState>({
  key: 'signUpState',
  default: {
    isLoading: false,
    isFormInvalid: true,
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    acceptedConsent: false,
    nameError: '',
    emailError: '',
    passwordError: '',
    passwordConfirmationError: '',
    mainError: '',
    dirtyFields: { name: false, email: false, password: false, passwordConfirmation: false }
  }
});
