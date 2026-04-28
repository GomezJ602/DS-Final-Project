package com.fitnesspro.logic;

import com.fitnesspro.model.Exercise;
import java.util.Stack;

/**
 * Manages the history of exercises performed during a workout session.
 * Uses a Stack data structure to enable Last-In-First-Out (LIFO) functionality,
 * specifically for the "Undo" feature.
 *
 * Concepts: Stacks (LIFO)
 * Time Complexity: Push: O(1), Pop: O(1)
 *
 * @author GomezJ602
 */
public class WorkoutHistory {
    private Stack<Exercise> history;

    public WorkoutHistory() {
        this.history = new Stack<>();
    }

    /**
     * Logs a completed exercise to the history stack.
     * Complexity: O(1) - Constant time operation.
     *
     * @param exercise The exercise performed.
     */
    public void logExercise(Exercise exercise) {
        history.push(exercise);
        System.out.println("[LOG] Exercise added: " + exercise.getName());
    }

    /**
     * Removes and returns the most recently logged exercise.
     * This fulfills the requirement for an "Undo" feature.
     * Complexity: O(1) - Constant time operation.
     *
     * @return The most recent Exercise, or null if history is empty.
     */
    public Exercise undoLastExercise() {
        if (history.isEmpty()) {
            System.out.println("[WARN] No exercises to undo.");
            return null;
        }
        Exercise removed = history.pop();
        System.out.println("[UNDO] Removed: " + removed.getName());
        return removed;
    }

    /**
     * Returns a list of all exercises in the history.
     * @return list of exercises (LIFO order).
     */
    public java.util.List<Exercise> getHistoryList() {
        java.util.List<Exercise> list = new java.util.ArrayList<>(history);
        java.util.Collections.reverse(list); // Reverse to show latest first
        return list;
    }

    /**
     * Checks if any exercises have been logged in the current session.
     * @return true if stack is empty.
     */
    public boolean isEmpty() {
        return history.isEmpty();
    }

    /**
     * Returns the size of the workout history.
     * @return current number of exercises in history.
     */
    public int getCount() {
        return history.size();
    }
}
