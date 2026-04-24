var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { authClient } from "../../lib/auth-client";
import appConfig from "../../main/config/app-config";
export class RemoteAuthentication {
    static toAccountModel(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        return {
            user: {
                id: (_b = (_a = data.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '',
                name: (_d = (_c = data.user) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : '',
                email: (_f = (_e = data.user) === null || _e === void 0 ? void 0 : _e.email) !== null && _f !== void 0 ? _f : '',
                emailVerified: (_h = (_g = data.user) === null || _g === void 0 ? void 0 : _g.emailVerified) !== null && _h !== void 0 ? _h : false,
                role: (_j = data.user) === null || _j === void 0 ? void 0 : _j.role,
                image: (_k = data.user) === null || _k === void 0 ? void 0 : _k.image,
                createdAt: (_l = data.user) === null || _l === void 0 ? void 0 : _l.createdAt,
                updatedAt: (_m = data.user) === null || _m === void 0 ? void 0 : _m.updatedAt,
            },
            session: {
                id: (_p = (_o = data.session) === null || _o === void 0 ? void 0 : _o.id) !== null && _p !== void 0 ? _p : '',
                token: (_s = (_r = (_q = data.session) === null || _q === void 0 ? void 0 : _q.token) !== null && _r !== void 0 ? _r : data.token) !== null && _s !== void 0 ? _s : '',
                expiresAt: (_t = data.session) === null || _t === void 0 ? void 0 : _t.expiresAt,
            },
        };
    }
    auth(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield authClient.signIn.email({
                email: params.email,
                password: params.password,
            });
            if (error) {
                throw new Error(error.message || 'Login failed');
            }
            if (!data) {
                throw new Error('No response received from server');
            }
            return RemoteAuthentication.toAccountModel(data);
        });
    }
    signUp(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield authClient.signUp.email({
                name: params.name,
                email: params.email,
                password: params.password,
            });
            if (error) {
                throw new Error(error.message || 'Signup failed');
            }
            if (!data) {
                throw new Error('No response received from server');
            }
            return RemoteAuthentication.toAccountModel(data);
        });
    }
    signOut() {
        return __awaiter(this, void 0, void 0, function* () {
            yield authClient.signOut();
        });
    }
    forgotPassword(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`${appConfig.api.AUTH_URL}/api/auth/request-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: params.email,
                    redirectTo: `${window.location.origin}/auth-reset-password`,
                }),
            });
            if (!res.ok) {
                const data = yield res.json().catch(() => ({}));
                if (res.status === 404) {
                    throw new Error('No account found with this email');
                }
                throw new Error(data.message || 'Failed to request password reset');
            }
        });
    }
    resetPassword(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`${appConfig.api.AUTH_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    token: params.token,
                    newPassword: params.newPassword,
                }),
            });
            if (!res.ok) {
                const data = yield res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to reset password');
            }
        });
    }
}
