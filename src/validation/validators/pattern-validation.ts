import { FieldValidation } from '@/validation/protocols/field-validation';
import { InvalidFieldError } from '@/validation/errors';

export class PatternValidation implements FieldValidation {
  constructor(
    readonly field: string,
    private readonly pattern: RegExp,
  ) {}

  validate(input: object): Error | null {
    const value = (input as Record<string, unknown>)[this.field];
    if (value === undefined || value === null || value === '') return null;
    return this.pattern.test(String(value)) ? null : new InvalidFieldError();
  }
}
