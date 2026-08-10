"use client";

import { FormEvent, useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        email,
        full_name: fullName,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center">
          <section>
            <div className="mb-6 inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-2xl shadow-sm">
                ⭐
              </div>

              <span className="text-2xl font-bold tracking-tight text-slate-900">
                RewardNest
              </span>
            </div>

            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Build good habits.
              <span className="block text-indigo-600">
                Earn rewards.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              RewardNest helps parents encourage positive habits by turning
              everyday achievements into points and meaningful rewards.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                ⭐ Earn points
              </div>

              <div className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                🎯 Build habits
              </div>

              <div className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                🎁 Unlock rewards
              </div>
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome to RewardNest
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Enter your details to continue.
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Ankush Sharma"
                    required
                    minLength={1}
                    maxLength={255}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Continue"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-400">
                Your account is created automatically if it doesn't exist.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}