import React from 'react';
import Styles from './layout-styles.scss';
import Nav from './nav';
import Footer from './footer';
/**
 * Default app shell: sticky nav + scrollable main + footer.
 * Pages that need a bespoke fullscreen layout (login/signup) should not use this.
 */
const Layout = ({ children, noFooter = false }) => {
    return (React.createElement("div", { className: Styles.shell },
        React.createElement(Nav, null),
        React.createElement("main", { className: Styles.main }, children),
        !noFooter && React.createElement(Footer, null)));
};
export default Layout;
