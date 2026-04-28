package com.fitnesspro;

import com.fitnesspro.logic.CircuitManager;
import com.fitnesspro.logic.ExerciseLibrary;
import com.fitnesspro.logic.SearchUtility;
import com.fitnesspro.logic.WorkoutHistory;
import com.fitnesspro.model.Exercise;
import java.util.ArrayList;
import java.util.List;

/**
 * Main application class to demonstrate the integration of Java Data Structures.
 * This class simulates user interactions with the FitnessPro app features.
 *
 * @author GomezJ602
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== FitnessPro Java Logic Demonstration ===\n");

        // 1. Initialize Library (HashMap)
        ExerciseLibrary library = new ExerciseLibrary();
        System.out.println("Library initialized with " + library.size() + " exercises.");

        // 2. Demonstrate Hashing Lookup (O(1))
        System.out.println("\n--- Feature: Exercise Lookup (Hashing) ---");
        Exercise found = library.findExercise("Squat");
        if (found != null) {
            System.out.println("Found: " + found.getInstructions());
        }

        // 3. Demonstrate Workout History (Stack)
        System.out.println("\n--- Feature: Workout Logging (Stack) ---");
        WorkoutHistory history = new WorkoutHistory();
        history.logExercise(library.findExercise("Push-up"));
        history.logExercise(library.findExercise("Plank"));
        System.out.println("Current history count: " + history.getCount());
        history.undoLastExercise(); // Demonstrate Undo
        System.out.println("History count after undo: " + history.getCount());

        // 4. Demonstrate Circuit Management (Queue)
        System.out.println("\n--- Feature: Workout Circuit (Queue) ---");
        CircuitManager circuit = new CircuitManager();
        circuit.addExerciseToCircuit(library.findExercise("Bench Press"));
        circuit.addExerciseToCircuit(library.findExercise("Pull-up"));
        circuit.addExerciseToCircuit(library.findExercise("Deadlift"));

        System.out.println("Remaining in circuit: " + circuit.remainingExercises());
        circuit.nextExercise();
        circuit.nextExercise();
        System.out.println("Remaining in circuit: " + circuit.remainingExercises());

        // 5. Demonstrate Binary Search (Algorithms)
        System.out.println("\n--- Feature: Advanced Search (Binary Search) ---");
        // Creating a temporary list to demonstrate sorting and searching
        List<Exercise> searchList = new ArrayList<>();
        searchList.add(library.findExercise("Push-up"));
        searchList.add(library.findExercise("Squat"));
        searchList.add(library.findExercise("Bench Press"));
        searchList.add(library.findExercise("Plank"));

        SearchUtility.sortExercisesByName(searchList); // Binary search requires sorting
        Exercise searchResult = SearchUtility.binarySearchByName(searchList, "Plank");
        System.out.println("Binary Search Result: " + (searchResult != null ? "Found " + searchResult.getName() : "Not Found"));

        System.out.println("\n--- API Server ---");
        System.out.println("To start the web backend, run: com.fitnesspro.api.BackendServer");

        System.out.println("\n=== Demonstration Complete ===");
    }
}
