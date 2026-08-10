"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Child,
    createChild,
    deleteChild,
    getChildren,
    updateChild,
} from "@/lib/children";

const AVATARS = ["👦", "👧", "🧒", "👶", "🦸", "🦸‍♀️", "🧑‍🚀", "🧑‍🎨"];

export default function ChildrenPage() {
    const router = useRouter();

    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingChild, setEditingChild] = useState<Child | null>(null);

    const [name, setName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [avatar, setAvatar] = useState("👦");

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
      : "Unable to load children."
  );
} finally {
  setLoading(false);
}


        }

useEffect(() => {
            loadChildren();
        }, []);

        function resetForm() {
            setName("");
            setDateOfBirth("");
            setAvatar("👦");
            setEditingChild(null);
            setShowForm(false);
        }

        function openAddForm() {
            setEditingChild(null);
            setName("");
            setDateOfBirth("");
            setAvatar("👦");
            setShowForm(true);
        }

        function openEditForm(child: Child) {
            setEditingChild(child);
            setName(child.name);
            setDateOfBirth(child.date_of_birth ?? "");
            setAvatar(child.avatar ?? "👦");
            setShowForm(true);
        }

        async function handleSubmit(event: FormEvent<HTMLFormElement>) {
            event.preventDefault();

            
if (!name.trim()) {
  setError("Child name is required.");
  return;
}

try {
  setSaving(true);
  setError("");

  const data = {
    name: name.trim(),
    date_of_birth: dateOfBirth || null,
    avatar,
  };

  if (editingChild) {
    const updated = await updateChild(editingChild.id, data);

    setChildren((current) =>
      current.map((child) =>
        child.id === updated.id ? updated : child
      )
    );
  } else {
    const created = await createChild(data);
    setChildren((current) => [...current, created]);
  }

  resetForm();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to save child."
  );
} finally {
  setSaving(false);
}


        }

        async function handleDelete(child: Child) {
            const confirmed = window.confirm(
                `Are you sure you want to delete ${child.name}?`
            );

            
if (!confirmed) {
  return;
}

try {
  setError("");

  await deleteChild(child.id);

  setChildren((current) =>
    current.filter((item) => item.id !== child.id)
  );
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to delete child."
  );
}


        }

        function calculateAge(dateOfBirth: string | null) {
            if (!dateOfBirth) {
                return null;
            }

            
const birthDate = new Date(dateOfBirth);
const today = new Date();

let age = today.getFullYear() - birthDate.getFullYear();

const monthDifference =
  today.getMonth() - birthDate.getMonth();

if (
  monthDifference < 0 ||
  (monthDifference === 0 &&
    today.getDate() < birthDate.getDate())
) {
  age--;
}

return age;


        }

        return (<main className="min-h-screen bg-slate-50">
            {/* Header */} <header className="border-b border-slate-200 bg-white"> <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2"
                > <span className="text-2xl">⭐</span> <span className="text-xl font-bold text-slate-900">
                        RewardNest </span> </button>

                ```
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-sm font-medium text-slate-600 hover:text-indigo-600"
                >
                    ← Dashboard
                </button>
            </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                {/* Page heading */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-600">
                            Family
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                            Your Children
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Manage your children and their RewardNest profiles.
                        </p>
                    </div>

                    <button
                        onClick={openAddForm}
                        className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        + Add Child
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {/* Add/Edit form */}
                {showForm && (
                    <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingChild ? "Edit Child" : "Add Child"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingChild
                                        ? "Update your child's profile."
                                        : "Create a profile to start tracking habits and rewards."}
                                </p>
                            </div>

                            <button
                                onClick={resetForm}
                                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Child name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Enter child's name"
                                    maxLength={255}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Date of birth
                                </label>

                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(event) =>
                                        setDateOfBirth(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-3 block text-sm font-medium text-slate-700">
                                    Choose avatar
                                </label>

                                <div className="flex flex-wrap gap-3">
                                    {AVATARS.map((item) => (
                                        <button
                                            type="button"
                                            key={item}
                                            onClick={() => setAvatar(item)}
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${avatar === item
                                                    ? "bg-indigo-100 ring-2 ring-indigo-500"
                                                    : "bg-slate-100 hover:bg-slate-200"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingChild
                                            ? "Save Changes"
                                            : "Add Child"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-64 animate-pulse rounded-2xl bg-slate-200"
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && children.length === 0 && !showForm && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
                            👨‍👩‍👧
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            No children added yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Add your first child to start tracking habits,
                            points, and rewards.
                        </p>

                        <button
                            onClick={openAddForm}
                            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Add Child
                        </button>
                    </div>
                )}

                {/* Children */}
                {!loading && children.length > 0 && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {children.map((child) => {
                            const age = calculateAge(child.date_of_birth);

                            return (
                                <div
                                    key={child.id}
                                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-4xl">
                                            {child.avatar || "👦"}
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEditForm(child)}
                                                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(child)}
                                                className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                                        {child.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {age !== null
                                            ? `${age} ${age === 1 ? "year" : "years"} old`
                                            : "Date of birth not added"}
                                    </p>

                                    <div className="mt-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs text-slate-400">
                                                Points
                                            </p>
                                            <p className="mt-1 font-bold text-slate-700">
                                                ⭐ —
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs text-slate-400">
                                                Rewards
                                            </p>
                                            <p className="mt-1 font-bold text-slate-700">
                                                🎁 —
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            router.push(`/children/${child.id}`)
                                        }
                                        className="mt-5 w-full rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                    >
                                        Open Child Dashboard →
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>


);
}
