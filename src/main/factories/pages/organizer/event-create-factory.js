import React from 'react';
import { EventCreate } from "../../../../presentation/pages";
import { makeOrganizerCategories, makeOrganizerEvents, makeOrganizerVenues, makeUploadImage, } from "../../usecases/organizer";
export const EventCreateFactory = () => (React.createElement(EventCreate, { events: makeOrganizerEvents(), categories: makeOrganizerCategories(), venues: makeOrganizerVenues(), uploader: makeUploadImage() }));
