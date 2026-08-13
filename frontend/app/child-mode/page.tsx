"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getChildren, Child } from "@/lib/children";

export default function ChildModePage() {
  const router = useRouter();

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadChildren() {
      try {
        setLoading(true);
        setError("");

        const data = await getChildren();
        setChildren(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load children.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadChildren();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-3xl">
          <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-3xl bg-slate-200"
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
            Unable to enter Child Mode
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

  if (children.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-5xl">👨‍👩‍👧</div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            No children added yet
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add a child before entering Child Mode.
          </p>

          <button
            onClick={() => router.push("/children")}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Add Child
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
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
            ← Exit Child Mode
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10 lg:py-16">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-4xl">
            👋
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-wider text-indigo-600">
            Welcome to Child Mode
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Who&apos;s using RewardNest today?
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Choose your profile to see your points, progress, and rewards.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => router.push(`/child-mode/${child.id}`)}
              className="group rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-5xl transition group-hover:scale-110">
                {child.avatar || "🧒"}
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                {child.name}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Tap to open your profile
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600">
                Let&apos;s go <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}