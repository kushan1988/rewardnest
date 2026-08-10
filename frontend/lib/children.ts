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

export interface ChildCreate {
  name: string;
  date_of_birth?: string | null;
  avatar?: string | null;
}

export interface ChildUpdate {
  name?: string;
  date_of_birth?: string | null;
  avatar?: string | null;
}

export async function getChildren(): Promise<Child[]> {
  return apiFetchAuth<Child[]>("/children");
}

export async function createChild(
  data: ChildCreate
): Promise<Child> {
  return apiFetchAuth<Child>("/children", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateChild(
  childId: string,
  data: ChildUpdate
): Promise<Child> {
  return apiFetchAuth<Child>(`/children/${childId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteChild(
  childId: string
): Promise<void> {
  await apiFetchAuth<void>(`/children/${childId}`, {
    method: "DELETE",
  });
}