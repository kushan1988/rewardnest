import { apiFetchAuth } from "./api";

export type RewardPeriod = "weekly" | "monthly";

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  period: RewardPeriod;
  active: boolean;
}

export interface RewardCreate {
  name: string;
  description?: string | null;
  points_required: number;
  period: RewardPeriod;
}

export interface RewardUpdate {
  name?: string;
  description?: string | null;
  points_required?: number;
  period?: RewardPeriod;
  active?: boolean;
}

export async function getRewards(): Promise<Reward[]> {
  return apiFetchAuth<Reward[]>("/rewards");
}

export async function createReward(
  data: RewardCreate,
): Promise<Reward> {
  return apiFetchAuth<Reward>("/rewards", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReward(
  rewardId: string,
  data: RewardUpdate,
): Promise<Reward> {
  return apiFetchAuth<Reward>(
    `/rewards/${rewardId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteReward(
  rewardId: string,
): Promise<void> {
  await apiFetchAuth<void>(
    `/rewards/${rewardId}`,
    {
      method: "DELETE",
    },
  );
}