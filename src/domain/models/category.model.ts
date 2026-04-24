export type CategoryModel = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
};
