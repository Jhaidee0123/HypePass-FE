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
export class RemoteAdminReview {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }
    // ===== events =====
    listEvents(status) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.get(`${this.apiEndpoint}/admin/events`, {
                withCredentials: true,
                params: status ? { status } : undefined,
            });
            return data;
        });
    }
    getEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.get(`${this.apiEndpoint}/admin/events/${eventId}`, { withCredentials: true });
            return data;
        });
    }
    approveEvent(eventId, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.apiEndpoint}/admin/events/${eventId}/approve`, { reviewNotes: notes }, { withCredentials: true });
            return data;
        });
    }
    rejectEvent(eventId, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.apiEndpoint}/admin/events/${eventId}/reject`, { reviewNotes: notes }, { withCredentials: true });
            return data;
        });
    }
    publishEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.apiEndpoint}/admin/events/${eventId}/publish`, {}, { withCredentials: true });
            return data;
        });
    }
    unpublishEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.apiEndpoint}/admin/events/${eventId}/unpublish`, {}, { withCredentials: true });
            return data;
        });
    }
    // ===== companies =====
    listCompanies(status) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.get(`${this.apiEndpoint}/admin/companies`, {
                withCredentials: true,
                params: status ? { status } : undefined,
            });
            return data;
        });
    }
    approveCompany(companyId, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.apiEndpoint}/admin/companies/${companyId}/approve`, { reviewNotes: notes }, { withCredentials: true });
            return data;
        });
    }
    rejectCompany(companyId, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.apiEndpoint}/admin/companies/${companyId}/reject`, { reviewNotes: notes }, { withCredentials: true });
            return data;
        });
    }
}
