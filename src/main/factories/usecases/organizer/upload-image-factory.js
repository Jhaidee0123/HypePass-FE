import appConfig from "../../../config/app-config";
import { RemoteUploadImage } from "../../../../data/usecases/remote-upload-image";
export const makeUploadImage = () => new RemoteUploadImage(appConfig.api.ENDPOINT);
