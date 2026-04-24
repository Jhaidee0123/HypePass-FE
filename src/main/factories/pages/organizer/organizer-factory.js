import React from 'react';
import { Organizer } from "../../../../presentation/pages";
import { makeOrganizerCompanies, makeOrganizerEvents, } from "../../usecases/organizer";
export const OrganizerFactory = () => (React.createElement(Organizer, { companies: makeOrganizerCompanies(), events: makeOrganizerEvents() }));
