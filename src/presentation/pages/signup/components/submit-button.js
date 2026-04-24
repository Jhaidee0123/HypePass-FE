import { signUpState } from './atoms';
import { useRecoilValue } from 'recoil';
import React from 'react';
const SubmitButton = ({ text }) => {
    const state = useRecoilValue(signUpState);
    return (React.createElement("button", { "data-testid": "submit", disabled: state.isLoading, type: "submit" }, state.isLoading ? 'Creating account...' : text));
};
export default SubmitButton;
