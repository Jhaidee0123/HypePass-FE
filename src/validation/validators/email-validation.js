import { InvalidFieldError } from "../errors/invalid-field-error";
export class EmailValidation {
    constructor(field) {
        this.field = field;
    }
    validate(input) {
        return !input[this.field] ||
            String(input[this.field])
                .toLowerCase()
                .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            ? null
            : new InvalidFieldError();
    }
}
