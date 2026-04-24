var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/**
 * Reusable Input Component
 *
 * Renders a labeled input field with validation status.
 * Accepts Recoil state/setState to integrate with form atoms.
 * The readOnly trick prevents browser autofill from overriding our state.
 */
import Styles from './input-styles.scss';
import React, { useRef } from 'react';
const Input = (_a) => {
    var { state, setState, label } = _a, props = __rest(_a, ["state", "setState", "label"]);
    const inputRef = useRef();
    const error = state[`${props.name}Error`];
    const isFormDirty = state.dirtyFields ? state.dirtyFields[props.name] : true;
    const labelText = label || props.placeholder;
    return (React.createElement("div", { "data-testid": `${props.name}-wrap`, className: Styles.inputWrap, "data-status": error && isFormDirty ? 'invalid' : 'valid' },
        React.createElement("label", { "data-testid": `${props.name}-label`, className: Styles.label, onClick: () => {
                inputRef.current.focus();
            }, title: error }, labelText),
        React.createElement("input", Object.assign({}, props, { ref: inputRef, title: error, "data-testid": props.name, readOnly: true, onFocus: e => {
                e.target.readOnly = false;
            }, onChange: e => {
                setState(Object.assign(Object.assign({}, state), { [e.target.name]: e.target.value, dirtyFields: Object.assign(Object.assign({}, state.dirtyFields), { [e.target.name]: true }) }));
            } }))));
};
export default Input;
