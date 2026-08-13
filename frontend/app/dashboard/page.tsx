"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, logout, User } from "@/lib/auth";
import { getChildren, Child } from "@/lib/children";
import {
  getScoreSummary,
  getRewardEligibility,
  ScoreSummary,
} from "@/lib/scores";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [scoreSummaries, setScoreSummaries] = useState<
    Record<string, ScoreSummary>
  >({});
  const [eligibleRewards, setEligibleRewards] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      router.replace("/");
      return;
    }

    setUser(storedUser);

    async function loadChildren() {
      try {
        const data = await getChildren();

        setChildren(data);

        const summaries: Record<string, ScoreSummary> = {};
        const rewards: Record<string, number> = {};

        await Promise.all(
          data.map(async (child) => {
            const [summary, eligibility] = await Promise.all([
              getScoreSummary(child.id),
              getRewardEligibility(child.id),
            ]);

            summaries[child.id] = summary;

            rewards[child.id] = eligibility.filter(
              (reward) => reward.eligible,
            ).length;
          }),
        );

        setScoreSummaries(summaries);
        setEligibleRewards(rewards);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadChildren();
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg">
              ⭐
            </div>

            <span className="text-xl font-bold text-slate-900">
              RewardNest
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:block">
              {user.full_name}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
          <nav className="sticky top-0 space-y-1 p-4">
            <button className="w-full rounded-xl bg-indigo-50 px-4 py-3 text-left text-sm font-semibold text-indigo-700">
              🏠 Dashboard
            </button>

            <button
              onClick={() => router.push("/child-mode")}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              🧒 Child Mode
            </button>

            <button
              onClick={() => router.push("/children")}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              👨‍👩‍👧 Children
            </button>

            <button
              onClick={() => router.push("/habits")}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              🎯 Habits
            </button>

            <button
              onClick={() => router.push("/rewards")}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              🎁 Rewards
            </button>

            <button
              onClick={() => router.push("/redemptions")}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              📋 Redemptions
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <section className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-indigo-600">
              Parent Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Good to see you, {user.full_name?.split(" ")[0]} 👋
            </h1>

            <p className="mt-2 text-slate-500">
              Here's what's happening with your children.
            </p>
            <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-indigo-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-100">
                  Time for your child?
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Switch to Child Mode
                </h2>

                <p className="mt-2 max-w-xl text-sm text-indigo-100">
                  Let your child view their progress, explore rewards, and claim
                  rewards they have earned.
                </p>
              </div>

              <button
                onClick={() => router.push("/child-mode")}
                disabled={loading || children.length === 0}
                className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🧒 Enter Child Mode
              </button>
            </div>
          </div>

          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="font-medium text-red-700">
                Unable to load children
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && children.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                👨‍👩‍👧
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Add your first child
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Add a child to start tracking habits, earning points,
                and unlocking rewards.
              </p>

              <button
                onClick={() => router.push("/children")}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Add Child
              </button>
            </div>
          )}

          {!loading && !error && children.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Your Children
                </h2>

                <button
                  onClick={() => router.push("/children")}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Manage children →
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() =>
                      router.push(`/children/${child.id}`)
                    }
                    className="group rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                        {child.avatar || "👦"}
                      </div>

                      <span className="text-slate-300 transition group-hover:text-indigo-500">
                        →
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-slate-900">
                      {child.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      View habits, score & rewards
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          This week
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                          ⭐ {scoreSummaries[child.id]?.week ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          This month
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                          📅 {scoreSummaries[child.id]?.month ?? 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Rewards
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                          🎁 {eligibleRewards[child.id] ?? 0}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}