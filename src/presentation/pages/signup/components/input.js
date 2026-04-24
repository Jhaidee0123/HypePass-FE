import { signUpState } from './atoms';
import { InputBase } from "../../../components";
import { useRecoilState } from 'recoil';
import React from 'react';
const Input = ({ type, name, label, placeholder }) => {
    const [state, setState] = useRecoilState(signUpState);
    return React.createElement(InputBase, { type: type, name: name, label: label, placeholder: placeholder, state: state, setState: setState });
};
export default Input;
