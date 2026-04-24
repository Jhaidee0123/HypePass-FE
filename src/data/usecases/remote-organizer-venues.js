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
export class RemoteOrganizerVenues {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }
    list(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.get(`${this.apiEndpoint}/companies/${companyId}/venues`, { withCredentials: true });
            return data;
        });
    }
    create(companyId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.post(`${this.apiEndpoint}/companies/${companyId}/venues`, params, { withCredentials: true });
            return data;
        });
    }
    delete(companyId, venueId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios.delete(`${this.apiEndpoint}/companies/${companyId}/venues/${venueId}`, { withCredentials: true });
        });
    }
}
