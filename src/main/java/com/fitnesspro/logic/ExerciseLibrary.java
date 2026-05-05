package com.fitnesspro.logic;

import com.fitnesspro.model.Exercise;
import java.util.HashMap;
import java.util.Map;

/**
 * <h2>ExerciseLibrary — Catalog of every exercise in the app (HashMap)</h2>
 *
 * Acts as the canonical, in-memory catalog of every exercise the app knows
 * about. The frontend's "Workouts" tab pulls from this catalog via the
 * {@code GET /api/exercises} endpoint, and the AI workout planner picks
 * exercises by name from here when constructing weekly plans.
 *
 * <h3>Why a {@link HashMap}?</h3>
 * The frontend search bar and the AI planner both look up exercises by name.
 * A {@link HashMap} gives <b>O(1) average-case lookup</b>, regardless of how
 * many exercises we add. Compare to a plain {@code List} which would force a
 * linear O(n) scan for every {@link #findExercise(String)} call. With ~80
 * seeded exercises that's not a huge difference, but it matters once a real
 * deployment adds hundreds.
 *
 * <h3>Key normalization</h3>
 * Keys are stored <b>lower-cased</b>. This means:
 * <ul>
 *   <li>{@code findExercise("Push-up")} and {@code findExercise("PUSH-UP")}
 *       resolve to the same record.</li>
 *   <li>The original capitalization is preserved on the {@link Exercise}
 *       object's {@code name} field for display in the UI.</li>
 * </ul>
 * The library is therefore <b>case-insensitive on lookup</b> but
 * <b>case-preserving on display</b>.
 *
 * <h3>Thread safety</h3>
 * This class is <b>not</b> thread-safe. {@link HashMap} is unsynchronized.
 * In our deployment that's acceptable because the catalog is fully populated
 * inside the constructor (single thread) before any HTTP traffic can read it,
 * and after that point we never call {@link #addExercise(Exercise)} from a
 * request handler. If runtime mutation is added later, swap to
 * {@link java.util.concurrent.ConcurrentHashMap}.
 *
 * <h3>Time complexity summary</h3>
 * <table>
 *   <tr><th>Operation</th>          <th>Complexity</th></tr>
 *   <tr><td>{@link #addExercise}</td>      <td>O(1) average</td></tr>
 *   <tr><td>{@link #findExercise}</td>     <td>O(1) average</td></tr>
 *   <tr><td>{@link #getAllExercises}</td>  <td>O(n) — copies all entries</td></tr>
 *   <tr><td>{@link #size}</td>             <td>O(1)</td></tr>
 * </table>
 *
 * @author GomezJ602
 * @see com.fitnesspro.model.Exercise
 * @see com.fitnesspro.logic.SearchUtility
 */
public class ExerciseLibrary {

    /**
     * Backing map: lower-cased exercise name → {@link Exercise} object.
     * Declared as the {@link Map} interface (not {@link HashMap}) so the
     * implementation can be swapped (e.g. for {@code ConcurrentHashMap})
     * without touching any callers.
     */
    private Map<String, Exercise> exerciseMap;

    /**
     * Builds an empty library and immediately seeds it with the standard set
     * of ~80 exercises. The seed runs synchronously inside the constructor so
     * the library is always fully populated before any caller can interact
     * with it — important for the (unsynchronized) thread-safety story above.
     */
    public ExerciseLibrary() {
        this.exerciseMap = new HashMap<>();
        initializeStandardSet();
    }

    /**
     * Inserts every exercise the app ships with. Organized into commented
     * sections by movement pattern (push / pull / press / arms / legs / core /
     * cardio / calisthenics / flexibility) so the catalog is easy to scan and
     * extend. Each line is a single {@link #addExercise(Exercise)} call —
     * adding a new exercise is as simple as appending another line in the
     * appropriate section.
     *
     * <p>The values themselves (calories, durations, instructions) are
     * curated rough estimates intended for display, not for medical-grade
     * energy expenditure tracking.</p>
     */
    private void initializeStandardSet() {
        // ── Push patterns ──────────────────────────────────────────────────
        addExercise(new Exercise("Push-ups", "strength", "Beginner", "15 min", 120, "", "Classic upper-body push exercise targeting chest, shoulders, and triceps.", "Keep core tight and body in a straight line throughout."));
        addExercise(new Exercise("Diamond Push-ups", "strength", "Intermediate", "15 min", 135, "", "Narrow-grip push-up that heavily targets the triceps.", "Form a diamond shape with index fingers and thumbs."));
        addExercise(new Exercise("Pike Push-ups", "strength", "Intermediate", "15 min", 125, "", "Shoulder-dominant push-up performed in an inverted V position.", "Push through the tops of shoulders and keep hips high."));
        addExercise(new Exercise("Decline Push-ups", "strength", "Intermediate", "20 min", 145, "", "Feet elevated push-up for greater upper-chest activation.", "Elevate feet on a chair or bench; lower chest to floor."));
        addExercise(new Exercise("Archer Push-ups", "strength", "Advanced", "20 min", 155, "", "Unilateral push-up variation that builds one-arm strength.", "Extend one arm to the side while lowering on the other."));
        addExercise(new Exercise("Tricep Dips", "strength", "Beginner", "15 min", 110, "", "Bodyweight dip using a bench or parallel bars for tricep isolation.", "Keep elbows pointing straight back; avoid flaring them outward."));

        // ── Pull patterns ──────────────────────────────────────────────────
        addExercise(new Exercise("Pull-ups", "strength", "Intermediate", "20 min", 150, "", "Overhand grip pull to the bar targeting back and biceps.", "Dead hang to chin above bar; full range of motion."));
        addExercise(new Exercise("Chin-ups", "strength", "Beginner", "20 min", 145, "", "Underhand grip pull that emphasizes the biceps.", "Supinate grip shoulder-width; pull chest to bar."));
        addExercise(new Exercise("Inverted Rows", "strength", "Beginner", "15 min", 120, "", "Horizontal pulling movement using a bar or table edge.", "Body straight, pull chest to bar while feet stay on floor."));
        addExercise(new Exercise("Dumbbell Rows", "strength", "Beginner", "20 min", 130, "", "Single-arm row targeting the lats and rhomboids.", "Brace on a bench; pull elbow back past the hip."));
        addExercise(new Exercise("Face Pulls", "strength", "Beginner", "15 min", 85, "", "Cable or band pull to the face for rear-delt and rotator cuff health.", "Pull to nose level with elbows flared high."));

        // ── Press / compound ───────────────────────────────────────────────
        addExercise(new Exercise("Bench Press", "strength", "Intermediate", "30 min", 220, "", "Barbell chest press, the cornerstone of upper-body strength.", "Retract scapula and maintain arch; lower bar to lower chest."));
        addExercise(new Exercise("Overhead Press", "strength", "Intermediate", "25 min", 200, "", "Standing or seated barbell press for shoulder strength.", "Brace core; press bar in a slight arc over the head."));
        addExercise(new Exercise("Incline Dumbbell Press", "strength", "Intermediate", "25 min", 210, "", "Incline bench press targeting the upper chest.", "Set bench to 30–45°; press dumbbells up and slightly in."));
        addExercise(new Exercise("Dips", "strength", "Intermediate", "20 min", 160, "", "Parallel bar dip for chest and tricep development.", "Lean slightly forward for chest focus; stay upright for triceps."));

        // ── Arms ───────────────────────────────────────────────────────────
        addExercise(new Exercise("Bicep Curls", "strength", "Beginner", "15 min", 90, "", "Classic dumbbell or barbell curl for bicep size.", "Full extension at bottom; squeeze at top."));
        addExercise(new Exercise("Hammer Curls", "strength", "Beginner", "15 min", 95, "", "Neutral-grip curl targeting the brachialis and forearm.", "Keep thumbs up throughout the movement."));
        addExercise(new Exercise("Skull Crushers", "strength", "Intermediate", "20 min", 105, "", "Lying tricep extension for mass and definition.", "Lower bar to forehead; keep upper arms vertical."));
        addExercise(new Exercise("Lateral Raises", "strength", "Beginner", "15 min", 80, "", "Dumbbell raise for side-delt width and shoulder definition.", "Slight forward tilt; raise to shoulder height only."));
        addExercise(new Exercise("Front Raises", "strength", "Beginner", "15 min", 80, "", "Anterior delt isolation with dumbbells or a plate.", "Controlled lift to shoulder height; avoid swinging."));

        // ── Legs ───────────────────────────────────────────────────────────
        addExercise(new Exercise("Bodyweight Squats", "strength", "Beginner", "20 min", 130, "", "Fundamental lower-body movement for quad and glute strength.", "Break at hips and knees simultaneously; chest stays up."));
        addExercise(new Exercise("Goblet Squat", "strength", "Beginner", "20 min", 140, "", "Dumbbell or kettlebell squat held at chest for upright torso.", "Hold weight at chest; squat deep between elbows."));
        addExercise(new Exercise("Barbell Back Squat", "strength", "Advanced", "40 min", 350, "", "King of lower-body exercises for overall leg mass.", "Bar on traps; hips below parallel; knees track over toes."));
        addExercise(new Exercise("Sumo Squat", "strength", "Beginner", "20 min", 135, "", "Wide-stance squat targeting inner thighs and glutes.", "Toes out 45°; push knees outward throughout."));
        addExercise(new Exercise("Reverse Lunges", "strength", "Beginner", "20 min", 130, "", "Step-back lunge that reduces knee stress while building glutes.", "Step back; lower rear knee toward the floor."));
        addExercise(new Exercise("Bulgarian Split Squats", "strength", "Intermediate", "25 min", 185, "", "Rear-foot elevated split squat for unilateral leg development.", "Rear foot on bench; front shin stays vertical."));
        addExercise(new Exercise("Romanian Deadlift", "strength", "Intermediate", "30 min", 250, "", "Hip-hinge movement for hamstring and glute strength.", "Soft knee bend; hinge at hips, bar stays close to legs."));
        addExercise(new Exercise("Deadlift", "strength", "Advanced", "40 min", 320, "", "Full-body pulling movement and a pillar of strength training.", "Neutral spine; drive floor away; lock out hips at top."));
        addExercise(new Exercise("Hip Thrusts", "strength", "Intermediate", "20 min", 160, "", "Barbell glute bridge for maximum glute activation.", "Upper back on bench; drive hips up until fully extended."));
        addExercise(new Exercise("Calf Raises", "strength", "Beginner", "15 min", 80, "", "Standing or seated raise for calf muscle development.", "Full stretch at bottom; pause and squeeze at top."));
        addExercise(new Exercise("Step-ups", "strength", "Beginner", "20 min", 140, "", "Unilateral step onto a box or bench for quad and glute work.", "Drive through the heel on the elevated leg."));

        // ── Core ───────────────────────────────────────────────────────────
        addExercise(new Exercise("Sit-ups", "strength", "Beginner", "15 min", 100, "", "Basic trunk flexion exercise for abdominal strength.", "Hands behind head; curl torso up without pulling neck."));
        addExercise(new Exercise("Crunches", "strength", "Beginner", "15 min", 90, "", "Short-range sit-up isolating the upper abs.", "Lift only shoulder blades off floor; exhale at top."));
        addExercise(new Exercise("Bicycle Crunches", "strength", "Beginner", "15 min", 110, "", "Rotational crunch hitting obliques and upper abs.", "Opposite elbow to knee; keep lower back pressed down."));
        addExercise(new Exercise("Leg Raises", "strength", "Beginner", "15 min", 105, "", "Lying leg raise for lower abdominal strength.", "Keep legs straight; lower slowly without touching the floor."));
        addExercise(new Exercise("Flutter Kicks", "strength", "Beginner", "15 min", 100, "", "Small alternating leg kicks for core endurance.", "Legs a few inches off floor; small rapid kicks."));
        addExercise(new Exercise("Russian Twists", "strength", "Intermediate", "15 min", 115, "", "Seated rotation for oblique strength and definition.", "Feet elevated; rotate torso side to side with control."));
        addExercise(new Exercise("Plank", "strength", "Beginner", "10 min", 70, "", "Isometric core hold building spinal stability.", "Forearms and toes; hips level; hold without sagging."));
        addExercise(new Exercise("Side Plank", "strength", "Intermediate", "10 min", 65, "", "Lateral isometric hold targeting the obliques.", "Stack feet; keep hips lifted; hold position."));
        addExercise(new Exercise("Dead Bug", "strength", "Beginner", "15 min", 80, "", "Core stability drill that protects the lower back.", "Opposite arm and leg lower slowly; press lumbar into floor."));
        addExercise(new Exercise("Bird Dog", "strength", "Beginner", "15 min", 75, "", "Quadruped balance exercise for core and back stability.", "Extend opposite arm and leg; keep hips square."));
        addExercise(new Exercise("V-ups", "strength", "Intermediate", "15 min", 120, "", "Full-range crunch meeting raised legs at the top.", "Reach hands to feet simultaneously; control the descent."));
        addExercise(new Exercise("Ab Wheel Rollout", "strength", "Advanced", "15 min", 130, "", "Roller extension building deep core strength.", "Slow rollout; pull back using abs, not hip flexors."));
        addExercise(new Exercise("Hollow Body Hold", "calisthenics", "Intermediate", "15 min", 100, "", "Gymnastics foundation for full-body tension.", "Press lower back down; arms and legs hover just off the floor."));

        // ── Cardio ─────────────────────────────────────────────────────────
        addExercise(new Exercise("Burpees", "cardio", "Intermediate", "20 min", 280, "", "Full-body explosive movement combining squat, plank, and jump.", "Kick feet back to plank; chest to floor; jump and clap overhead."));
        addExercise(new Exercise("Mountain Climbers", "cardio", "Beginner", "15 min", 210, "", "Running in place in a plank position for cardio and core.", "Drive knees to chest alternately at a rapid pace."));
        addExercise(new Exercise("Jump Rope", "cardio", "Beginner", "20 min", 250, "", "Classic skipping for cardiovascular fitness and coordination.", "Stay on the balls of your feet; keep jumps small."));
        addExercise(new Exercise("High Knees", "cardio", "Beginner", "15 min", 200, "", "Running in place driving knees above hip height.", "Pump arms; land softly on the balls of the feet."));
        addExercise(new Exercise("Jumping Jacks", "cardio", "Beginner", "15 min", 180, "", "Full-body warm-up and cardio staple.", "Coordinate arm raise with leg jump simultaneously."));
        addExercise(new Exercise("Jump Squats", "cardio", "Intermediate", "20 min", 240, "", "Explosive squat with airborne phase for power and cardio.", "Squat deep; explode up; land softly and absorb the impact."));
        addExercise(new Exercise("Box Jumps", "cardio", "Intermediate", "20 min", 260, "", "Plyometric jump onto a box for lower-body power.", "Soft landing; step down; reset before the next rep."));
        addExercise(new Exercise("Speed Skaters", "cardio", "Intermediate", "20 min", 240, "", "Lateral bounds mimicking a speed skater's stride.", "Wide lateral leap; touch floor with rear hand; bound back."));
        addExercise(new Exercise("Bear Crawl", "cardio", "Beginner", "15 min", 190, "", "Quadruped movement building coordination and endurance.", "Knees hover 2 inches off floor; crawl forward and back."));

        // ── Calisthenics ───────────────────────────────────────────────────
        addExercise(new Exercise("Muscle-up", "calisthenics", "Advanced", "20 min", 200, "", "Explosive pull-up transitioning into a dip above the bar.", "Generate momentum with a strong kip; lean forward at the top."));
        addExercise(new Exercise("L-sit Hold", "calisthenics", "Advanced", "15 min", 130, "", "Isometric compression hold with legs parallel to the floor.", "Press down through hands; point toes; hold as long as possible."));
        addExercise(new Exercise("Handstand Hold", "calisthenics", "Advanced", "20 min", 150, "", "Inverted balance for shoulder strength and body awareness.", "Kick up against a wall first; work toward freestanding balance."));
        addExercise(new Exercise("Pistol Squat", "calisthenics", "Advanced", "25 min", 185, "", "Single-leg squat requiring strength, balance, and flexibility.", "Extend the non-working leg forward; squat to full depth."));
        addExercise(new Exercise("Dragon Flag", "calisthenics", "Advanced", "20 min", 160, "", "Full-body lever movement made famous by Bruce Lee.", "Lower the body as one rigid unit; press through the shoulder blades."));
        addExercise(new Exercise("Front Lever Hold", "calisthenics", "Advanced", "20 min", 155, "", "Horizontal hang from a bar with body fully extended.", "Retract scapula and depress shoulders; body parallel to floor."));
        addExercise(new Exercise("Tuck Planche Hold", "calisthenics", "Advanced", "15 min", 145, "", "Progression toward the full planche on hands or bars.", "Lean forward; round upper back; knees tucked to chest."));

        // ── Flexibility / Stretches ────────────────────────────────────────
        addExercise(new Exercise("Hip Flexor Stretch", "flexibility", "Beginner", "10 min", 30, "", "Kneeling lunge stretch targeting the hip flexors.", "Front knee over ankle; push hips forward; hold 30–60 s per side."));
        addExercise(new Exercise("Hamstring Stretch", "flexibility", "Beginner", "10 min", 30, "", "Standing or seated reach to lengthen the hamstrings.", "Hinge at hips; keep back flat; avoid rounding the spine."));
        addExercise(new Exercise("Quad Stretch", "flexibility", "Beginner", "10 min", 25, "", "Standing pull of the heel to the glute for quad release.", "Stand tall; knee points straight down; hold 30 s each side."));
        addExercise(new Exercise("Calf Stretch", "flexibility", "Beginner", "10 min", 25, "", "Wall-supported stretch for gastrocnemius and soleus.", "Heel on floor; press forward; hold bent-knee version for soleus."));
        addExercise(new Exercise("Pigeon Pose", "flexibility", "Intermediate", "15 min", 40, "", "Deep external hip rotation releasing the glutes and piriformis.", "Front shin parallel to mat; square hips; hold 1–2 min per side."));
        addExercise(new Exercise("Seated Spinal Twist", "flexibility", "Beginner", "10 min", 30, "", "Rotational stretch decompressing the spine and opening the thorax.", "Sit tall; cross one leg; twist toward the raised knee."));
        addExercise(new Exercise("Cat-Cow", "flexibility", "Beginner", "10 min", 35, "", "Flowing spinal mobilization coordinated with breath.", "Inhale into cow; exhale into cat; 10–15 slow cycles."));
        addExercise(new Exercise("Child's Pose", "flexibility", "Beginner", "10 min", 25, "", "Restorative rest stretch opening the hips and spine.", "Arms extended; forehead to floor; breathe into lower back."));
        addExercise(new Exercise("Cobra Stretch", "flexibility", "Beginner", "10 min", 30, "", "Prone backbend opening the chest and hip flexors.", "Press through hands; lift chest; keep pelvis on floor."));
        addExercise(new Exercise("Downward Dog", "flexibility", "Beginner", "15 min", 45, "", "Inverted V pose stretching the entire posterior chain.", "Press heels toward floor; spread fingers; lift sit bones."));
        addExercise(new Exercise("Figure-Four Stretch", "flexibility", "Beginner", "10 min", 30, "", "Supine piriformis and glute stretch.", "Lying on back; cross ankle over opposite knee; pull toward chest."));
        addExercise(new Exercise("Shoulder Cross-Body Stretch", "flexibility", "Beginner", "10 min", 25, "", "Horizontal pull of the arm across the chest for rear-delt release.", "Hold arm at elbow; gently pull across; hold 20–30 s each side."));
        addExercise(new Exercise("Chest Opener Stretch", "flexibility", "Beginner", "10 min", 30, "", "Doorway or clasped-hands stretch releasing pec tightness.", "Stand in a doorway; arms at 90°; step forward gently."));
        addExercise(new Exercise("Wrist Flexor Stretch", "flexibility", "Beginner", "5 min", 15, "", "Forearm stretch important for athletes and desk workers.", "Arm extended; bend wrist back with opposite hand; hold 20 s."));
        addExercise(new Exercise("IT Band Stretch", "flexibility", "Intermediate", "10 min", 30, "", "Standing cross-body lean to release the iliotibial band.", "Cross feet; lean toward the non-weight-bearing side; hold 30 s."));
        addExercise(new Exercise("Neck Rolls", "flexibility", "Beginner", "5 min", 15, "", "Gentle cervical mobilization releasing neck tension.", "Slow half-circles forward only; avoid full backward rolls."));
    }

    /**
     * Inserts an exercise into the catalog, keyed by its lower-cased name.
     *
     * <p>If an exercise with the same (lower-cased) name already exists, the
     * old entry is silently replaced — this is standard {@link HashMap#put}
     * behavior and intentional: it lets the catalog be re-seeded or hot-patched
     * without first clearing the map.</p>
     *
     * <p><b>Complexity:</b> O(1) average case (amortized constant time across
     * the rare HashMap resize events).</p>
     *
     * @param exercise the Exercise to store; its {@code name} becomes the key
     */
    public void addExercise(Exercise exercise) {
        // Lower-case the key so lookup is case-insensitive (see class doc).
        exerciseMap.put(exercise.getName().toLowerCase(), exercise);
    }

    /**
     * Retrieves an exercise by name, case-insensitively.
     *
     * <p><b>Complexity:</b> O(1) average — significantly faster than scanning
     * a {@code List<Exercise>} would be.</p>
     *
     * <p><b>Note:</b> this is exact-name lookup only. For substring or fuzzy
     * matching (used by the Workouts tab's search bar), see
     * {@link com.fitnesspro.logic.SearchUtility#binarySearchByName}.</p>
     *
     * @param name the exercise name to search for; matched case-insensitively
     * @return the matching {@link Exercise}, or {@code null} if no entry exists
     */
    public Exercise findExercise(String name) {
        return exerciseMap.get(name.toLowerCase());
    }

    /**
     * Returns a snapshot of every exercise in the catalog.
     *
     * <p>The returned list is a <b>copy</b>: callers can mutate or sort it
     * without affecting the underlying map. The order is unspecified — if you
     * need a sorted list, run it through
     * {@link com.fitnesspro.logic.SearchUtility#sortExercisesByName(java.util.List)}.</p>
     *
     * <p><b>Complexity:</b> O(n) — must walk every entry to populate the new
     * list.</p>
     *
     * @return a fresh ArrayList containing every exercise (in unspecified order)
     */
    public java.util.List<Exercise> getAllExercises() {
        return new java.util.ArrayList<>(exerciseMap.values());
    }

    /**
     * @return the number of exercises currently stored in the catalog
     *         (O(1) — {@link HashMap} keeps a running size counter).
     */
    public int size() {
        return exerciseMap.size();
    }
}
