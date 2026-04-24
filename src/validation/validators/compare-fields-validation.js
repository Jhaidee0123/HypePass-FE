import { InvalidFieldError } from "../errors";
export class CompareFieldsValidation {
    constructor(field, fieldToCompare) {
        this.field = field;
        this.fieldToCompare = fieldToCompare;
    }
    validate(input) {
        return input[this.field] !== input[this.fieldToCompare] ? new InvalidFieldError() : null;
    }
}
