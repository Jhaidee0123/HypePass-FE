export class ValidationComposite {
    constructor(validators) {
        this.validators = validators;
    }
    static build(validators) {
        return new ValidationComposite(validators);
    }
    validate(fieldName, input) {
        const validators = this.validators.filter(v => v.field === fieldName);
        for (const validator of validators) {
            const error = validator.validate(input);
            if (error) {
                return error.message;
            }
        }
    }
}
