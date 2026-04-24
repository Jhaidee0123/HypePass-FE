/**
 * Proxy Pattern: PrivateRoute
 *
 * Auth guard that checks if the user has an active session.
 * If not authenticated, redirects to /login.
 *
 * Usage in router:
 *   <PrivateRoute><DashboardPage /></PrivateRoute>
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { currentAccountState } from "../../presentation/components";
import { useRecoilValue } from 'recoil';
const PrivateRoute = ({ children }) => {
    var _a;
    const { getCurrentAccount } = useRecoilValue(currentAccountState);
    return ((_a = getCurrentAccount()) === null || _a === void 0 ? void 0 : _a.session) ? React.createElement(React.Fragment, null, children) : React.createElement(Navigate, { to: "/login", replace: true });
};
export default PrivateRoute;
