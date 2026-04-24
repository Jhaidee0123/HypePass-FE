import { InvalidFieldError } from "../errors";
export class MinLengthValidation {
    constructor(field, minLength) {
        this.field = field;
        this.minLength = minLength;
    }
    validate(input) {
        var _a;
        return ((_a = input[this.field]) === null || _a === void 0 ? void 0 : _a.length) < this.minLength ? new InvalidFieldError() : null;
    }
}
