package com.fitnesspro.logic;

import com.fitnesspro.model.Exercise;
import java.util.ArrayDeque;
import java.util.Queue;

/**
 * Manages a circuit-style workout where exercises are performed in a sequence.
 * Uses a Queue data structure to ensure First-In-First-Out (FIFO) processing.
 *
 * Concepts: Queues (FIFO)
 * Time Complexity: Enqueue: O(1), Dequeue: O(1)
 *
 * @author GomezJ602
 */
public class CircuitManager {
    private Queue<Exercise> circuitQueue;

    public CircuitManager() {
        this.circuitQueue = new ArrayDeque<>();
    }

    /**
     * Adds an exercise to the end of the circuit.
     * Complexity: O(1)
     *
     * @param exercise The next exercise to add.
     */
    public void addExerciseToCircuit(Exercise exercise) {
        circuitQueue.add(exercise);
        System.out.println("[CIRCUIT] Queued: " + exercise.getName());
    }

    /**
     * Starts or proceeds to the next exercise in the circuit.
     * Complexity: O(1)
     *
     * @return The next Exercise to perform, or null if circuit is complete.
     */
    public Exercise nextExercise() {
        Exercise next = circuitQueue.poll();
        if (next != null) {
            System.out.println("[CIRCUIT] Now performing: " + next.getName());
        } else {
            System.out.println("[CIRCUIT] Workout complete!");
        }
        return next;
    }

    /**
     * Views the next exercise without removing it from the queue.
     * @return next exercise in line.
     */
    public Exercise peekNext() {
        return circuitQueue.peek();
    }

    /**
     * Gets the number of exercises remaining in the circuit.
     * @return count of exercises.
     */
    public int remainingExercises() {
        return circuitQueue.size();
    }
}
