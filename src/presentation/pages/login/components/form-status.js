import { loginState } from './atoms';
import { FormStatusBase } from "../../../components";
import { useRecoilValue } from 'recoil';
import React from 'react';
const FormStatus = () => {
    const state = useRecoilValue(loginState);
    return React.createElement(FormStatusBase, { state: state });
};
export default FormStatus;
