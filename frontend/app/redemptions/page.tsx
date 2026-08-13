"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  approveRedemption,
  getRedemptions,
  rejectRedemption,
  RewardRedemption,
} from "@/lib/redemptions";

import { getChildren, Child } from "@/lib/children";
import { getRewards, Reward } from "@/lib/rewards";

export default function RedemptionsPage() {
  const router = useRouter();

  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [redemptionData, childrenData, rewardsData] =
        await Promise.all([
          getRedemptions(),
          getChildren(),
          getRewards(),
        ]);

      setRedemptions(redemptionData);
      setChildren(childrenData);
      setRewards(rewardsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reward requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(redemptionId: string) {
    try {
      setProcessingId(redemptionId);
      setActionError("");

      const updatedRedemption =
        await approveRedemption(redemptionId);

      setRedemptions((current) =>
        current.map((redemption) =>
          redemption.id === redemptionId
            ? updatedRedemption
            : redemption,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to approve reward request.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(redemptionId: string) {
    try {
      setProcessingId(redemptionId);
      setActionError("");

      const updatedRedemption =
        await rejectRedemption(redemptionId);

      setRedemptions((current) =>
        current.map((redemption) =>
          redemption.id === redemptionId
            ? updatedRedemption
            : redemption,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to reject reward request.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  function getChildName(childId: string) {
    return children.find((child) => child.id === childId)?.name ?? "Unknown Child";
  }

  function getRewardName(rewardId: string) {
    return rewards.find((reward) => reward.id === rewardId)?.name ?? "Unknown Reward";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-red-200">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Unable to load reward requests
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={loadData}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Try Again
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-3 block w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const pendingRedemptions = redemptions.filter(
    (redemption) => redemption.status === "pending",
  );

  const completedRedemptions = redemptions.filter(
    (redemption) => redemption.status !== "pending",
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xl font-bold text-slate-900"
          >
            ⭐ RewardNest
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl p-6 lg:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
            PARENT REVIEW
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Reward Requests
          </h1>

          <p className="mt-2 text-slate-500">
            Review and respond to rewards requested by your children.
          </p>
        </div>

        {actionError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/* Pending Requests */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Pending Requests
            </h2>

            {pendingRedemptions.length > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                {pendingRedemptions.length} waiting
              </span>
            )}
          </div>

          {pendingRedemptions.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="text-5xl">🎉</div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                All caught up!
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are no reward requests waiting for your review.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {pendingRedemptions.map((redemption) => (
                <RedemptionCard
                  key={redemption.id}
                  redemption={redemption}
                  childName={getChildName(redemption.child_id)}
                  rewardName={getRewardName(redemption.reward_id)}
                  processing={processingId === redemption.id}
                  onApprove={() => handleApprove(redemption.id)}
                  onReject={() => handleReject(redemption.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* History */}
        {completedRedemptions.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              History
            </h2>

            <div className="mt-4 space-y-4">
              {completedRedemptions.map((redemption) => (
                <RedemptionCard
                  key={redemption.id}
                  redemption={redemption}
                  childName={getChildName(redemption.child_id)}
                  rewardName={getRewardName(redemption.reward_id)}
                  processing={false}
                />
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function RedemptionCard({
  redemption,
  childName,
  rewardName,
  processing,
  onApprove,
  onReject,
}: {
  redemption: RewardRedemption;
  childName: string;
  rewardName: string;
  processing: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const isPending = redemption.status === "pending";

  const isApproved = redemption.status === "approved";

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
            🎁
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {childName}
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              {rewardName}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {redemption.points_spent} points · {redemption.period}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPending ? (
            <>
              <button
                onClick={onReject}
                disabled={processing}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? "Processing..." : "Reject"}
              </button>

              <button
                onClick={onApprove}
                disabled={processing}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? "Processing..." : "Approve"}
              </button>
            </>
          ) : (
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                isApproved
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isApproved ? "✓ Approved" : "✕ Rejected"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}