import Styles from './form-status-styles.scss';
import { Spinner } from "..";
import React from 'react';
const FormStatus = ({ state }) => {
    const { isLoading, mainError } = state;
    return (React.createElement("div", { "data-testid": "error-wrap", className: Styles.errorWrap },
        isLoading && React.createElement(Spinner, { className: Styles.spinner }),
        mainError && (React.createElement("span", { "data-testid": "main-error", className: Styles.error }, mainError))));
};
export default FormStatus;
