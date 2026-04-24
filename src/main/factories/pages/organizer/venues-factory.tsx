import React from 'react';
import { OrganizerVenuesPage } from '@/presentation/pages';
import { makeOrganizerVenues } from '@/main/factories/usecases/organizer';

export const OrganizerVenuesFactory: React.FC = () => (
  <OrganizerVenuesPage venues={makeOrganizerVenues()} />
);
