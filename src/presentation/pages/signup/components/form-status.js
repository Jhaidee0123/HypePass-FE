import { signUpState } from './atoms';
import { FormStatusBase } from "../../../components";
import { useRecoilValue } from 'recoil';
import React from 'react';
const FormStatus = () => {
    const state = useRecoilValue(signUpState);
    return React.createElement(FormStatusBase, { state: state });
};
export default FormStatus;
