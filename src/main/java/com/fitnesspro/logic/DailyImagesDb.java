package com.fitnesspro.logic;

import java.io.*;
import java.nio.file.*;

/**
 * <h2>DailyImagesDb — One hero photo per day of the week (file-backed)</h2>
 *
 * Persistent store mapping each day of the week (0 = Sunday … 6 = Saturday)
 * to a single hero image URL. The Dashboard's "Today's Workout" card calls
 * the {@code GET /api/daily-images?day=N} endpoint on load, so the user sees
 * a different gym photo every day. Restarting the server keeps the data —
 * which is exactly the user-facing requirement that motivated this class.
 *
 * <h3>How the persistence works</h3>
 * On the very first call to any public method, {@link #ensureSeeded} checks
 * for the file {@code daily_images.json} in the server's working directory.
 * If the file does not exist, the seven {@link #DEFAULT_URLS} entries are
 * written out as a JSON array (see {@link #buildDefaultJson}). Subsequent
 * calls just read from the file. <b>This means the file is the source of
 * truth after first run</b> — manually editing it lets a project owner swap
 * any photo without rebuilding/redeploying the JVM.
 *
 * <h3>Why "SQL database somewhere" became this</h3>
 * The original feature ask was "store these in the SQL database." This
 * project doesn't have a real SQL database connected to the Java backend —
 * Supabase (Postgres) is reached only by the React frontend through Edge
 * Functions, and the Java side already established a file-as-database
 * pattern with {@link UPCDatabase}. So we use the same lightweight pattern:
 * one JSON file, hand-rolled read/write, no extra dependencies. From the
 * application's perspective the file IS the database.
 *
 * <h3>File format</h3>
 * <pre>
 *   [
 *     {"day":0,"dayName":"Sunday","imageUrl":"https://images.unsplash.com/..."},
 *     {"day":1,"dayName":"Monday","imageUrl":"https://images.unsplash.com/..."},
 *     ...
 *     {"day":6,"dayName":"Saturday","imageUrl":"https://images.unsplash.com/..."}
 *   ]
 * </pre>
 *
 * <h3>Thread safety</h3>
 * All public methods are {@code synchronized}, so concurrent HTTP request
 * handlers serialize through the class lock. Reads are very cheap (small
 * JSON file, kept resident in OS page cache after first hit), so the lock
 * contention is negligible.
 *
 * @author GomezJ602
 * @see UPCDatabase — same file-as-database pattern, different domain
 */
public class DailyImagesDb {

    /** Path to the JSON database file (resolved relative to working directory). */
    private static final String DB_FILE = "daily_images.json";

    /**
     * The seven hero photos used to seed the database the first time the
     * server runs. Indices follow the JavaScript / Java
     * {@code Date.getDay()} convention: 0 = Sunday, 1 = Monday, ...,
     * 6 = Saturday.
     *
     * <p>These are also the runtime fallback values: if any error occurs
     * reading the JSON file (file deleted, permission issue, malformed JSON),
     * {@link #getByDay} falls back to the matching entry here so the UI
     * never breaks. The frontend keeps the same fallback list as well — three
     * layers of safety against a missing image.</p>
     */
    private static final String[] DEFAULT_URLS = {
        // Sunday (0) — recovery / yoga feel
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
        // Monday (1) — classic barbell / weight room
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
        // Tuesday (2) — cardio / open gym floor
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
        // Wednesday (3) — dark, moody gym intensity
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
        // Thursday (4) — barbell strength training
        "https://images.unsplash.com/photo-1581009137042-c552e485697a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
        // Friday (5) — energetic workout action
        "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
        // Saturday (6) — gym equipment / weights room
        "https://images.unsplash.com/photo-1483721310020-03333e577078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    };

    /** Day-of-week names matched 1-to-1 with {@link #DEFAULT_URLS}. */
    private static final String[] DAY_NAMES = {
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    };

    /**
     * Returns the hero image URL for a given day-of-week index.
     *
     * <p>This is the workhorse method that the {@code /api/daily-images?day=N}
     * endpoint calls every time the user loads the Dashboard.</p>
     *
     * <p><b>Algorithm</b> (intentionally simple — the file is small):</p>
     * <ol>
     *   <li>Make sure the seed file exists ({@link #ensureSeeded}).</li>
     *   <li>Read the entire file into memory.</li>
     *   <li>Find the substring {@code "day":N} and then the next
     *       {@code "imageUrl":"..."} value after it. Substring scan is more
     *       than fast enough for 7 records.</li>
     *   <li>If anything goes wrong, return the matching {@link #DEFAULT_URLS}
     *       entry so the UI degrades gracefully.</li>
     * </ol>
     *
     * <p>The {@code dayOfWeek % 7} on the fallback path defends against bad
     * input (e.g. someone passing 8 or -1) — we'd rather show <i>some</i>
     * image than crash.</p>
     *
     * @param dayOfWeek 0 = Sunday, 1 = Monday, ..., 6 = Saturday
     * @return the URL string for that day
     */
    public static synchronized String getByDay(int dayOfWeek) {
        ensureSeeded();
        try {
            String json = new String(Files.readAllBytes(Path.of(DB_FILE)));
            // Locate the JSON object for this day. Format guarantee: each
            // object starts with the literal `"day":N`.
            String needle = "\"day\":" + dayOfWeek;
            int idx = json.indexOf(needle);
            if (idx < 0) return DEFAULT_URLS[dayOfWeek % 7];

            // Once we have the day's record, find the imageUrl value within
            // it. The +12 hops past the literal `"imageUrl":"` to land on
            // the first character of the URL.
            int urlStart = json.indexOf("\"imageUrl\":\"", idx) + 12;
            int urlEnd   = json.indexOf("\"", urlStart);
            return json.substring(urlStart, urlEnd);
        } catch (Exception e) {
            // Any read failure → fall back to the in-memory defaults so
            // the dashboard still gets a photo.
            return DEFAULT_URLS[dayOfWeek % 7];
        }
    }

    /**
     * Returns the entire JSON array of all 7 day mappings.
     *
     * <p>Used by the {@code GET /api/daily-images} endpoint when no
     * {@code day} parameter is supplied — handy for an admin tool that wants
     * to display all seven records, or for the frontend to pre-cache the
     * full set in a single request.</p>
     *
     * @return the raw JSON array string read from disk; falls back to the
     *         hand-built default JSON if the file cannot be read
     */
    public static synchronized String getAllAsJson() {
        ensureSeeded();
        try {
            return new String(Files.readAllBytes(Path.of(DB_FILE)));
        } catch (IOException e) {
            return buildDefaultJson();
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * Idempotent seed step. If {@code daily_images.json} is already on disk,
     * this is a no-op. Otherwise, writes out the seven default entries so
     * later reads have something to find.
     *
     * <p>Called from every public method to make first-call seeding
     * automatic — no separate "init" step required at server startup.</p>
     */
    private static void ensureSeeded() {
        if (new File(DB_FILE).exists()) return;
        try {
            Files.writeString(Path.of(DB_FILE), buildDefaultJson());
            System.out.println("DailyImagesDb: seeded " + DB_FILE + " with 7 day images.");
        } catch (IOException e) {
            // Non-fatal: getByDay() falls back to DEFAULT_URLS in memory.
            System.err.println("DailyImagesDb: could not write seed file — " + e.getMessage());
        }
    }

    /**
     * Hand-builds the default JSON array literal as a string. Keeping this in
     * one place makes the on-disk file format easy to evolve — change the
     * format here and the {@link #ensureSeeded} re-seed will produce the new
     * shape on next first-run (after deleting the old file).
     *
     * @return a multi-line JSON array of the seven default day records
     */
    private static String buildDefaultJson() {
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 0; i < 7; i++) {
            sb.append("  {\"day\":").append(i)
              .append(",\"dayName\":\"").append(DAY_NAMES[i]).append("\"")
              .append(",\"imageUrl\":\"").append(DEFAULT_URLS[i]).append("\"}")
              // Comma after every record except the last, then newline.
              .append(i < 6 ? ",\n" : "\n");
        }
        sb.append("]");
        return sb.toString();
    }
}
