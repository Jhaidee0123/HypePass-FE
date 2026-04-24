var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
export class RemotePublicEvents {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }
    list() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            const params = cleanParams(filters);
            const { data } = yield axios.get(`${this.apiEndpoint}/public/events`, { params });
            return data;
        });
    }
    getBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.get(`${this.apiEndpoint}/public/events/${slug}`);
            return data;
        });
    }
}
function cleanParams(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || v === null || v === '')
            continue;
        out[k] = v;
    }
    return out;
}
