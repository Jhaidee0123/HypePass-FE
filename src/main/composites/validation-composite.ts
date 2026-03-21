/**
 * Composite Pattern: ValidationComposite
 *
 * Combines multiple FieldValidation instances into a single Validation.
 * When validate() is called, it runs all validators for the given field
 * and returns the first error message found.
 */
import { Validation } from '@/presentation/protocols/validation';
import { FieldValidation } from '@/validation/protocols/field-validation';

export class ValidationComposite implements Validation {
  private constructor(private readonly validators: FieldValidation[]) {}

  static build(validators: FieldValidation[]): ValidationComposite {
    return new ValidationComposite(validators);
  }

  validate(fieldName: string, input: object): string {
    const validators = this.validators.filter(v => v.field === fieldName);
    for (const validator of validators) {
      const error = validator.validate(input);
      if (error) {
        return error.message;
      }
    }
  }
}
