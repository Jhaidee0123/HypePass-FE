import React from 'react';
import { EventEditor } from "../../../../presentation/pages";
import { makeOrganizerEvents, makeUploadImage, } from "../../usecases/organizer";
export const EventEditorFactory = () => (React.createElement(EventEditor, { events: makeOrganizerEvents(), uploader: makeUploadImage() }));
