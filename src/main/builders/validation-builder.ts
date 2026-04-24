/**
 * Builder Pattern: ValidationBuilder
 *
 * Fluent API for building validation chains.
 * Usage:
 *   ValidationBuilder.field('email').required().email().build()
 *   ValidationBuilder.field('password').required().min(8).build()
 */
import { FieldValidation } from '@/validation/protocols';
import {
  RequiredFieldValidation,
  EmailValidation,
  MinLengthValidation,
  CompareFieldsValidation,
  PatternValidation,
} from '@/validation/validators';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ValidationBuilder {
  private constructor(
    private readonly fieldName: string,
    private readonly validations: FieldValidation[],
  ) {}

  static field(fieldName: string): ValidationBuilder {
    return new ValidationBuilder(fieldName, []);
  }

  required(): ValidationBuilder {
    this.validations.push(new RequiredFieldValidation(this.fieldName));
    return this;
  }

  email(): ValidationBuilder {
    this.validations.push(new EmailValidation(this.fieldName));
    return this;
  }

  min(length: number): ValidationBuilder {
    this.validations.push(new MinLengthValidation(this.fieldName, length));
    return this;
  }

  sameAs(fieldToCompare: string): ValidationBuilder {
    this.validations.push(
      new CompareFieldsValidation(this.fieldName, fieldToCompare),
    );
    return this;
  }

  pattern(regex: RegExp): ValidationBuilder {
    this.validations.push(new PatternValidation(this.fieldName, regex));
    return this;
  }

  slug(): ValidationBuilder {
    return this.pattern(SLUG_PATTERN);
  }

  build(): FieldValidation[] {
    return this.validations;
  }
}
