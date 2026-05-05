package com.fitnesspro.logic;

import com.fitnesspro.model.Exercise;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * <h2>SearchUtility — Binary search over an exercise list</h2>
 *
 * Provides a textbook iterative <b>binary search</b> implementation for
 * finding an {@link Exercise} by name in a <i>sorted</i> list, plus the
 * companion sort method that establishes the precondition.
 *
 * <h3>Why binary search when {@link ExerciseLibrary} already does O(1) lookup?</h3>
 * Two reasons:
 * <ol>
 *   <li><b>Coursework requirement.</b> The Data Structures syllabus calls for
 *       a binary search demonstration, and this class supplies one.</li>
 *   <li><b>Different access pattern.</b> {@link ExerciseLibrary#findExercise}
 *       requires the caller to know the exact spelling of the exercise. The
 *       {@code GET /api/search} endpoint and the
 *       {@link com.fitnesspro.Main} demo use this class to search through a
 *       <i>list</i> of exercises (e.g. a filtered subset, or a snapshot
 *       returned by the API) where building a HashMap on the fly would be
 *       overkill.</li>
 * </ol>
 *
 * <h3>Design notes</h3>
 * <ul>
 *   <li>All methods are {@code static} — this is a stateless utility class.</li>
 *   <li>Comparison uses {@link String#compareToIgnoreCase} so search is
 *       case-insensitive, matching the case-insensitive lookup behavior of
 *       {@link ExerciseLibrary}.</li>
 *   <li>The list passed to {@link #binarySearchByName} <b>must</b> be sorted
 *       by the same comparator used here (case-insensitive on name). Calling
 *       binary search on an unsorted list silently returns wrong answers — a
 *       classic foot-gun. Always run {@link #sortExercisesByName} first if
 *       you're unsure.</li>
 * </ul>
 *
 * <h3>Time complexity summary</h3>
 * <table>
 *   <tr><th>Operation</th>                 <th>Complexity</th></tr>
 *   <tr><td>{@link #binarySearchByName}</td>   <td>O(log n)</td></tr>
 *   <tr><td>{@link #sortExercisesByName}</td>  <td>O(n log n)</td></tr>
 * </table>
 *
 * @author GomezJ602
 */
public class SearchUtility {

    /** Private constructor: this class is a static-only utility holder. */
    private SearchUtility() {}

    /**
     * Iterative binary search by exercise name on a sorted list.
     *
     * <p><b>Algorithm</b> (classic textbook variant):</p>
     * <ol>
     *   <li>Maintain two cursors {@code low} and {@code high} bracketing the
     *       still-unexplored slice of the list.</li>
     *   <li>Compute {@code mid} as the midpoint. We use
     *       {@code low + (high - low) / 2} rather than {@code (low + high) / 2}
     *       to avoid integer overflow when both indices are large — a
     *       well-known correctness bug that lurked in {@code java.util.Arrays}
     *       for nine years before being fixed in 2006.</li>
     *   <li>Compare the midpoint name to the target. Three cases:
     *       <ul>
     *         <li>{@code 0}  → match found, return it.</li>
     *         <li>{@code <0} → midpoint is alphabetically before the target,
     *             so the target (if present) lives in the upper half. Move
     *             {@code low} past {@code mid}.</li>
     *         <li>{@code >0} → midpoint is alphabetically after the target,
     *             so the target (if present) lives in the lower half. Move
     *             {@code high} below {@code mid}.</li>
     *       </ul>
     *   </li>
     *   <li>If {@code low > high}, the target does not exist. Return {@code null}.</li>
     * </ol>
     *
     * <p><b>Precondition:</b> {@code exerciseList} must be sorted by name,
     * case-insensitively. Pass it through {@link #sortExercisesByName} first
     * if it isn't already.</p>
     *
     * <p><b>Complexity:</b> O(log n) comparisons.</p>
     *
     * @param exerciseList sorted list of exercises (sorted by name, case-insensitive)
     * @param targetName   name to look up; matched case-insensitively
     * @return the matching {@link Exercise}, or {@code null} if not present
     */
    public static Exercise binarySearchByName(List<Exercise> exerciseList, String targetName) {
        int low = 0;
        int high = exerciseList.size() - 1;

        while (low <= high) {
            // Overflow-safe midpoint (see method-doc note about the historic
            // java.util.Arrays bug).
            int mid = low + (high - low) / 2;
            Exercise midExercise = exerciseList.get(mid);
            int comparison = midExercise.getName().compareToIgnoreCase(targetName);

            if (comparison == 0) {
                return midExercise;        // exact match — done
            } else if (comparison < 0) {
                low = mid + 1;             // discard the lower half (incl. mid)
            } else {
                high = mid - 1;            // discard the upper half (incl. mid)
            }
        }
        return null;                       // target not present
    }

    /**
     * Sorts the supplied list <b>in place</b> by exercise name, using the
     * default natural ordering of {@link String} (which IS case-sensitive —
     * see warning below).
     *
     * <p><b>Warning about case sensitivity.</b> {@link Comparator#comparing}
     * with {@link Exercise#getName} relies on {@link String#compareTo}, which
     * is case-<b>sensitive</b>. The {@link #binarySearchByName} method, by
     * contrast, uses {@link String#compareToIgnoreCase}. In practice this is
     * fine because every exercise name in the seeded library uses
     * Title Case (e.g. "Bench Press", "Push-ups"), so case-sensitive and
     * case-insensitive sort orders match. If a future exercise uses unusual
     * casing, swap the comparator below to
     * {@code Comparator.comparing(Exercise::getName, String.CASE_INSENSITIVE_ORDER)}
     * to keep the orderings aligned.</p>
     *
     * <p><b>Complexity:</b> O(n log n) — uses {@link Collections#sort}, which
     * is a stable Tim-sort under the hood.</p>
     *
     * @param exerciseList list to sort in place
     */
    public static void sortExercisesByName(List<Exercise> exerciseList) {
        Collections.sort(exerciseList, Comparator.comparing(Exercise::getName));
    }
}
