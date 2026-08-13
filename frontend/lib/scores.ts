import { apiFetchAuth } from "./api";

export interface ScoreSummary {
  today: number;
  week: number;
  month: number;
  total: number;
  today_completions: number;
  week_completions: number;
  month_completions: number;
}

export interface RewardEligibility {
  reward_id: string;
  reward_name: string;
  description: string | null;
  points_required: number;
  period: string;
  child_id: string;
  current_points: number;
  eligible: boolean;
  pending: boolean;
}

export async function getScoreSummary(
  childId: string,
): Promise<ScoreSummary> {
  return apiFetchAuth<ScoreSummary>(
    `/scores/children/${childId}/summary`,
  );
}

export async function getRewardEligibility(
  childId: string,
): Promise<RewardEligibility[]> {
  return apiFetchAuth<RewardEligibility[]>(
    `/rewards/children/${childId}/eligibility`,
  );
}