import appConfig from "../../../config/app-config";
import { RemoteAdminReview } from "../../../../data/usecases/remote-admin-review";
export const makeAdminReview = () => new RemoteAdminReview(appConfig.api.ENDPOINT);
