/**
 * Factory: LoginFactory
 *
 * Wires up the Login page with its dependencies:
 * - authentication: RemoteAuthentication (talks to Better Auth)
 * - validation: ValidationComposite (email required, password min 5)
 *
 * The page itself is decoupled from how these are created.
 */
import React from 'react';
import { Login } from "../../../../presentation/pages";
import { makeRemoteAuthentication } from "../../usecases";
import { makeLoginValidation } from "../../validation";
export const LoginFactory = () => {
    return React.createElement(Login, { authentication: makeRemoteAuthentication(), validation: makeLoginValidation() });
};
