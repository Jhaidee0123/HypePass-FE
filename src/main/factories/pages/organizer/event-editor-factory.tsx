import React from 'react';
import { EventEditor } from '@/presentation/pages';
import {
  makeOrganizerEvents,
  makeUploadImage,
} from '@/main/factories/usecases/organizer';

export const EventEditorFactory: React.FC = () => (
  <EventEditor
    events={makeOrganizerEvents()}
    uploader={makeUploadImage()}
  />
);
