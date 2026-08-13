import { apiFetchAuth } from "./api";

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  period: string;
  active: boolean;
}

export async function getRewards(): Promise<Reward[]> {
  return apiFetchAuth<Reward[]>("/rewards");
}