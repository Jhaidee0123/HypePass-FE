import React from 'react';
import { EventReview } from "../../../../presentation/pages";
import { makeAdminReview } from "../../usecases/admin";
export const EventReviewFactory = () => (React.createElement(EventReview, { review: makeAdminReview() }));
