import { apiFetchAuth } from "./api";

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  date_of_birth: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export async function getChildren(): Promise<Child[]> {
  return apiFetchAuth<Child[]>("/children");
}