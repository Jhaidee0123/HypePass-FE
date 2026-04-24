import React from 'react';
import { EventReview } from '@/presentation/pages';
import { makeAdminReview } from '@/main/factories/usecases/admin';

export const EventReviewFactory: React.FC = () => (
  <EventReview review={makeAdminReview()} />
);
