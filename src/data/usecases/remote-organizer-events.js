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
export class RemoteOrganizerEvents {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }
    base(companyId) {
        return `${this.apiEndpoint}/companies/${companyId}/events`;
    }
    list(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.get(this.base(companyId), {
                withCredentials: true,
            });
            return data;
        });
    }
    get(companyId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.get(`${this.base(companyId)}/${eventId}`, { withCredentials: true });
            return data;
        });
    }
    create(companyId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.post(this.base(companyId), params, { withCredentials: true });
            return data;
        });
    }
    update(companyId, eventId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.base(companyId)}/${eventId}`, params, { withCredentials: true });
            return data;
        });
    }
    delete(companyId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios.delete(`${this.base(companyId)}/${eventId}`, {
                withCredentials: true,
            });
        });
    }
    submitForReview(companyId, eventId, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.post(`${this.base(companyId)}/${eventId}/submit-review`, { notes }, { withCredentials: true });
            return data;
        });
    }
    addSession(companyId, eventId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.post(`${this.base(companyId)}/${eventId}/sessions`, params, { withCredentials: true });
            return data;
        });
    }
    updateSession(companyId, eventId, sessionId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.base(companyId)}/${eventId}/sessions/${sessionId}`, params, { withCredentials: true });
            return data;
        });
    }
    deleteSession(companyId, eventId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios.delete(`${this.base(companyId)}/${eventId}/sessions/${sessionId}`, { withCredentials: true });
        });
    }
    addSection(companyId, eventId, sessionId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.post(`${this.base(companyId)}/${eventId}/sessions/${sessionId}/sections`, params, { withCredentials: true });
            return data;
        });
    }
    updateSection(companyId, eventId, sessionId, sectionId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.base(companyId)}/${eventId}/sessions/${sessionId}/sections/${sectionId}`, params, { withCredentials: true });
            return data;
        });
    }
    deleteSection(companyId, eventId, sessionId, sectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios.delete(`${this.base(companyId)}/${eventId}/sessions/${sessionId}/sections/${sectionId}`, { withCredentials: true });
        });
    }
    addPhase(companyId, eventId, sessionId, sectionId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.post(`${this.base(companyId)}/${eventId}/sessions/${sessionId}/sections/${sectionId}/phases`, params, { withCredentials: true });
            return data;
        });
    }
    updatePhase(companyId, eventId, sessionId, sectionId, phaseId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.patch(`${this.base(companyId)}/${eventId}/sessions/${sessionId}/sections/${sectionId}/phases/${phaseId}`, params, { withCredentials: true });
            return data;
        });
    }
    deletePhase(companyId, eventId, sessionId, sectionId, phaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios.delete(`${this.base(companyId)}/${eventId}/sessions/${sessionId}/sections/${sectionId}/phases/${phaseId}`, { withCredentials: true });
        });
    }
    addMedia(companyId, eventId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios.post(`${this.base(companyId)}/${eventId}/media`, params, { withCredentials: true });
            return data;
        });
    }
    removeMedia(companyId, eventId, mediaId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios.delete(`${this.base(companyId)}/${eventId}/media/${mediaId}`, { withCredentials: true });
        });
    }
}
