import React from 'react';
import { EventEditor } from '@/presentation/pages';
import {
  makeOrganizerEvents,
  makeUploadImage,
} from '@/main/factories/usecases/organizer';
import { makeEventPromoters } from '@/main/factories/usecases/promoter';

export const EventEditorFactory: React.FC = () => (
  <EventEditor
    events={makeOrganizerEvents()}
    uploader={makeUploadImage()}
    promoters={makeEventPromoters()}
  />
);
