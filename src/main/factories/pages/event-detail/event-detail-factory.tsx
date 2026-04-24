import React from 'react';
import { EventDetail } from '@/presentation/pages';
import { makePublicEvents } from '@/main/factories/usecases/public';

export const EventDetailFactory: React.FC = () => (
  <EventDetail publicEvents={makePublicEvents()} />
);
