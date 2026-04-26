import React from 'react';
import { EventCreate } from '@/presentation/pages';
import {
  makeOrganizerCategories,
  makeOrganizerEvents,
  makeUploadImage,
} from '@/main/factories/usecases/organizer';

export const EventCreateFactory: React.FC = () => (
  <EventCreate
    events={makeOrganizerEvents()}
    categories={makeOrganizerCategories()}
    uploader={makeUploadImage()}
  />
);
