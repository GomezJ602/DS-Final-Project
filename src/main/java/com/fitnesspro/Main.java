package com.fitnesspro;

import com.fitnesspro.logic.CircuitManager;
import com.fitnesspro.logic.ExerciseLibrary;
import com.fitnesspro.logic.SearchUtility;
import com.fitnesspro.logic.WorkoutHistory;
import com.fitnesspro.model.Exercise;
import java.util.ArrayList;
import java.util.List;

/**
 * <h2>Main — Standalone Demonstration Driver</h2>
 *
 * This class is the project's <b>academic</b> entry point. It exists so that
 * a grader can run a single command and see every required data structure
 * exercised on the console — independently of the React frontend or the HTTP
 * server.
 *
 * <h3>What it demonstrates (in order)</h3>
 * <ol>
 *   <li><b>HashMap O(1) lookup</b> — via {@link ExerciseLibrary#findExercise(String)}</li>
 *   <li><b>Stack LIFO push / pop</b> — via {@link WorkoutHistory} (the "undo" feature)</li>
 *   <li><b>Queue FIFO add / poll</b> — via {@link CircuitManager} (a workout circuit)</li>
 *   <li><b>Binary search O(log n)</b> — via {@link SearchUtility#binarySearchByName(List, String)}</li>
 * </ol>
 *
 * <h3>How to run</h3>
 * <pre>
 *   javac -d out -sourcepath src/main/java src/main/java/com/fitnesspro/Main.java
 *   java -cp out com.fitnesspro.Main
 * </pre>
 *
 * <p>Output goes to {@code stdout}; the {@code [LOG]}, {@code [UNDO]}, and
 * {@code [CIRCUIT]} prefixes come from the data-structure classes themselves
 * and make it easy to follow which structure is acting at each step.</p>
 *
 * <p><b>Note:</b> this is a different entry point from
 * {@link com.fitnesspro.api.BackendServer}. {@code Main} only prints to the
 * console and exits; {@code BackendServer} stays alive serving HTTP traffic.
 * The README documents both.</p>
 *
 * @author GomezJ602
 */
public class Main {

    /**
     * Console demonstration entry point. Walks through one operation per
     * data structure, printing a short banner before each so the output is
     * easy to read.
     *
     * @param args ignored (no CLI flags are read)
     */
    public static void main(String[] args) {
        System.out.println("=== FitnessPro Java Logic Demonstration ===\n");

        // ──────────────────────────────────────────────────────────────────
        // 1. HASHMAP — Library initialization + O(1) lookup
        // ──────────────────────────────────────────────────────────────────
        // The library constructor seeds itself with ~80 default exercises so
        // we don't have to populate it inline here. After this line, every
        // findExercise() call below is an O(1) HashMap.get().
        ExerciseLibrary library = new ExerciseLibrary();
        System.out.println("Library initialized with " + library.size() + " exercises.");

        System.out.println("\n--- Feature: Exercise Lookup (Hashing) ---");
        // We deliberately query "Squat" rather than the canonical
        // "Bodyweight Squats" to demonstrate that lookup is case-insensitive
        // — but ALSO that it is exact-name-only (substrings won't match here,
        // which is why a separate /api/search endpoint exists for fuzzy
        // matching against the frontend search bar).
        Exercise found = library.findExercise("Squat");
        if (found != null) {
            System.out.println("Found: " + found.getInstructions());
        }

        // ──────────────────────────────────────────────────────────────────
        // 2. STACK — Workout history with LIFO "undo"
        // ──────────────────────────────────────────────────────────────────
        System.out.println("\n--- Feature: Workout Logging (Stack) ---");
        WorkoutHistory history = new WorkoutHistory();
        // Push two exercises onto the stack. Order matters: "Plank" is the
        // most-recent, so the next pop will remove it (not "Push-up").
        history.logExercise(library.findExercise("Push-up"));
        history.logExercise(library.findExercise("Plank"));
        System.out.println("Current history count: " + history.getCount());

        // Pop the top of the stack — should remove "Plank" (the LIFO winner).
        history.undoLastExercise();
        System.out.println("History count after undo: " + history.getCount());

        // ──────────────────────────────────────────────────────────────────
        // 3. QUEUE — Sequential workout circuit, FIFO order
        // ──────────────────────────────────────────────────────────────────
        System.out.println("\n--- Feature: Workout Circuit (Queue) ---");
        CircuitManager circuit = new CircuitManager();
        // Enqueue three exercises in the order the user wants to perform them.
        // FIFO means "Bench Press" is performed first, "Deadlift" last.
        circuit.addExerciseToCircuit(library.findExercise("Bench Press"));
        circuit.addExerciseToCircuit(library.findExercise("Pull-up"));
        circuit.addExerciseToCircuit(library.findExercise("Deadlift"));

        System.out.println("Remaining in circuit: " + circuit.remainingExercises());
        // Two nextExercise() calls dequeue "Bench Press" then "Pull-up",
        // leaving only "Deadlift" in the queue.
        circuit.nextExercise();
        circuit.nextExercise();
        System.out.println("Remaining in circuit: " + circuit.remainingExercises());

        // ──────────────────────────────────────────────────────────────────
        // 4. BINARY SEARCH — O(log n) search on sorted data
        // ──────────────────────────────────────────────────────────────────
        // Binary search has a precondition: the input list MUST be sorted.
        // We build a small list, sort it, then search — making the order of
        // operations explicit so a reader sees the precondition being met.
        System.out.println("\n--- Feature: Advanced Search (Binary Search) ---");
        List<Exercise> searchList = new ArrayList<>();
        searchList.add(library.findExercise("Push-up"));
        searchList.add(library.findExercise("Squat"));
        searchList.add(library.findExercise("Bench Press"));
        searchList.add(library.findExercise("Plank"));

        // Step 4a: sort by name (O(n log n)) — required precondition.
        SearchUtility.sortExercisesByName(searchList);
        // Step 4b: binary search for "Plank" (O(log n)).
        Exercise searchResult = SearchUtility.binarySearchByName(searchList, "Plank");
        System.out.println("Binary Search Result: "
            + (searchResult != null ? "Found " + searchResult.getName() : "Not Found"));

        // ──────────────────────────────────────────────────────────────────
        // 5. NEXT STEP — pointer to the HTTP server entry point
        // ──────────────────────────────────────────────────────────────────
        System.out.println("\n--- API Server ---");
        System.out.println("To start the web backend, run: com.fitnesspro.api.BackendServer");

        System.out.println("\n=== Demonstration Complete ===");
    }
}
