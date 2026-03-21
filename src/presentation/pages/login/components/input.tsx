import { loginState } from './atoms';
import { InputBase } from '@/presentation/components';
import { useRecoilState } from 'recoil';
import React from 'react';

type Props = {
  type: string;
  name: string;
  label: string;
  placeholder: string;
};

const Input: React.FC<Props> = ({ type, name, label, placeholder }: Props) => {
  const [state, setState] = useRecoilState(loginState);
  return <InputBase type={type} name={name} label={label} placeholder={placeholder} state={state} setState={setState} />;
};

export default Input;
