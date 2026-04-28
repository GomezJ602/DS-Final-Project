package com.fitnesspro.logic;

import com.fitnesspro.model.Exercise;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Provides utility methods for searching exercises.
 * Specifically implements Binary Search to demonstrate efficient search on sorted data.
 *
 * Concepts: Searching Algorithms (Binary Search)
 * Time Complexity: O(log n)
 *
 * @author GomezJ602
 */
public class SearchUtility {

    /**
     * Performs a Binary Search to find an exercise by name in a sorted list.
     * Binary search is efficient for large datasets but requires the list to be sorted.
     *
     * Complexity: O(log n)
     *
     * @param exerciseList A list of Exercises, MUST be sorted by name.
     * @param targetName   The name of the exercise to search for.
     * @return The Exercise if found, otherwise null.
     */
    public static Exercise binarySearchByName(List<Exercise> exerciseList, String targetName) {
        int low = 0;
        int high = exerciseList.size() - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            Exercise midExercise = exerciseList.get(mid);
            int comparison = midExercise.getName().compareToIgnoreCase(targetName);

            if (comparison == 0) {
                return midExercise; // Found
            } else if (comparison < 0) {
                low = mid + 1; // Target is in the upper half
            } else {
                high = mid - 1; // Target is in the lower half
            }
        }
        return null; // Not found
    }

    /**
     * Helper method to sort a list of exercises by name, as required for binary search.
     * Complexity: O(n log n)
     *
     * @param exerciseList The list to sort.
     */
    public static void sortExercisesByName(List<Exercise> exerciseList) {
        Collections.sort(exerciseList, Comparator.comparing(Exercise::getName));
    }
}
