import appConfig from "../../../config/app-config";
import { RemoteOrganizerCompanies } from "../../../../data/usecases/remote-organizer-companies";
export const makeOrganizerCompanies = () => new RemoteOrganizerCompanies(appConfig.api.ENDPOINT);
