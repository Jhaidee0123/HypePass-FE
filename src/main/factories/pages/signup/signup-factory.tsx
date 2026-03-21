import React from 'react';
import { SignUp } from '@/presentation/pages';
import { makeRemoteAuthentication } from '@/main/factories/usecases';
import { makeSignUpValidation } from '@/main/factories/validation';

export const SignUpFactory: React.FC = () => {
  return <SignUp authentication={makeRemoteAuthentication()} validation={makeSignUpValidation()} />;
};
