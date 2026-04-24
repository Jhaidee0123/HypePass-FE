import React from 'react';
import { EventsPage } from '@/presentation/pages';
import { makePublicEvents } from '@/main/factories/usecases/public';
import { makeOrganizerCategories } from '@/main/factories/usecases/organizer';

export const EventsPageFactory: React.FC = () => (
  <EventsPage
    publicEvents={makePublicEvents()}
    categories={makeOrganizerCategories()}
  />
);
