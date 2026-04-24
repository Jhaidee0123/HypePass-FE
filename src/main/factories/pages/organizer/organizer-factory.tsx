import React from 'react';
import { Organizer } from '@/presentation/pages';
import {
  makeOrganizerCompanies,
  makeOrganizerEvents,
} from '@/main/factories/usecases/organizer';
import { makeCreateCompanyValidation } from '@/main/factories/validation/company-validation-factory';

export const OrganizerFactory: React.FC = () => (
  <Organizer
    companies={makeOrganizerCompanies()}
    events={makeOrganizerEvents()}
    createCompanyValidation={makeCreateCompanyValidation()}
  />
);
