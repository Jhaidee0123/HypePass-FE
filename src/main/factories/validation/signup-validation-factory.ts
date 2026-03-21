import { ValidationComposite } from '@/main/composites';
import { ValidationBuilder as Builder } from '@/main/builders';

export const makeSignUpValidation = (): ValidationComposite => {
  return ValidationComposite.build([
    ...Builder.field('name').required().build(),
    ...Builder.field('email').required().email().build(),
    ...Builder.field('password').required().min(8).build(),
    ...Builder.field('passwordConfirmation').required().sameAs('password').build()
  ]);
};
