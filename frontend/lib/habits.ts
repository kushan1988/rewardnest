import { apiFetchAuth } from "./api";

export interface Habit {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface HabitCreate {
    name: string;
    description?: string | null;
}

export interface HabitUpdate {
    name?: string;
    description?: string | null;
}

export async function getHabits(): Promise<Habit[]> {
    return apiFetchAuth<Habit[]>("/habits");
}

export async function createHabit(
    data: HabitCreate,
): Promise<Habit> {
    return apiFetchAuth<Habit>("/habits", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateHabit(
    habitId: string,
    data: HabitUpdate,
): Promise<Habit> {
    return apiFetchAuth<Habit>(
        `/habits/${habitId}`,
        {
            method: "PUT",
            body: JSON.stringify(data),
        },
    );
}

export async function deleteHabit(
    habitId: string,
): Promise<void> {
    await apiFetchAuth<void>(`/habits/${habitId}`, {
        method: "DELETE",
    });
}

export interface ChildHabit {
    id: string;
    child_id: string;
    habit_id: string;
    points: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ChildHabitCreate {
    child_id: string;
    points: number;
}

export async function assignHabit(
    habitId: string,
    data: ChildHabitCreate,
): Promise<ChildHabit> {
    return apiFetchAuth<ChildHabit>(
        `/habits/${habitId}/assign`,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );
}

export async function getChildHabits(
    childId: string,
): Promise<ChildHabit[]> {
    return apiFetchAuth<ChildHabit[]>(
        `/habits/children/${childId}`,
    );
}

export async function deactivateChildHabit(
    childHabitId: string,
): Promise<void> {
    await apiFetchAuth<void>(
        `/habits/assignments/${childHabitId}/deactivate`,
        {
            method: "PATCH",
        },
    );
}