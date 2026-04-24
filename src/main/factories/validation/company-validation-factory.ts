import { ValidationComposite } from '@/main/composites';
import { ValidationBuilder as Builder } from '@/main/builders';

export const makeCreateCompanyValidation = (): ValidationComposite => {
  return ValidationComposite.build([
    ...Builder.field('name').required().min(2).build(),
    ...Builder.field('slug').required().slug().build(),
    ...Builder.field('contactEmail').email().build(),
  ]);
};
