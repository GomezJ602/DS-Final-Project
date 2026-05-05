package com.fitnesspro.model;

/**
 * <h2>Exercise — Domain Model</h2>
 *
 * Represents a single physical exercise (e.g. "Bench Press", "Plank") that the
 * user can perform. This is a plain immutable-ish data carrier (a "POJO") — it
 * holds the descriptive fields needed by the rest of the system (UI cards,
 * workout history stack, library lookups, search results) and produces a JSON
 * string when the backend serializes it for the React frontend.
 *
 * <h3>Where it fits in the architecture</h3>
 * <pre>
 *     ExerciseLibrary  ──┐
 *     WorkoutHistory   ──┼──► holds Exercise objects
 *     CircuitManager   ──┘
 *     BackendServer    ──► converts Exercise → JSON via toJson()
 *     React frontend   ──► consumes the JSON and displays each card
 * </pre>
 *
 * <h3>Field categories</h3>
 * <ul>
 *   <li><b>Identity / classification:</b> {@code name}, {@code category},
 *       {@code difficulty} — used by the UI to filter and sort exercises.</li>
 *   <li><b>Descriptive:</b> {@code description}, {@code instructions} —
 *       human-readable text shown on detail screens.</li>
 *   <li><b>Numeric metrics:</b> {@code duration} (display string like "20 min"),
 *       {@code calories} (estimated kcal burned).</li>
 *   <li><b>Media:</b> {@code image} — URL or local asset path; may be empty
 *       when no image is curated yet.</li>
 * </ul>
 *
 * <h3>Why difficulty is a String (not an enum)</h3>
 * The React UI displays the difficulty label verbatim ("Beginner" /
 * "Intermediate" / "Advanced"), so storing the canonical string here avoids a
 * round-trip enum→display mapping and keeps the JSON output stable.
 *
 * @author GomezJ602
 * @version 1.0
 */
public class Exercise {

    // ── Fields ────────────────────────────────────────────────────────────
    // All fields are private so external callers cannot mutate the object after
    // construction. We deliberately do NOT expose setters: an Exercise that has
    // been pushed onto the WorkoutHistory stack should not be retroactively
    // editable, since that would silently change historical workout data.

    /** Unique display name (e.g. "Push-ups"). Used as the HashMap key in
     *  {@link com.fitnesspro.logic.ExerciseLibrary} (lower-cased on lookup). */
    private String name;

    /** Top-level grouping shown in the UI: e.g. "strength", "cardio",
     *  "flexibility", "calisthenics". Drives category-based filtering. */
    private String category;

    /** Difficulty label exactly as the UI displays it: "Beginner",
     *  "Intermediate", or "Advanced". Stored as a String (see class doc). */
    private String difficulty;

    /** Human-readable coaching cue shown when a user opens the exercise detail
     *  view. May be a single sentence or a few short sentences. */
    private String instructions;

    /** Display string for expected duration (e.g. "20 min"). Stored as a String
     *  rather than an int because the UI sometimes shows ranges like "15-20 min"
     *  or interval-style values like "30 sec". */
    private String duration;

    /** Estimated calories burned per typical session of this exercise. Used by
     *  the {@code /api/stats} endpoint to compute total calorie totals. */
    private int calories;

    /** Optional image URL (Unsplash or asset path). Empty string when not set —
     *  the UI falls back to a placeholder in that case. */
    private String image;

    /** Short marketing-style description shown in card previews on the
     *  Workouts library page. Distinct from {@link #instructions}, which is
     *  longer-form coaching text. */
    private String description;

    /**
     * Constructs a fully-initialized Exercise.
     *
     * <p>All eight parameters are required at construction time because every
     * field is part of the JSON payload sent to the frontend; passing null
     * would surface as {@code "null"} in the UI, which is worse than an empty
     * string. Callers should pass {@code ""} for genuinely missing values.</p>
     *
     * @param name         display name; also used as the lookup key
     * @param category     grouping label (e.g. "strength")
     * @param difficulty   display label ("Beginner" / "Intermediate" / "Advanced")
     * @param duration     display string (e.g. "20 min")
     * @param calories     estimated kcal burned per session
     * @param image        image URL or asset path; may be ""
     * @param description  short card-preview text
     * @param instructions longer coaching cue text
     */
    public Exercise(String name, String category, String difficulty, String duration,
                    int calories, String image, String description, String instructions) {
        this.name = name;
        this.category = category;
        this.difficulty = difficulty;
        this.duration = duration;
        this.calories = calories;
        this.image = image;
        this.description = description;
        this.instructions = instructions;
    }

    // ── Getters ────────────────────────────────────────────────────────────
    // No setters by design (see class-level note about immutability). If a
    // future feature genuinely needs to edit an exercise (admin tooling, etc.),
    // prefer adding a builder rather than re-introducing setters.

    /** @return the display name. */
    public String getName() { return name; }

    /** @return the category label (e.g. "strength"). */
    public String getCategory() { return category; }

    /** @return the difficulty label. */
    public String getDifficulty() { return difficulty; }

    /** @return the longer-form coaching cues. */
    public String getInstructions() { return instructions; }

    /** @return the display string for duration. */
    public String getDuration() { return duration; }

    /** @return the estimated calories burned. */
    public int getCalories() { return calories; }

    /** @return the image URL/path, or empty string if none. */
    public String getImage() { return image; }

    /** @return the short marketing description. */
    public String getDescription() { return description; }

    /**
     * Console-friendly representation (used in {@link com.fitnesspro.Main}
     * demonstrations and in log lines from {@link com.fitnesspro.logic.WorkoutHistory}
     * and {@link com.fitnesspro.logic.CircuitManager}).
     *
     * <p>Format: {@code "Name [category] - difficulty"}</p>
     */
    @Override
    public String toString() {
        return String.format("%s [%s] - %s", name, category, difficulty);
    }

    /**
     * Hand-rolled JSON serializer.
     *
     * <p>We do not use a third-party library (Jackson, Gson, etc.) because this
     * project is graded on demonstrating raw data-structures work, and the
     * marker shouldn't have to install any extra Maven dependencies to run it.
     * The format produced here matches what the React frontend expects in
     * {@code src/app/components/Workouts.tsx}.</p>
     *
     * <p><b>Important:</b> every string field passes through {@link #escape}
     * before being interpolated, so quotes / backslashes inside a value won't
     * break the JSON output. Numeric fields ({@code calories}) don't need
     * escaping.</p>
     *
     * @return a single-line JSON object representing this exercise
     */
    public String toJson() {
        return String.format(
            "{\"name\":\"%s\", \"category\":\"%s\", \"difficulty\":\"%s\", " +
            "\"duration\":\"%s\", \"calories\":%d, \"image\":\"%s\", " +
            "\"description\":\"%s\", \"instructions\":\"%s\"}",
            escape(name), escape(category), escape(difficulty), escape(duration),
            calories, escape(image), escape(description), escape(instructions));
    }

    /**
     * Minimal JSON-string escaper. Handles the two characters that would
     * otherwise produce malformed JSON when interpolated naively:
     * <ul>
     *   <li>{@code \} (backslash) → {@code \\}</li>
     *   <li>{@code "} (double-quote) → {@code \"}</li>
     * </ul>
     *
     * <p>We intentionally do NOT escape control characters (newlines, tabs)
     * because every string in this codebase is single-line UI copy. If that
     * ever changes, extend this method to handle {@code \n}, {@code \r},
     * {@code \t} as well.</p>
     *
     * @param s string to escape; null is treated as an empty value
     * @return escaped string safe to drop inside a JSON string literal
     */
    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
