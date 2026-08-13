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

export default function ChildDetailPage() {
    const router = useRouter();
    const params = useParams();

    const childId = params.childId as string;

    const [child, setChild] = useState<Child | null>(null);
    const [score, setScore] = useState<ScoreSummary | null>(null);
    const [rewards, setRewards] = useState<RewardEligibility[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadChildData() {
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
                        : "Unable to load child details."
                );
            } finally {
                setLoading(false);
            }
        }

        if (childId) {
            loadChildData();
        }
    }, [childId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-32 animate-pulse rounded-2xl bg-slate-200"
                            />
                        ))}
                    </div>

                    <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                </div>
            </main>
        );
    }

    if (error || !child || !score) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-3xl">
                    <button
                        onClick={() => router.back()}
                        className="mb-6 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        ← Back
                    </button>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <h2 className="font-semibold text-red-700">
                            Unable to load child
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error || "Child information could not be loaded."}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-xl font-bold text-slate-900"
                    >
                        ⭐ RewardNest
                    </button>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        ← Dashboard
                    </button>
                </div>
            </header>

            <section className="mx-auto max-w-7xl p-6 lg:p-8">
                {/* Child header */}
                <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
                            {child.avatar || "👦"}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-indigo-600">
                                Child Profile
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                {child.name}
                            </h1>

                            {child.date_of_birth && (
                                <p className="mt-1 text-sm text-slate-500">
                                    Date of birth:{" "}
                                    {new Date(
                                        child.date_of_birth
                                    ).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Score summary */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">
                            Points Summary
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Track {child.name}'s progress.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <ScoreCard
                            label="Today"
                            value={score.today}
                            icon="⭐"
                        />

                        <ScoreCard
                            label="This Week"
                            value={score.week}
                            icon="📅"
                            subtitle={`${score.week_completions} completions`}
                        />

                        <ScoreCard
                            label="This Month"
                            value={score.month}
                            icon="📊"
                            subtitle={`${score.month_completions} completions`}
                        />

                        <ScoreCard
                            label="Total Points"
                            value={score.total}
                            icon="🏆"
                            subtitle={`${score.today_completions} today`}
                        />
                    </div>
                </section>

                {/* Rewards */}
                <section className="mt-10">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            Rewards
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Rewards {child.name} can unlock with earned points.
                        </p>
                    </div>

                    {rewards.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <div className="text-4xl">🎁</div>

                            <h3 className="mt-4 font-semibold text-slate-900">
                                No rewards available
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Create a reward to motivate {child.name}.
                            </p>

                            <button
                                onClick={() => router.push("/rewards")}
                                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Manage Rewards
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {rewards.map((reward) => (
                                <div
                                    key={reward.reward_id}
                                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                                            🎁
                                        </div>

                                        {reward.eligible ? (
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                Eligible
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

                                    <div className="mt-5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">
                                                Required
                                            </span>

                                            <span className="font-bold text-slate-800">
                                                {reward.points_required} ⭐
                                            </span>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between text-sm">
                                            <span className="text-slate-500">
                                                Current points
                                            </span>

                                            <span className="font-bold text-indigo-600">
                                                {reward.current_points} ⭐
                                            </span>
                                        </div>
                                    </div>
                                    {/* Commented out the claim button for now, as it may require additional handling for the claim process. */}
                                    {/* {reward.eligible && (
                                        <button
                                            onClick={() => {
                                                router.push(
                                                    `/rewards/claim?childId=${child.id}&rewardId=${reward.reward_id}`
                                                );
                                            }}
                                            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                                        >
                                            Claim Reward
                                        </button>
                                    )} */}

                                    {reward.pending ? (
                                        <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-center text-xs font-medium text-amber-700">
                                            ⏳ Reward requested — awaiting your review
                                        </div>
                                    ) : !reward.eligible ? (
                                        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
                                            Earn{" "}
                                            {Math.max(
                                                reward.points_required - reward.current_points,
                                                0,
                                            )}{" "}
                                            more points
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}

function ScoreCard({
    label,
    value,
    icon,
    subtitle,
}: {
    label: string;
    value: number;
    icon: string;
    subtitle?: string;
}) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                    {label}
                </span>

                <span className="text-xl">{icon}</span>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value}
            </p>

            <p className="mt-1 text-xs text-slate-400">
                {subtitle || "points"}
            </p>
        </div>
    );
}