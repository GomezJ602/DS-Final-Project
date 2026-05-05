package com.fitnesspro.logic;

import com.fitnesspro.model.Exercise;
import java.util.Stack;

/**
 * <h2>WorkoutHistory — Logged exercises with LIFO undo (Stack)</h2>
 *
 * Tracks every {@link Exercise} the user has logged during the current session
 * <i>in the order they were logged</i>, and supports an "undo last" operation
 * that pops the most recent entry. This is the textbook use case for a
 * <b>Stack</b>: Last-In-First-Out (LIFO) — exactly what an "undo" feature needs.
 *
 * <h3>Why a {@link Stack} (not just an {@code ArrayList})?</h3>
 * An {@link java.util.ArrayList} could technically work — both
 * {@code add(end)} and {@code remove(end)} are amortized O(1) — but using
 * {@link Stack} is intentional here for two reasons:
 * <ol>
 *   <li><b>Self-documenting code.</b> A reader sees {@code Stack} and
 *       immediately understands the access pattern (push / pop / peek).
 *       That clarity is worth more than the marginal performance trade-offs
 *       between {@link Stack} and {@link java.util.ArrayDeque}.</li>
 *   <li><b>Coursework alignment.</b> The Data Structures syllabus calls for
 *       the canonical {@code java.util.Stack} class.</li>
 * </ol>
 *
 * <h3>Wired up to the HTTP server</h3>
 * <ul>
 *   <li>{@code POST /api/workout/log?name=...} → {@link #logExercise(Exercise)}</li>
 *   <li>{@code POST /api/workout/undo}         → {@link #undoLastExercise()}</li>
 *   <li>{@code GET  /api/workout/history}      → {@link #getHistoryList()}</li>
 *   <li>{@code GET  /api/stats}                → derives totals from
 *       {@link #getHistoryList()} (calorie sum, workout count)</li>
 * </ul>
 *
 * <h3>Time complexity summary</h3>
 * <table>
 *   <tr><th>Operation</th>             <th>Complexity</th></tr>
 *   <tr><td>{@link #logExercise}</td>      <td>O(1) — Stack push</td></tr>
 *   <tr><td>{@link #undoLastExercise}</td> <td>O(1) — Stack pop</td></tr>
 *   <tr><td>{@link #getHistoryList}</td>   <td>O(n) — copies + reverses</td></tr>
 *   <tr><td>{@link #isEmpty}, {@link #getCount}</td> <td>O(1)</td></tr>
 * </table>
 *
 * @author GomezJ602
 * @see CircuitManager — the FIFO counterpart (queue) used for circuits
 */
public class WorkoutHistory {

    /**
     * The backing stack. Top of the stack = most recent exercise (the next
     * candidate for "undo"). Bottom of the stack = first exercise of this
     * session.
     */
    private Stack<Exercise> history;

    /** Constructs an empty history. */
    public WorkoutHistory() {
        this.history = new Stack<>();
    }

    /**
     * Pushes a completed exercise onto the top of the stack.
     *
     * <p>Also prints a {@code [LOG]} line to {@code stdout} so the operation
     * is visible when running the {@link com.fitnesspro.Main} demo.</p>
     *
     * <p><b>Complexity:</b> O(1) — {@link Stack#push} is a simple pointer
     * append on the underlying {@link java.util.Vector}.</p>
     *
     * @param exercise the exercise the user just performed; expected non-null
     *                 (the {@code /api/workout/log} endpoint validates this
     *                 before calling)
     */
    public void logExercise(Exercise exercise) {
        history.push(exercise);
        System.out.println("[LOG] Exercise added: " + exercise.getName());
    }

    /**
     * Pops the most recent exercise off the stack — the "undo" operation.
     *
     * <p>This is the entire reason {@code WorkoutHistory} uses a stack
     * instead of a list: LIFO order naturally matches the user-facing concept
     * of "undo the last thing I did".</p>
     *
     * <p>Empty-stack handling: instead of throwing {@link java.util.EmptyStackException}
     * (which would surface as a 500 error in the HTTP layer), we print a
     * {@code [WARN]} line and return {@code null}. The HTTP handler then
     * returns {@code "{}"} to the client, which the React UI treats as a
     * no-op.</p>
     *
     * <p><b>Complexity:</b> O(1).</p>
     *
     * @return the popped exercise, or {@code null} if the history was empty
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
     * Returns a snapshot of the history with the <b>most recent entry first</b>.
     *
     * <p>{@link Stack} stores the most recent entry at the highest index.
     * For UI display we want the newest workout to appear at the top, so this
     * method (a) copies the stack into an {@link java.util.ArrayList} and
     * (b) reverses it. This produces a true snapshot — mutating the returned
     * list does not affect the stack.</p>
     *
     * <p><b>Complexity:</b> O(n) — one copy pass plus one reverse pass.</p>
     *
     * @return a list of exercises ordered newest → oldest
     */
    public java.util.List<Exercise> getHistoryList() {
        // ArrayList(Collection) copies in iteration order — which for Stack
        // is bottom→top (oldest→newest). Reverse so the UI sees newest first.
        java.util.List<Exercise> list = new java.util.ArrayList<>(history);
        java.util.Collections.reverse(list);
        return list;
    }

    /**
     * @return {@code true} if no exercises have been logged this session;
     *         {@code false} otherwise. O(1).
     */
    public boolean isEmpty() {
        return history.isEmpty();
    }

    /**
     * @return the number of exercises currently on the stack. O(1).
     */
    public int getCount() {
        return history.size();
    }
}
