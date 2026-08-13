"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getChild, Child } from "@/lib/children";
import {
    getScoreSummary,
    getRewardEligibility,
    ScoreSummary,
    RewardEligibility,
} from "@/lib/scores";

export default function ChildModeDashboardPage() {
    const router = useRouter();
    const params = useParams();

    const childId = params.childId as string;

    const [child, setChild] = useState<Child | null>(null);
    const [score, setScore] = useState<ScoreSummary | null>(null);
    const [rewards, setRewards] = useState<RewardEligibility[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError("");

                const [childData, scoreData, rewardData] =
                    await Promise.all([
                        getChild(childId),
                        getScoreSummary(childId),
                        getRewardEligibility(childId),
                    ]);

                setChild(childData);
                setScore(scoreData);
                setRewards(rewardData);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load your profile.",
                );
            } finally {
                setLoading(false);
            }
        }

        if (childId) {
            loadData();
        }
    }, [childId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="h-16 w-72 animate-pulse rounded-2xl bg-slate-200" />

                    <div className="grid gap-5 sm:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-36 animate-pulse rounded-3xl bg-slate-200"
                            />
                        ))}
                    </div>

                    <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
                </div>
            </main>
        );
    }

    if (error || !child || !score) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-red-200">
                    <div className="text-5xl">⚠️</div>

                    <h1 className="mt-5 text-2xl font-bold text-slate-900">
                        Oops! Something went wrong
                    </h1>

                    <p className="mt-2 text-sm text-red-600">
                        {error || "Your profile could not be loaded."}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Try Again
                    </button>

                    <button
                        onClick={() => router.push("/child-mode")}
                        className="mt-3 block w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        Choose Another Profile
                    </button>
                </div>
            </main>
        );
    }

    const eligibleRewards = rewards.filter((reward) => reward.eligible);
    const lockedRewards = rewards.filter((reward) => !reward.eligible);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                    <button
                        onClick={() => router.push("/child-mode")}
                        className="text-xl font-bold text-slate-900"
                    >
                        ⭐ RewardNest
                    </button>

                    <button
                        onClick={() => router.push("/child-mode")}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        ← Switch Profile
                    </button>
                </div>
            </header>

            <section className="mx-auto max-w-5xl p-6 lg:p-8">
                {/* Welcome */}
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-indigo-50 text-5xl">
                            {child.avatar || "🧒"}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-indigo-600">
                                YOUR REWARDNEST
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                Hi, {child.name}! 👋
                            </h1>

                            <p className="mt-2 text-slate-500">
                                Keep up the great work and earn more rewards!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Points */}
                <section className="mt-8">
                    <h2 className="text-xl font-bold text-slate-900">
                        Your Points
                    </h2>

                    <div className="mt-4 grid gap-5 sm:grid-cols-3">
                        <PointCard
                            label="Today"
                            value={score.today}
                            icon="⭐"
                        />

                        <PointCard
                            label="This Week"
                            value={score.week}
                            icon="📅"
                        />

                        <PointCard
                            label="All Time"
                            value={score.total}
                            icon="🏆"
                        />
                    </div>
                </section>

                {/* Rewards */}
                <section className="mt-10">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Your Rewards
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Keep earning points to unlock exciting rewards!
                            </p>
                        </div>

                        {eligibleRewards.length > 0 && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                🎉 {eligibleRewards.length} ready!
                            </span>
                        )}
                    </div>

                    {rewards.length === 0 ? (
                        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <div className="text-5xl">🎁</div>

                            <h3 className="mt-4 text-lg font-bold text-slate-900">
                                No rewards yet
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Ask your parent to add some exciting rewards!
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {rewards.map((reward) => {
                                const remainingPoints = Math.max(
                                    reward.points_required - reward.current_points,
                                    0,
                                );

                                return (
                                    <div
                                        key={reward.reward_id}
                                        className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                                                🎁
                                            </div>

                                            {reward.pending ? (
                                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                                    ⏳ Requested
                                                </span>
                                            ) : reward.eligible ? (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                                    Ready!
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                                    Locked
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                                            {reward.reward_name}
                                        </h3>

                                        {reward.description && (
                                            <p className="mt-1 text-sm text-slate-500">
                                                {reward.description}
                                            </p>
                                        )}

                                        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">
                                                    Your points
                                                </span>

                                                <span className="font-bold text-indigo-600">
                                                    {reward.current_points} ⭐
                                                </span>
                                            </div>

                                            <div className="mt-2 flex justify-between text-sm">
                                                <span className="text-slate-500">
                                                    Needed
                                                </span>

                                                <span className="font-bold text-slate-800">
                                                    {reward.points_required} ⭐
                                                </span>
                                            </div>
                                        </div>

                                        {reward.pending ? (
                                            <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700">
                                                ⏳ Waiting for your parent to review
                                            </div>
                                        ) : reward.eligible ? (
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/rewards/claim?childId=${child.id}&rewardId=${reward.reward_id}`,
                                                    )
                                                }
                                                className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                                            >
                                                🎉 Claim Reward
                                            </button>
                                        ) : (
                                            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-500">
                                                {remainingPoints} more points to go ⭐
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Motivation */}
                {lockedRewards.length > 0 && (
                    <div className="mt-10 rounded-3xl bg-indigo-600 p-6 text-center text-white">
                        <div className="text-4xl">💪</div>

                        <h2 className="mt-3 text-xl font-bold">
                            Keep going, {child.name}!
                        </h2>

                        <p className="mt-2 text-sm text-indigo-100">
                            Complete your habits and earn points to unlock more rewards.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

function PointCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: string;
}) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                    {label}
                </span>

                <span className="text-2xl">{icon}</span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
                {value}
            </p>

            <p className="mt-1 text-xs text-slate-400">
                points earned
            </p>
        </div>
    );
}