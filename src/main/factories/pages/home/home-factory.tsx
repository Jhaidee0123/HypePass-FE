import React from 'react';
import { Home } from '@/presentation/pages';
import { makePublicEvents } from '@/main/factories/usecases/public';

export const HomeFactory: React.FC = () => (
  <Home publicEvents={makePublicEvents()} />
);
