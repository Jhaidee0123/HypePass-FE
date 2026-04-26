export type MyStaffEventRow = {
  eventId: string;
  title: string;
  slug: string;
  status: string;
  coverImageUrl: string | null;
  role: string;
  note: string | null;
  assignedAt: string;
};

export interface StaffSelf {
  listEvents(): Promise<MyStaffEventRow[]>;
}
