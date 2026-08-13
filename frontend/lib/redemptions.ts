import { apiFetchAuth } from "./api";

export interface RewardRedemption {
  id: string;
  child_id: string;
  reward_id: string;
  points_spent: number;
  period: string;
  status: string;
}

export async function claimReward(
  rewardId: string,
  childId: string,
): Promise<RewardRedemption> {
  return apiFetchAuth<RewardRedemption>(
    `/rewards/${rewardId}/claim?child_id=${childId}`,
    {
      method: "POST",
    },
  );
}

export async function getRedemptions(): Promise<RewardRedemption[]> {
  return apiFetchAuth<RewardRedemption[]>(
    "/rewards/redemptions",
  );
}

export async function approveRedemption(
  redemptionId: string,
): Promise<RewardRedemption> {
  return apiFetchAuth<RewardRedemption>(
    `/rewards/redemptions/${redemptionId}/approve`,
    {
      method: "POST",
    },
  );
}

export async function rejectRedemption(
  redemptionId: string,
): Promise<RewardRedemption> {
  return apiFetchAuth<RewardRedemption>(
    `/rewards/redemptions/${redemptionId}/reject`,
    {
      method: "POST",
    },
  );
}