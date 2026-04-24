import { RequiredFieldError } from "../errors";
export class RequiredFieldValidation {
    constructor(field) {
        this.field = field;
    }
    validate(input) {
        return input[this.field] ? null : new RequiredFieldError();
    }
}
