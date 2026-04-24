import axios from 'axios';
import { OrganizerCategories } from '@/domain/usecases';
import { CategoryModel } from '@/domain/models';

export class RemoteOrganizerCategories implements OrganizerCategories {
  constructor(private readonly apiEndpoint: string) {}

  async list(): Promise<CategoryModel[]> {
    const { data } = await axios.get<CategoryModel[]>(
      `${this.apiEndpoint}/categories`,
      { withCredentials: true },
    );
    return data;
  }
}
