/**
 * Proxy Pattern: AdminRoute
 *
 * Auth guard that checks both authentication AND the `platform_admin` role.
 * - No session -> redirect to /login
 * - Not platform_admin -> redirect to /
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { currentAccountState } from "../../presentation/components";
import { useRecoilValue } from 'recoil';
const AdminRoute = ({ children }) => {
    var _a;
    const { getCurrentAccount } = useRecoilValue(currentAccountState);
    const account = getCurrentAccount();
    if (!(account === null || account === void 0 ? void 0 : account.session))
        return React.createElement(Navigate, { to: "/login", replace: true });
    if (((_a = account === null || account === void 0 ? void 0 : account.user) === null || _a === void 0 ? void 0 : _a.role) !== 'platform_admin')
        return React.createElement(Navigate, { to: "/", replace: true });
    return React.createElement(React.Fragment, null, children);
};
export default AdminRoute;
