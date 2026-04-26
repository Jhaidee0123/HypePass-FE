import React from 'react';
import { SupportFormPage } from '@/presentation/pages';
import { makePublicSupport } from '@/main/factories/usecases/support';

export const SupportFormFactory: React.FC = () => (
  <SupportFormPage support={makePublicSupport()} />
);
