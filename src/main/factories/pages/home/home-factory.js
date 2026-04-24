import React from 'react';
import { Home } from "../../../../presentation/pages";
import { makePublicEvents } from "../../usecases/public";
import { makeOrganizerCategories } from "../../usecases/organizer";
export const HomeFactory = () => (React.createElement(Home, { publicEvents: makePublicEvents(), categories: makeOrganizerCategories() }));
