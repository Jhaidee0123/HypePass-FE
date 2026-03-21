/**
 * Reusable Input Component
 *
 * Renders a labeled input field with validation status.
 * Accepts Recoil state/setState to integrate with form atoms.
 * The readOnly trick prevents browser autofill from overriding our state.
 */
import Styles from './input-styles.scss';
import React, { useRef } from 'react';

type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  state: any;
  setState: any;
  name?: string;
  placeholder?: string;
  label?: string;
};

const Input: React.FC<Props> = ({ state, setState, label, ...props }: Props) => {
  const inputRef = useRef<HTMLInputElement>();
  const error = state[`${props.name}Error`];
  const isFormDirty = state.dirtyFields ? state.dirtyFields[props.name] : true;
  const labelText = label || props.placeholder;
  return (
    <div
      data-testid={`${props.name}-wrap`}
      className={Styles.inputWrap}
      data-status={error && isFormDirty ? 'invalid' : 'valid'}
    >
      <label
        data-testid={`${props.name}-label`}
        className={Styles.label}
        onClick={() => {
          inputRef.current.focus();
        }}
        title={error}
      >
        {labelText}
      </label>
      <input
        {...props}
        ref={inputRef}
        title={error}
        data-testid={props.name}
        readOnly
        onFocus={e => {
          e.target.readOnly = false;
        }}
        onChange={e => {
          setState({
            ...state,
            [e.target.name]: e.target.value,
            dirtyFields: { ...state.dirtyFields, [e.target.name]: true }
          });
        }}
      />
    </div>
  );
};

export default Input;
