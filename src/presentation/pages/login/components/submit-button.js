import { loginState } from './atoms';
import { useRecoilValue } from 'recoil';
import React from 'react';
const SubmitButton = ({ text }) => {
    const state = useRecoilValue(loginState);
    return (React.createElement("button", { "data-testid": "submit", disabled: state.isLoading, type: "submit" }, state.isLoading ? 'Signing in...' : text));
};
export default SubmitButton;
