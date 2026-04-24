import appConfig from "../../../config/app-config";
import { RemoteOrganizerVenues } from "../../../../data/usecases/remote-organizer-venues";
export const makeOrganizerVenues = () => new RemoteOrganizerVenues(appConfig.api.ENDPOINT);
