import React from 'react';
import { EventDetail } from "../../../../presentation/pages";
import { makePublicEvents } from "../../usecases/public";
export const EventDetailFactory = () => (React.createElement(EventDetail, { publicEvents: makePublicEvents() }));
