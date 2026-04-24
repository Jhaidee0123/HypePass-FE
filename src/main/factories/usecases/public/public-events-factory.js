import appConfig from "../../../config/app-config";
import { RemotePublicEvents } from "../../../../data/usecases/remote-public-events";
export const makePublicEvents = () => new RemotePublicEvents(appConfig.api.ENDPOINT);
