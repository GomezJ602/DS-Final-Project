package com.fitnesspro.logic;

import com.fitnesspro.model.Exercise;
import java.util.HashMap;
import java.util.Map;

/**
 * A central library for all available exercises in the application.
 * Utilizes a HashMap (Dictionary/Hashing) for high-performance lookup.
 *
 * Concepts: Hashing, Dictionaries/Maps
 * Time Complexity: Search/Lookup: O(1) average case
 *
 * @author GomezJ602
 */
public class ExerciseLibrary {
    private Map<String, Exercise> exerciseMap;

    public ExerciseLibrary() {
        this.exerciseMap = new HashMap<>();
        initializeStandardSet();
    }

    /**
     * Initializes the library with a standard set of exercises.
     */
    private void initializeStandardSet() {
        addExercise(new Exercise("Full Body Blast", "strength", "Intermediate", "45 min", 380, "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBsaWZ0aW5nJTIwd2VpZ2h0c3xlbnwxfHx8fDE3NzQyOTQ2MTV8MA&ixlib=rb-4.1.0&q=80&w=1080", "Build strength across all major muscle groups", "Compound movements focus."));
        addExercise(new Exercise("HIIT Cardio", "cardio", "Advanced", "30 min", 420, "https://images.unsplash.com/photo-1758520706103-41d01f815640?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwY2FyZGlvJTIwZml0bmVzc3xlbnwxfHx8fDE3NzQyMTk1MjB8MA&ixlib=rb-4.1.0&q=80&w=1080", "High-intensity intervals for maximum calorie burn", "30s work, 30s rest."));
        addExercise(new Exercise("Yoga Flow", "flexibility", "Beginner", "40 min", 150, "https://images.unsplash.com/photo-1671581081519-321ab53e0dac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBleGVyY2lzZXxlbnwxfHx8fDE3NzQyNDU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080", "Improve flexibility and reduce stress", "Focus on breathing."));
        addExercise(new Exercise("Upper Body Power", "strength", "Advanced", "50 min", 340, "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjB3b3Jrb3V0JTIwZml0bmVzc3xlbnwxfHx8fDE3NzQyMTgwMzB8MA&ixlib=rb-4.1.0&q=80&w=1080", "Target chest, back, shoulders, and arms", "Heavy weights, low reps."));
        addExercise(new Exercise("Core Strength", "strength", "Intermediate", "25 min", 200, "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBsaWZ0aW5nJTIwd2VpZ2h0c3xlbnwxfHx8fDE3NzQyOTQ2MTV8MA&ixlib=rb-4.1.0&q=80&w=1080", "Strengthen your core and improve stability", "Planks and leg raises."));
        addExercise(new Exercise("Morning Stretch", "flexibility", "Beginner", "20 min", 80, "https://images.unsplash.com/photo-1671581081519-321ab53e0dac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBleGVyY2lzZXxlbnwxfHx8fDE3NzQyNDU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080", "Start your day with gentle stretches", "Hold each pose for 30s."));
    }

    /**
     * Adds a new exercise to the library.
     * Complexity: O(1)
     *
     * @param exercise The Exercise object to store.
     */
    public void addExercise(Exercise exercise) {
        exerciseMap.put(exercise.getName().toLowerCase(), exercise);
    }

    /**
     * Retrieves an exercise by its name.
     * Complexity: O(1) - HashMap lookup is significantly faster than searching a list.
     *
     * @param name Name of the exercise to find.
     * @return The Exercise object, or null if not found.
     */
    public Exercise findExercise(String name) {
        return exerciseMap.get(name.toLowerCase());
    }

    /**
     * Returns a list of all exercises in the library.
     * @return list of exercises.
     */
    public java.util.List<Exercise> getAllExercises() {
        return new java.util.ArrayList<>(exerciseMap.values());
    }

    /**
     * Returns the total number of exercises in the library.
     * @return library size.
     */
    public int size() {
        return exerciseMap.size();
    }
}
