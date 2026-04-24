import React from 'react';
import { SignUp } from "../../../../presentation/pages";
import { makeRemoteAuthentication } from "../../usecases";
import { makeSignUpValidation } from "../../validation";
export const SignUpFactory = () => {
    return React.createElement(SignUp, { authentication: makeRemoteAuthentication(), validation: makeSignUpValidation() });
};
