import React from 'react';
import { OrganizerMembersPage } from '@/presentation/pages';
import { makeOrganizerCompanies } from '@/main/factories/usecases/organizer';

export const OrganizerMembersFactory: React.FC = () => (
  <OrganizerMembersPage companies={makeOrganizerCompanies()} />
);
