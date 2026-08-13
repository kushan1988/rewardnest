"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getChild, Child } from "@/lib/children";
import {
    getRewardEligibility,
    RewardEligibility,
} from "@/lib/scores";
import { claimReward } from "@/lib/redemptions";

export default function ClaimRewardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const childId = searchParams.get("childId");
    const rewardId = searchParams.get("rewardId");

    const [child, setChild] = useState<Child | null>(null);
    const [reward, setReward] =
        useState<RewardEligibility | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [claiming, setClaiming] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function loadData() {
            if (!childId || !rewardId) {
                setError("Missing child or reward information.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [childData, rewards] = await Promise.all([
                    getChild(childId),
                    getRewardEligibility(childId),
                ]);

                const selectedReward = rewards.find(
                    (item) => item.reward_id === rewardId,
                );

                if (!selectedReward) {
                    setError("Reward not found.");
                    return;
                }

                if (selectedReward.pending) {
                    setError(
                        "You already asked for this reward. Your parent will review it soon!",
                    );
                    setReward(selectedReward);
                    return;
                }

                setChild(childData);
                setReward(selectedReward);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load reward details.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [childId, rewardId]);

    async function handleClaim() {
        if (!childId || !rewardId || !reward) {
            return;
        }

        if (!reward.eligible) {
            setError(
                "This reward is no longer eligible for claiming.",
            );
            return;
        }

        try {
            setClaiming(true);
            setError("");

            await claimReward(rewardId, childId);

            setSuccess(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to claim reward.",
            );
        } finally {
            setClaiming(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-2xl">
                    <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />

                    <div className="mt-6 h-96 animate-pulse rounded-3xl bg-slate-200" />
                </div>
            </main>
        );
    }

    if (error && !reward) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-2xl">
                    <button
                        onClick={() => router.back()}
                        className="mb-6 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        ← Back
                    </button>

                    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-red-200">
                        <div className="text-4xl">⚠️</div>

                        <h1 className="mt-4 text-2xl font-bold text-slate-900">
                            Unable to load reward
                        </h1>

                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (!child || !reward) {
        return null;
    }

    if (success) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:p-12">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
                            🎉
                        </div>

                        <h1 className="mt-6 text-3xl font-bold text-slate-900">
                            🎉 Great Choice!
                        </h1>

                        <p className="mt-3 text-slate-500">
                            Yay, {child.name}! You chose to claim the reward{" "}
                            <span className="font-semibold text-slate-800">
                                {reward.reward_name}
                            </span>
                            . Your parent will now review your reward request.
                        </p>

                        <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-left">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">
                                    Reward
                                </span>

                                <span className="font-semibold text-slate-900">
                                    {reward.reward_name}
                                </span>
                            </div>

                            <div className="mt-4 flex justify-between">
                                <span className="text-sm text-slate-500">
                                    Points spent
                                </span>

                                <span className="font-bold text-indigo-600">
                                    {reward.points_required} ⭐
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                router.push(`/child-mode/${childId}`)
                            }
                            className="mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                        >
                            Back to My Rewards
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const remainingPoints = Math.max(
        reward.points_required - reward.current_points,
        0,
    );

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
                    <button
                        onClick={() => router.push(`/child-mode/${childId}`)}
                        className="text-xl font-bold text-slate-900"
                    >
                        ⭐ RewardNest
                    </button>

                    <button
                        onClick={() => router.push(`/child-mode/${childId}`)}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        ← Back to My Rewards
                    </button>
                </div>
            </header>

            <section className="mx-auto max-w-2xl p-6 lg:p-8">
                <p className="text-sm font-semibold text-indigo-600">
                    🎉 YOU UNLOCKED A REWARD!
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Ready to claim your reward?
                </h1>

                <p className="mt-2 text-slate-500">
                    Awesome job, {child.name}! Check your reward and ask for it.
                </p>

                <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                            🎁
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {reward.reward_name}
                            </h2>

                            {reward.description && (
                                <p className="mt-1 text-sm text-slate-500">
                                    {reward.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Child
                            </span>

                            <span className="font-semibold text-slate-900">
                                {child.name}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Current points
                            </span>

                            <span className="font-bold text-indigo-600">
                                {reward.current_points} ⭐
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Required points
                            </span>

                            <span className="font-bold text-slate-900">
                                {reward.points_required} ⭐
                            </span>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    Eligibility
                                </span>

                                {reward.eligible ? (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                        Eligible to claim
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                        {remainingPoints} more points needed
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleClaim}
                        disabled={!reward.eligible || reward.pending || claiming}
                        className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {claiming
                            ? "Claiming Reward..."
                            : reward.pending
                                ? "⏳ Reward Already Requested"
                                : reward.eligible
                                    ? "🎉 Yes, I Want This!"
                                    : "Keep Earning Points!"}
                    </button>

                    <button
                        onClick={() => router.push(`/child-mode/${childId}`)}
                        disabled={claiming}
                        className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed"
                    >
                        Maybe Later
                    </button>
                </div>
            </section>
        </main>
    );
}