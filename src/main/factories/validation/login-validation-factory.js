import { ValidationComposite } from "../../composites";
import { ValidationBuilder as Builder } from "../../builders";
export const makeLoginValidation = () => {
    return ValidationComposite.build([
        ...Builder.field('email').required().email().build(),
        ...Builder.field('password').required().min(5).build()
    ]);
};
