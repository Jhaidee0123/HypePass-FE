import appConfig from "../../../config/app-config";
import { RemoteOrganizerEvents } from "../../../../data/usecases/remote-organizer-events";
export const makeOrganizerEvents = () => new RemoteOrganizerEvents(appConfig.api.ENDPOINT);
