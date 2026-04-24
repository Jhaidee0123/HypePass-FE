import React from 'react';
import { Admin } from "../../../../presentation/pages";
import { makeAdminReview } from "../../usecases/admin";
export const AdminFactory = () => (React.createElement(Admin, { review: makeAdminReview() }));
