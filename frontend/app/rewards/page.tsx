"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createReward,
  deleteReward,
  getRewards,
  Reward,
  RewardCreate,
  RewardPeriod,
  updateReward,
} from "@/lib/rewards";

const PERIODS: RewardPeriod[] = [
  "weekly",
  "monthly",
];

const initialFormData: RewardCreate = {
  name: "",
  description: "",
  points_required: 10,
  period: "weekly",
};

export default function RewardsPage() {
  const router = useRouter();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] =
    useState<Reward | null>(null);

  const [formData, setFormData] =
    useState<RewardCreate>(initialFormData);

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      setLoading(true);
      setError("");

      const data = await getRewards();
      setRewards(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load rewards.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingReward(null);
    setFormData(initialFormData);
    setActionError("");
    setShowForm(true);
  }

  function openEditForm(reward: Reward) {
    setEditingReward(reward);

    setFormData({
      name: reward.name,
      description: reward.description ?? "",
      points_required: reward.points_required,
      period: reward.period,
    });

    setActionError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingReward(null);
    setFormData(initialFormData);
    setActionError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setActionError("");

      const payload: RewardCreate = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        points_required: Number(formData.points_required),
      };

      if (!payload.name) {
        throw new Error("Reward name is required.");
      }

      if (payload.points_required <= 0) {
        throw new Error(
          "Points required must be greater than 0.",
        );
      }

      if (editingReward) {
        const updated = await updateReward(
          editingReward.id,
          payload,
        );

        setRewards((current) =>
          current.map((reward) =>
            reward.id === updated.id ? updated : reward,
          ),
        );
      } else {
        const created = await createReward(payload);

        setRewards((current) => [...current, created]);
      }

      closeForm();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to save reward.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(reward: Reward) {
    try {
      setActionError("");

      const updated = await updateReward(reward.id, {
        active: !reward.active,
      });

      setRewards((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update reward.",
      );
    }
  }

  async function handleDelete(reward: Reward) {
    const confirmed = window.confirm(
      `Delete "${reward.name}"?\n\n` +
      "Rewards with redemption history cannot be deleted. " +
      "You can deactivate them instead.",
    );

    if (!confirmed) return;

    try {
      setActionError("");

      await deleteReward(reward.id);

      setRewards((current) =>
        current.filter((item) => item.id !== reward.id),
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to delete reward.",
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-3xl bg-slate-200"
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
            Unable to load rewards
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={loadRewards}
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
            ← Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl p-6 lg:p-8">
        {/* Page heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              PARENT MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Rewards
            </h1>

            <p className="mt-2 text-slate-500">
              Create rewards that your children can earn.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add Reward
          </button>
        </div>

        {actionError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/* Rewards */}
        {rewards.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl">🎁</div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No rewards yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add your first reward to give your children something
              exciting to work towards.
            </p>

            <button
              onClick={openCreateForm}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Create First Reward
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <article
                key={reward.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                    🎁
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      reward.active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {reward.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {reward.name}
                </h2>

                {reward.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {reward.description}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Points required
                    </p>

                    <p className="mt-1 text-lg font-bold text-indigo-600">
                      {reward.points_required} ⭐
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400">
                      Period
                    </p>

                    <p className="mt-1 text-sm font-bold capitalize text-slate-700">
                      {reward.period}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openEditForm(reward)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleActive(reward)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {reward.active ? "Deactivate" : "Activate"}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(reward)}
                  className="mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                  PARENT MANAGEMENT
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {editingReward
                    ? "Edit Reward"
                    : "Create Reward"}
                </h2>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="reward-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Reward name
                </label>

                <input
                  id="reward-name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Ice Cream"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="reward-description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="reward-description"
                  value={formData.description ?? ""}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="What does the child get?"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reward-points"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Points required
                  </label>

                  <input
                    id="reward-points"
                    type="number"
                    min="1"
                    value={formData.points_required}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        points_required: Number(
                          event.target.value,
                        ),
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reward-period"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Reward period
                  </label>

                  <select
                    id="reward-period"
                    value={formData.period}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        period: event.target
                          .value as RewardPeriod,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {PERIODS.map((period) => (
                      <option key={period} value={period}>
                        {period.charAt(0).toUpperCase() +
                          period.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {actionError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingReward
                      ? "Save Changes"
                      : "Create Reward"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}