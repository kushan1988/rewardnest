"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createHabit,
  deleteHabit,
  getHabits,
  Habit,
  HabitCreate,
  updateHabit,
} from "@/lib/habits";

const initialFormData: HabitCreate = {
  name: "",
  description: "",
};

export default function HabitsPage() {
  const router = useRouter();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] =
    useState<Habit | null>(null);

  const [formData, setFormData] =
    useState<HabitCreate>(initialFormData);

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    try {
      setLoading(true);
      setError("");

      const data = await getHabits();
      setHabits(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load habits.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingHabit(null);
    setFormData(initialFormData);
    setActionError("");
    setShowForm(true);
  }

  function openEditForm(habit: Habit) {
    setEditingHabit(habit);

    setFormData({
      name: habit.name,
      description: habit.description ?? "",
    });

    setActionError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingHabit(null);
    setFormData(initialFormData);
    setActionError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
    };

    if (!payload.name) {
      setActionError("Habit name is required.");
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      if (editingHabit) {
        const updated = await updateHabit(
          editingHabit.id,
          payload,
        );

        setHabits((current) =>
          current.map((habit) =>
            habit.id === updated.id ? updated : habit,
          ),
        );
      } else {
        const created = await createHabit(payload);

        setHabits((current) => [...current, created]);
      }

      closeForm();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to save habit.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(habit: Habit) {
    const confirmed = window.confirm(
      `Delete "${habit.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setActionError("");

      await deleteHabit(habit.id);

      setHabits((current) =>
        current.filter((item) => item.id !== habit.id),
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to delete habit.",
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
            Unable to load habits
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={loadHabits}
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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              PARENT MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Habits
            </h1>

            <p className="mt-2 text-slate-500">
              Create reusable habits and assign them to your children.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add Habit
          </button>
        </div>

        {actionError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {habits.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl">✨</div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No habits yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create your first habit, then assign it to a child.
            </p>

            <button
              onClick={openCreateForm}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Create First Habit
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <article
                key={habit.id}
                className="flex min-h-56 flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                  ✨
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {habit.name}
                </h2>

                <p className="mt-2 flex-1 text-sm text-slate-500">
                  {habit.description || "No description provided."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openEditForm(habit)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(habit)}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
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
                  {editingHabit ? "Edit Habit" : "Create Habit"}
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
                  htmlFor="habit-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Habit name
                </label>

                <input
                  id="habit-name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Finish homework"
                  maxLength={255}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="habit-description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                  <span className="ml-1 text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="habit-description"
                  value={formData.description ?? ""}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe the habit..."
                  rows={4}
                  maxLength={500}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
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
                    : editingHabit
                      ? "Save Changes"
                      : "Create Habit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}