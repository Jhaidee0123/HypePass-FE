import React from 'react';
import Styles from './logo-styles.scss';
const Logo = ({ size = 22, withText = true, textSize = 24 }) => {
    return (React.createElement("div", { className: Styles.logo },
        React.createElement("svg", { width: size, height: size, viewBox: "0 0 22 22", "aria-hidden": true },
            React.createElement("circle", { cx: "11", cy: "11", r: "10", fill: "none", stroke: "var(--logo-accent, #d7ff3a)", strokeWidth: "1.5" }),
            React.createElement("circle", { cx: "11", cy: "11", r: "4", fill: "var(--logo-accent, #d7ff3a)" })),
        withText && (React.createElement("span", { className: Styles.text, style: { fontSize: textSize } }, "HYPEPASS"))));
};
export default Logo;
