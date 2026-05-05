package com.fitnesspro.logic;

import com.fitnesspro.model.Exercise;
import java.util.ArrayDeque;
import java.util.Queue;

/**
 * <h2>CircuitManager — Sequential workout circuit (Queue / FIFO)</h2>
 *
 * Models a "workout circuit": a planned sequence of exercises the user wants
 * to perform <i>in order</i>. The first exercise added is the first one
 * served back, which is exactly First-In-First-Out (FIFO) behavior — the
 * defining trait of a {@link Queue}.
 *
 * <h3>Why a {@link Queue} (and specifically {@link ArrayDeque})?</h3>
 * The user's workflow is "queue these moves up, then I'll knock them out one
 * by one." That maps directly onto {@code add()} / {@code poll()}.
 *
 * <p>We use {@link ArrayDeque} as the concrete implementation because it is
 * the modern, performant default for a single-threaded queue (the
 * {@link java.util.LinkedList} alternative carries unnecessary object
 * overhead, and the legacy {@link java.util.Stack}-companion class
 * {@code java.util.Vector}-based queue is also slower). All operations are
 * O(1) amortized.</p>
 *
 * <h3>Wired up to the HTTP server</h3>
 * <ul>
 *   <li>{@code POST /api/circuit/add?name=...} → {@link #addExerciseToCircuit(Exercise)}</li>
 *   <li>{@code POST /api/circuit/next}         → {@link #nextExercise()}</li>
 * </ul>
 *
 * <h3>Time complexity summary</h3>
 * <table>
 *   <tr><th>Operation</th>                  <th>Complexity</th></tr>
 *   <tr><td>{@link #addExerciseToCircuit}</td> <td>O(1) amortized</td></tr>
 *   <tr><td>{@link #nextExercise}</td>         <td>O(1)</td></tr>
 *   <tr><td>{@link #peekNext}</td>             <td>O(1)</td></tr>
 *   <tr><td>{@link #remainingExercises}</td>   <td>O(1)</td></tr>
 * </table>
 *
 * @author GomezJ602
 * @see WorkoutHistory — the LIFO counterpart (stack) used for undo
 */
public class CircuitManager {

    /**
     * Backing queue. Declared as the {@link Queue} interface (not the
     * concrete type) so we can swap to a different queue implementation —
     * e.g. {@link java.util.concurrent.ConcurrentLinkedQueue} for
     * multi-threaded use — without touching any callers.
     */
    private Queue<Exercise> circuitQueue;

    /** Constructs an empty circuit. */
    public CircuitManager() {
        this.circuitQueue = new ArrayDeque<>();
    }

    /**
     * Enqueues an exercise at the <b>back</b> of the circuit. It will be
     * dequeued in turn after every previously-added exercise.
     *
     * <p>Prints a {@code [CIRCUIT]} line to {@code stdout} for visibility
     * in the {@link com.fitnesspro.Main} demo.</p>
     *
     * <p><b>Complexity:</b> O(1) amortized — {@link ArrayDeque#add} only pays
     * the resize cost on rare occasions when the internal array doubles.</p>
     *
     * @param exercise the exercise to append; expected non-null
     */
    public void addExerciseToCircuit(Exercise exercise) {
        circuitQueue.add(exercise);
        System.out.println("[CIRCUIT] Queued: " + exercise.getName());
    }

    /**
     * Pops and returns the <b>front</b> of the circuit — the next exercise
     * the user should perform.
     *
     * <p>If the queue is empty (the circuit has been completed), prints a
     * "Workout complete!" log line and returns {@code null} rather than
     * throwing. The HTTP handler turns that {@code null} into an empty JSON
     * object {@code "{}"} for the client, which the React UI interprets as
     * "no more exercises queued".</p>
     *
     * <p><b>Complexity:</b> O(1).</p>
     *
     * @return the next exercise to perform, or {@code null} if the circuit
     *         is empty
     */
    public Exercise nextExercise() {
        // poll() returns null on an empty queue (vs remove() which throws);
        // null-as-sentinel is what the HTTP layer expects.
        Exercise next = circuitQueue.poll();
        if (next != null) {
            System.out.println("[CIRCUIT] Now performing: " + next.getName());
        } else {
            System.out.println("[CIRCUIT] Workout complete!");
        }
        return next;
    }

    /**
     * Returns the next-up exercise <b>without removing it</b>. Useful for UI
     * that wants to display "up next: X" without consuming the entry.
     *
     * @return the front of the queue, or {@code null} if empty
     */
    public Exercise peekNext() {
        return circuitQueue.peek();
    }

    /**
     * @return the number of exercises still queued (not yet performed). O(1).
     */
    public int remainingExercises() {
        return circuitQueue.size();
    }
}
