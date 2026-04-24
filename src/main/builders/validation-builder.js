import { RequiredFieldValidation, EmailValidation, MinLengthValidation, CompareFieldsValidation } from "../../validation/validators";
export class ValidationBuilder {
    constructor(fieldName, validations) {
        this.fieldName = fieldName;
        this.validations = validations;
    }
    static field(fieldName) {
        return new ValidationBuilder(fieldName, []);
    }
    required() {
        this.validations.push(new RequiredFieldValidation(this.fieldName));
        return this;
    }
    email() {
        this.validations.push(new EmailValidation(this.fieldName));
        return this;
    }
    min(length) {
        this.validations.push(new MinLengthValidation(this.fieldName, length));
        return this;
    }
    sameAs(fieldToCompare) {
        this.validations.push(new CompareFieldsValidation(this.fieldName, fieldToCompare));
        return this;
    }
    build() {
        return this.validations;
    }
}
