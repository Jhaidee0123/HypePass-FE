import React from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './footer-styles.scss';
import Logo from '../logo/logo';
const Footer = () => {
    const { t } = useTranslation();
    const year = new Date().getFullYear();
    return (React.createElement("footer", { className: Styles.footer },
        React.createElement("div", { className: Styles.top },
            React.createElement("div", { className: Styles.brand },
                React.createElement(Logo, null),
                React.createElement("p", { className: Styles.tagline }, t('home.footer.tagline'))),
            React.createElement("div", { className: Styles.cols },
                React.createElement("div", { className: Styles.col },
                    React.createElement("div", { className: Styles.colTitle }, t('home.footer.listen')),
                    React.createElement("div", { className: Styles.colItem }, t('home.footer.concerts')),
                    React.createElement("div", { className: Styles.colItem }, t('home.footer.festivals')),
                    React.createElement("div", { className: Styles.colItem }, t('home.footer.tours'))),
                React.createElement("div", { className: Styles.col },
                    React.createElement("div", { className: Styles.colTitle }, t('home.footer.trade')),
                    React.createElement("div", { className: Styles.colItem }, t('home.footer.market')),
                    React.createElement("div", { className: Styles.colItem }, t('home.footer.sellTickets')),
                    React.createElement("div", { className: Styles.colItem }, t('home.footer.transfer'))))),
        React.createElement("div", { className: Styles.bottom },
            React.createElement("span", null,
                "\u00A9 ",
                year,
                " HypePass"),
            React.createElement("span", null, "COP \u00B7 Colombia"))));
};
export default Footer;
