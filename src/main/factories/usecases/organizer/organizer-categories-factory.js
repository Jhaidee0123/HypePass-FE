import appConfig from "../../../config/app-config";
import { RemoteOrganizerCategories } from "../../../../data/usecases/remote-organizer-categories";
export const makeOrganizerCategories = () => new RemoteOrganizerCategories(appConfig.api.ENDPOINT);
