import { CategoryModel } from '../models';

export interface OrganizerCategories {
  list(): Promise<CategoryModel[]>;
}
