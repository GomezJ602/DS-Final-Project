package com.fitnesspro.api;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import com.fitnesspro.logic.*;
import com.fitnesspro.logic.UPCDatabase;
import com.fitnesspro.model.Exercise;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <h2>BackendServer — HTTP bridge between React UI and Java logic</h2>
 *
 * Hosts a lightweight HTTP server (built on the JDK's built-in
 * {@link com.sun.net.httpserver.HttpServer}) on port {@code 8080}. Every
 * meaningful interaction in the React frontend — logging an exercise,
 * scanning a barcode, requesting an AI workout plan, fetching today's
 * dashboard photo — is implemented as one fetch call to one endpoint here.
 *
 * <h3>Why the JDK built-in server?</h3>
 * No external framework (Spring, Javalin, etc.) is needed. The built-in
 * {@link HttpServer} ships with the JDK, so the Maven/Gradle dependency tree
 * stays empty and the project builds with a single {@code javac} invocation.
 * That trade-off is worth it here because the API surface is small and the
 * ergonomics of {@link HttpServer#createContext} are good enough for ~12
 * endpoints.
 *
 * <h3>Endpoint groups</h3>
 * <table>
 *   <tr><th>Path</th>                       <th>Backed by</th>                  <th>Purpose</th></tr>
 *   <tr><td>{@code /api/exercises}</td>         <td>{@link ExerciseLibrary}</td>     <td>List all exercises (HashMap)</td></tr>
 *   <tr><td>{@code /api/workout/log}</td>       <td>{@link WorkoutHistory}</td>      <td>Push to stack (LIFO)</td></tr>
 *   <tr><td>{@code /api/workout/undo}</td>      <td>{@link WorkoutHistory}</td>      <td>Pop from stack</td></tr>
 *   <tr><td>{@code /api/workout/history}</td>   <td>{@link WorkoutHistory}</td>      <td>Read stack contents</td></tr>
 *   <tr><td>{@code /api/stats}</td>             <td>{@link WorkoutHistory}</td>      <td>Aggregate totals</td></tr>
 *   <tr><td>{@code /api/circuit/add}</td>       <td>{@link CircuitManager}</td>      <td>Enqueue (FIFO)</td></tr>
 *   <tr><td>{@code /api/circuit/next}</td>      <td>{@link CircuitManager}</td>      <td>Dequeue</td></tr>
 *   <tr><td>{@code /api/search}</td>            <td>{@link SearchUtility}</td>       <td>Binary search by name</td></tr>
 *   <tr><td>{@code /api/ai/workout-plan}</td>   <td>Groq Llama-3.3 API</td>          <td>AI weekly plan generator</td></tr>
 *   <tr><td>{@code /api/workout/log-reps}</td>  <td>in-memory list</td>              <td>Save user-tracked reps</td></tr>
 *   <tr><td>{@code /api/upc/lookup}</td>        <td>{@link UPCDatabase}</td>         <td>Find scanned product</td></tr>
 *   <tr><td>{@code /api/upc/save}</td>          <td>{@link UPCDatabase}</td>         <td>Persist user-defined product</td></tr>
 *   <tr><td>{@code /api/upc/all}</td>           <td>{@link UPCDatabase}</td>         <td>Pre-fill frontend cache</td></tr>
 *   <tr><td>{@code /api/daily-images}</td>      <td>{@link DailyImagesDb}</td>       <td>Day-of-week hero photo</td></tr>
 * </table>
 *
 * <h3>Lifecycle</h3>
 * The four data-structure singletons ({@link #library}, {@link #history},
 * {@link #circuit}, {@link #workoutRepLogs}) are <b>process-scoped</b>: they
 * exist for the lifetime of the JVM and reset to empty when the server is
 * restarted. That's the right behavior for a coursework demo. Persistent
 * domains (UPC products, daily images) instead use file-backed stores so
 * their data survives a restart.
 *
 * <h3>CORS</h3>
 * Every endpoint calls {@link #configureCors} so the React dev server (which
 * runs on a different port — typically 5173) can hit the API without
 * triggering browser cross-origin restrictions. We allow all origins
 * ({@code *}) because this is a local development setup; a production
 * deployment would tighten that.
 *
 * @author GomezJ602
 */
public class BackendServer {

    // ── Process-scoped singletons (reset on JVM restart) ────────────────────
    // These four fields hold the in-memory state used by the data-structure
    // endpoints. Marked private + static so every request handler reads from
    // and writes to the same instance.

    /** The HashMap-backed catalog of every exercise the app knows about. */
    private static ExerciseLibrary library = new ExerciseLibrary();

    /** The Stack-backed "logged exercises" list with undo support. */
    private static WorkoutHistory history = new WorkoutHistory();

    /** The Queue-backed circuit (sequence of upcoming exercises). */
    private static CircuitManager circuit = new CircuitManager();

    /**
     * Raw JSON bodies POSTed to {@code /api/workout/log-reps}. Stored as
     * strings (not parsed) because the frontend already has the data
     * structured locally — this exists primarily so backend logs / Java unit
     * tests can verify rep tracking is being written through the network
     * instead of only sitting in browser localStorage.
     */
    private static List<String> workoutRepLogs = new ArrayList<>();

    /**
     * <h3>Server startup</h3>
     *
     * Boots the HTTP server on port 8080 and wires every request path to its
     * handler. Each {@code server.createContext(path, handler)} call below
     * registers a new endpoint; the handlers themselves are written as
     * {@code lambda}s rather than separate methods to keep the shape
     * "URL → behavior" visible at a glance.
     *
     * <p>Port collision: if another process is already bound to 8080 (often
     * a previous instance of this same server that wasn't shut down cleanly),
     * we print a friendly error to {@code stderr} and rethrow. The
     * {@code run-app.bat} script reports that to the user.</p>
     *
     * @param args ignored (no CLI flags)
     * @throws IOException if the server cannot bind to port 8080
     */
    public static void main(String[] args) throws IOException {
        int port = 8080;
        HttpServer server;
        try {
            server = HttpServer.create(new InetSocketAddress(port), 0);
        } catch (java.net.BindException e) {
            System.err.println("Port " + port + " is already in use. Is another instance of the server running?");
            System.err.println("Kill the existing process or change the port and restart.");
            throw e;
        }

        // ════════════════════════════════════════════════════════════════════
        //                         DATA STRUCTURE ENDPOINTS
        // The endpoints in this section directly exercise the four core data
        // structures the project showcases (HashMap, Stack, Queue, Binary
        // Search). They are the "visible" Data Structures coursework deliverable.
        // ════════════════════════════════════════════════════════════════════

        // ──────────────────────────────────────────────────────────────────
        // GET /api/exercises    (HashMap — list every catalog entry)
        // ──────────────────────────────────────────────────────────────────
        // The frontend calls this once on the Workouts page load to populate
        // the exercise library. Note the streaming step: each Exercise turns
        // itself into JSON via toJson(), and we manually join them with commas
        // — a one-line replacement for any third-party serializer.
        server.createContext("/api/exercises", exchange -> {
            configureCors(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                List<Exercise> all = library.getAllExercises();
                String json = "[" + all.stream().map(Exercise::toJson)
                                       .collect(Collectors.joining(",")) + "]";
                sendJsonResponse(exchange, json);
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // POST /api/workout/log?name=<exerciseName>  (Stack — push)
        // ──────────────────────────────────────────────────────────────────
        // Looks up the exercise in the library (HashMap O(1)), then pushes
        // it onto the WorkoutHistory stack. Returns 404 if the name doesn't
        // match any catalog entry — that prevents accidentally polluting the
        // history with junk records.
        server.createContext("/api/workout/log", exchange -> {
            configureCors(exchange);
            if ("POST".equals(exchange.getRequestMethod())) {
                String name = getQueryParam(exchange, "name");
                Exercise e = library.findExercise(name);
                if (e != null) {
                    history.logExercise(e);
                    sendJsonResponse(exchange, e.toJson());
                } else {
                    sendJsonResponse(exchange, "{\"error\":\"Exercise not found\"}", 404);
                }
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // POST /api/workout/undo  (Stack — pop)
        // ──────────────────────────────────────────────────────────────────
        // The "undo" feature. If the stack is already empty, undoLastExercise
        // returns null; we send "{}" so the frontend can no-op without
        // special-casing a 404.
        server.createContext("/api/workout/undo", exchange -> {
            configureCors(exchange);
            if ("POST".equals(exchange.getRequestMethod())) {
                Exercise removed = history.undoLastExercise();
                sendJsonResponse(exchange, removed != null ? removed.toJson() : "{}");
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // GET /api/workout/history  (Stack — snapshot, newest first)
        // ──────────────────────────────────────────────────────────────────
        // Returns all logged exercises ordered most-recent → oldest, ready
        // for the frontend's "recent workouts" list to render.
        server.createContext("/api/workout/history", exchange -> {
            configureCors(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                List<Exercise> all = history.getHistoryList();
                String json = "[" + all.stream().map(Exercise::toJson)
                                       .collect(Collectors.joining(",")) + "]";
                sendJsonResponse(exchange, json);
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // GET /api/stats  (aggregate over the Stack)
        // ──────────────────────────────────────────────────────────────────
        // Walks every entry in the workout-history stack and totals the
        // calories. This is O(n) where n is the number of logged exercises;
        // for the demo's scale that's fine. If the history grew very large,
        // we'd cache running totals on push/pop instead of recomputing.
        server.createContext("/api/stats", exchange -> {
            configureCors(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                List<Exercise> all = history.getHistoryList();
                int totalCalories = all.stream().mapToInt(Exercise::getCalories).sum();
                int totalWorkouts = all.size();
                String json = String.format(
                    "{\"calories\":%d, \"workouts\":%d}", totalCalories, totalWorkouts);
                sendJsonResponse(exchange, json);
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // POST /api/circuit/add?name=<exerciseName>  (Queue — enqueue)
        // ──────────────────────────────────────────────────────────────────
        // Same lookup-then-act pattern as /api/workout/log, but adds to the
        // circuit queue (FIFO) instead of the history stack (LIFO).
        server.createContext("/api/circuit/add", exchange -> {
            configureCors(exchange);
            if ("POST".equals(exchange.getRequestMethod())) {
                String name = getQueryParam(exchange, "name");
                Exercise e = library.findExercise(name);
                if (e != null) {
                    circuit.addExerciseToCircuit(e);
                    sendJsonResponse(exchange, e.toJson());
                } else {
                    sendJsonResponse(exchange, "{\"error\":\"Exercise not found\"}", 404);
                }
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // POST /api/circuit/next  (Queue — dequeue)
        // ──────────────────────────────────────────────────────────────────
        // Returns the next exercise in the user's circuit. When the queue
        // is exhausted, sends "{}" so the frontend can show a "circuit
        // complete" state.
        server.createContext("/api/circuit/next", exchange -> {
            configureCors(exchange);
            if ("POST".equals(exchange.getRequestMethod())) {
                Exercise next = circuit.nextExercise();
                sendJsonResponse(exchange, next != null ? next.toJson() : "{}");
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // GET /api/search?name=<query>  (Binary Search — O(log n))
        // ──────────────────────────────────────────────────────────────────
        // Demonstrates binary search by:
        //   1. taking a snapshot of the catalog (fresh ArrayList copy)
        //   2. sorting it by name (O(n log n))
        //   3. binary-searching for the query (O(log n))
        // Step 1 + 2 cost more than they save vs. the HashMap, but the goal
        // here is to demonstrate the algorithm — see /api/exercises if you
        // just need data, or ExerciseLibrary.findExercise if you have an
        // exact name.
        server.createContext("/api/search", exchange -> {
            configureCors(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                String query = getQueryParam(exchange, "name");
                List<Exercise> sortedList = library.getAllExercises();
                SearchUtility.sortExercisesByName(sortedList);
                Exercise result = SearchUtility.binarySearchByName(sortedList, query);
                sendJsonResponse(exchange, result != null ? result.toJson() : "{}");
            }
        });

        // ════════════════════════════════════════════════════════════════════
        //                          AI WORKOUT PLAN
        // POST /api/ai/workout-plan
        //
        // Accepts the full questionnaire (~12 fields) the user fills in on the
        // Workouts tab, builds a system+user prompt, and forwards it to the
        // Groq LLM API. The LLM is instructed to respond with strict JSON
        // matching a specific schema (title, maintenanceCalories, weeklyPlan
        // keyed by day name). We extract the raw text from Groq's response and
        // return it as-is — the frontend trusts the model to obey the schema.
        //
        // Auth: requires the GROQ_API_KEY environment variable. If missing,
        // we return a 500 with a clear error so the user sees what's wrong.
        // ════════════════════════════════════════════════════════════════════
        server.createContext("/api/ai/workout-plan", exchange -> {
            configureCors(exchange);
            if ("OPTIONS".equals(exchange.getRequestMethod())) return;
            if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    // Read the full POST body up-front. The questionnaire is
                    // small (a few hundred bytes); buffering it is fine.
                    String body = new String(exchange.getRequestBody().readAllBytes(), "UTF-8");

                    // Extract each questionnaire field by name. We use simple
                    // hand-rolled JSON parsing (extractJsonStringValue /
                    // extractJsonArrayAsString) instead of pulling in a full
                    // JSON library — see those methods for caveats.
                    String physique      = extractJsonStringValue(body, "physique");
                    String experience    = extractJsonStringValue(body, "experience");
                    String primaryGoal   = extractJsonStringValue(body, "primaryGoal");
                    String dailyCalories = extractJsonStringValue(body, "dailyCalories");
                    String activityLevel = extractJsonStringValue(body, "activityLevel");
                    String workoutDays   = extractJsonArrayAsString(body, "workoutDays");
                    String equipment     = extractJsonStringValue(body, "equipment");
                    String timePer       = extractJsonStringValue(body, "timePerWorkout");
                    String height        = extractJsonStringValue(body, "height");
                    String weight        = extractJsonStringValue(body, "weight");
                    String age           = extractJsonStringValue(body, "age");
                    String sex           = extractJsonStringValue(body, "sex");

                    // The Groq API key MUST come from the environment, not a
                    // hard-coded constant — that way it never leaks into git.
                    String apiKey = System.getenv("GROQ_API_KEY");
                    if (apiKey == null || apiKey.isEmpty()) {
                        sendJsonResponse(exchange, "{\"error\":\"GROQ_API_KEY not set\"}", 500);
                        return;
                    }

                    // System prompt: the LLM's "constitution" for this request.
                    // It includes (a) the formula the model should use to
                    // compute maintenance calories (Mifflin-St Jeor BMR ×
                    // activity multiplier), (b) a literal example of the JSON
                    // schema we want, and (c) hard rules the model MUST obey
                    // (no markdown, exactly 6 exercises per day, only the
                    // selected workout days as top-level keys). Keeping this
                    // verbose protects against the LLM drifting from the
                    // schema; the React frontend assumes this exact shape.
                    String systemPrompt = "You are an expert personal fitness coach and nutritionist. Create a personalized weekly workout plan. Calculate TDEE using Mifflin-St Jeor: for males BMR=(10*kg)+(6.25*cm)-(5*age)+5; for females BMR=(10*kg)+(6.25*cm)-(5*age)-161. Convert: 1 lb=0.453592 kg; parse height in feet/inches or cm. Activity multipliers: sedentary=1.2, lightly_active=1.375, moderately_active=1.55, very_active=1.725. Respond ONLY with valid JSON, no markdown: {\"title\":\"Program Name\",\"maintenanceCalories\":2500,\"weeklyPlan\":{\"Monday\":{\"focus\":\"Upper Body Push\",\"duration\":\"45 min\",\"exercises\":[{\"name\":\"Bench Press\",\"muscle\":\"Chest\",\"sets\":4,\"reps\":\"8-10\"},{\"name\":\"Overhead Press\",\"muscle\":\"Shoulders\",\"sets\":3,\"reps\":\"8-10\"},{\"name\":\"Tricep Pushdown\",\"muscle\":\"Triceps\",\"sets\":3,\"reps\":\"12-15\"},{\"name\":\"Incline Dumbbell Press\",\"muscle\":\"Chest\",\"sets\":3,\"reps\":\"10-12\"},{\"name\":\"Lateral Raises\",\"muscle\":\"Shoulders\",\"sets\":3,\"reps\":\"15-20\"},{\"name\":\"Plank\",\"muscle\":\"Core\",\"sets\":3,\"reps\":\"45 sec\"}]}}}. Include ONLY the user's selected workout days as keys. Each day MUST have EXACTLY 6 exercises appropriate for that day's focus. Vary training focus intelligently across the selected days. Use time-based reps for cardio like '30 sec'. maintenanceCalories must be an integer.";

                    String userMessage = "User Profile:" +
                        "\n- Desired Physique: " + physique +
                        "\n- Experience Level: " + experience +
                        "\n- Primary Goal: " + primaryGoal +
                        "\n- Average Daily Calories: " + dailyCalories +
                        "\n- Daily Activity Level: " + activityLevel +
                        "\n- Workout Days: " + workoutDays +
                        "\n- Equipment: " + equipment +
                        "\n- Time Per Workout: " + timePer + " min" +
                        "\n- Height: " + height +
                        "\n- Weight: " + weight + " lbs" +
                        "\n- Age: " + age +
                        "\n- Biological Sex: " + sex;

                    // Build the OpenAI-compatible chat completions request
                    // body. Llama-3.3-70b-versatile is a strong reasoning
                    // model on Groq's hosted inference; max_tokens=2048 is
                    // enough for a full 7-day plan in JSON.
                    String requestBody = "{\"model\":\"llama-3.3-70b-versatile\",\"max_tokens\":2048," +
                        "\"messages\":[" +
                        "{\"role\":\"system\",\"content\":" + toJsonString(systemPrompt) + "}," +
                        "{\"role\":\"user\",\"content\":" + toJsonString(userMessage) + "}" +
                        "]}";

                    // Use the JDK's modern HttpClient (Java 11+) — no need
                    // for OkHttp / Apache HttpClient.
                    HttpClient client = HttpClient.newHttpClient();
                    HttpRequest apiRequest = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                    // Synchronous send — the React side has its own loading
                    // spinner, so blocking the request thread for ~2 sec is
                    // acceptable and keeps this code simple.
                    HttpResponse<String> apiResponse = client.send(apiRequest, HttpResponse.BodyHandlers.ofString());

                    // Pull the assistant's content out of Groq's response
                    // envelope and forward as-is to the React client.
                    String planJson = extractGroqText(apiResponse.body());
                    sendJsonResponse(exchange, planJson);
                } catch (Exception e) {
                    // Catch-all so a single malformed request can't crash
                    // the whole server. The frontend shows the message in a
                    // toast.
                    sendJsonResponse(exchange, "{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}", 500);
                }
            }
        });

        // ════════════════════════════════════════════════════════════════════
        //                       REP TRACKING (in-memory)
        // POST /api/workout/log-reps
        //
        // The React Workouts tab POSTs the user's per-set rep counts here so
        // the backend has a copy. We store the raw JSON body verbatim — the
        // frontend already has the structured data in localStorage, this list
        // mostly exists to demonstrate that the POST hits the server.
        // ════════════════════════════════════════════════════════════════════
        server.createContext("/api/workout/log-reps", exchange -> {
            configureCors(exchange);
            if ("OPTIONS".equals(exchange.getRequestMethod())) return;
            if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    String body = new String(exchange.getRequestBody().readAllBytes(), "UTF-8");
                    workoutRepLogs.add(body);
                    sendJsonResponse(exchange, "{\"status\":\"saved\",\"total\":" + workoutRepLogs.size() + "}");
                } catch (Exception e) {
                    sendJsonResponse(exchange, "{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}", 500);
                }
            }
        });

        // ════════════════════════════════════════════════════════════════════
        //                            UPC PRODUCTS
        // Three endpoints backed by UPCDatabase (NDJSON file). The React
        // Nutrition tab uses these so a barcode scanned once is recognized
        // forever, plus a "this product isn't in the database — would you
        // like to add it?" workflow for unknown UPCs.
        // ════════════════════════════════════════════════════════════════════

        // ──────────────────────────────────────────────────────────────────
        // GET /api/upc/lookup?upc=<code>
        //   200 + product JSON  on hit
        //   404 + {"found":false} on miss
        //   400 + {"found":false} when upc is empty
        // ──────────────────────────────────────────────────────────────────
        server.createContext("/api/upc/lookup", exchange -> {
            configureCors(exchange);
            if ("OPTIONS".equals(exchange.getRequestMethod())) return;
            if ("GET".equals(exchange.getRequestMethod())) {
                String upc = getQueryParam(exchange, "upc");
                if (upc.isEmpty()) {
                    sendJsonResponse(exchange, "{\"found\":false}", 400);
                    return;
                }
                String product = UPCDatabase.lookup(upc);
                if (product != null) {
                    sendJsonResponse(exchange, product, 200);
                } else {
                    sendJsonResponse(exchange, "{\"found\":false}", 404);
                }
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // POST /api/upc/save  (request body = ScannedProduct JSON)
        //   Appends one line to upc_products.json. Returns the running total.
        // ──────────────────────────────────────────────────────────────────
        server.createContext("/api/upc/save", exchange -> {
            configureCors(exchange);
            if ("OPTIONS".equals(exchange.getRequestMethod())) return;
            if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    String body = new String(exchange.getRequestBody().readAllBytes(), "UTF-8");
                    UPCDatabase.save(body);
                    sendJsonResponse(exchange, "{\"status\":\"saved\",\"total\":" + UPCDatabase.count() + "}");
                } catch (Exception e) {
                    sendJsonResponse(exchange, "{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}", 500);
                }
            }
        });

        // ──────────────────────────────────────────────────────────────────
        // GET /api/upc/all
        //   Returns every stored product as a JSON array. The frontend hits
        //   this once on mount to seed its local cache.
        // ──────────────────────────────────────────────────────────────────
        server.createContext("/api/upc/all", exchange -> {
            configureCors(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, UPCDatabase.getAllAsJsonArray());
            }
        });

        // ════════════════════════════════════════════════════════════════════
        //                          DAILY HERO IMAGES
        // GET /api/daily-images          → all 7 mappings as a JSON array
        // GET /api/daily-images?day=N    → single object for day N (0–6)
        //
        // Backed by DailyImagesDb (file-as-database). The Dashboard's
        // "Today's Workout" card calls the second form on mount, passing
        // `today.getDay()` so the photo changes by weekday.
        // ════════════════════════════════════════════════════════════════════
        server.createContext("/api/daily-images", exchange -> {
            configureCors(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) return;
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                String day = getQueryParam(exchange, "day");
                if (day != null && !day.isEmpty()) {
                    try {
                        int d = Integer.parseInt(day);
                        String url = DailyImagesDb.getByDay(d);
                        sendJsonResponse(exchange, "{\"day\":" + d + ",\"imageUrl\":\"" + url + "\"}");
                    } catch (NumberFormatException e) {
                        // Caller passed something that isn't an integer.
                        sendJsonResponse(exchange, "{\"error\":\"invalid day\"}", 400);
                    }
                } else {
                    sendJsonResponse(exchange, DailyImagesDb.getAllAsJson());
                }
            }
        });

        System.out.println("Java Logic Server started on port 8080...");
        server.start();
    }

    // ════════════════════════════════════════════════════════════════════════
    //                              HELPER METHODS
    // Pure utility code — request parsing, response writing, JSON wrangling.
    // None of these touch any of the data structures; they exist only to keep
    // the endpoint handlers above readable.
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Pulls a single query parameter out of the request URI.
     *
     * <p>For a request like {@code /api/workout/log?name=Bench+Press},
     * {@code getQueryParam(exchange, "name")} returns {@code "Bench Press"}.
     * The {@code "+"} → {@code " "} substitution covers the common
     * application/x-www-form-urlencoded encoding of spaces in URLs.</p>
     *
     * <p><b>Limitations</b> (acceptable for this project):</p>
     * <ul>
     *   <li>Does not decode percent-escapes (e.g. {@code %20} stays as
     *       {@code %20}). Callers either don't use them or pass simple ASCII.</li>
     *   <li>If the same key appears twice in the query string, returns the
     *       first occurrence.</li>
     * </ul>
     *
     * @param exchange the live HTTP exchange
     * @param key      the parameter name to look up
     * @return the parameter value, or {@code ""} if not present
     */
    private static String getQueryParam(HttpExchange exchange, String key) {
        String query = exchange.getRequestURI().getQuery();
        if (query != null) {
            // Query strings look like "a=1&b=2". split once on "&" then on "=".
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                if (pair.length > 1 && pair[0].equals(key)) {
                    return pair[1].replace("+", " ");
                }
            }
        }
        return "";
    }

    /**
     * Adds the CORS headers every endpoint needs, and short-circuits OPTIONS
     * preflight requests with a 204 No Content.
     *
     * <p>Browsers issue an OPTIONS preflight before any "non-simple" request
     * (any POST with a JSON body, for instance). If we don't answer that
     * preflight, the actual POST is never sent. The early return after the
     * 204 lets endpoint handlers safely add a {@code if (OPTIONS) return;}
     * line and skip their main work.</p>
     *
     * <p><b>Security note:</b> {@code Access-Control-Allow-Origin: *} is the
     * permissive setting suitable for local dev. A production deployment
     * should pin this to the deployed frontend's origin.</p>
     *
     * @param exchange the live HTTP exchange
     * @throws IOException if writing response headers fails
     */
    private static void configureCors(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.getResponseBody().close();
        }
    }

    /**
     * Convenience overload: sends a 200 OK JSON response.
     *
     * @param exchange the live HTTP exchange
     * @param json     the JSON body to send
     * @throws IOException if writing the response fails
     */
    private static void sendJsonResponse(HttpExchange exchange, String json) throws IOException {
        sendJsonResponse(exchange, json, 200);
    }

    /**
     * Sends a JSON response with an explicit status code.
     *
     * <p>Sets {@code Content-Type: application/json} and writes the body in
     * UTF-8. Closes the response stream, completing the request.</p>
     *
     * @param exchange the live HTTP exchange
     * @param json     the JSON body to send
     * @param code     HTTP status code (e.g. 200, 400, 404, 500)
     * @throws IOException if writing the response fails
     */
    private static void sendJsonResponse(HttpExchange exchange, String json, int code) throws IOException {
        byte[] response = json.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        // The second arg to sendResponseHeaders is the response body length.
        // Passing the exact byte count enables fixed-length transfer (no
        // chunked encoding) — slightly more efficient and required for
        // certain HTTP clients.
        exchange.sendResponseHeaders(code, response.length);
        OutputStream os = exchange.getResponseBody();
        os.write(response);
        os.close();
    }

    /**
     * Quotes a Java {@link String} as a JSON string literal.
     *
     * <p>Escapes the four control characters that would otherwise produce
     * invalid JSON: backslash, double-quote, newline, carriage return, tab.
     * Used when interpolating user-supplied or programmatically-built text
     * into the OpenAI-format request body for Groq.</p>
     *
     * @param s the raw string
     * @return the same string wrapped in double-quotes with control chars
     *         escaped — safe to drop directly into a JSON object
     */
    private static String toJsonString(String s) {
        return "\"" + s.replace("\\", "\\\\")
                       .replace("\"", "\\\"")
                       .replace("\n", "\\n")
                       .replace("\r", "\\r")
                       .replace("\t", "\\t") + "\"";
    }

    /**
     * Tiny hand-rolled JSON-string-value reader.
     *
     * <p>Given a JSON document and a key name, finds the first occurrence of
     * that key and returns the unescaped value. Handles backslash escapes
     * inside the string but does NOT handle nested quotes within objects, so
     * use this only for top-level string fields where the questionnaire's
     * predictable shape is guaranteed.</p>
     *
     * <p><b>Trade-off:</b> we deliberately don't pull in Jackson/Gson — the
     * 12 fields the questionnaire sends are flat top-level strings/arrays, so
     * a 20-line parser is sufficient and keeps the Maven dependency tree
     * empty.</p>
     *
     * @param json the full JSON body received in the POST
     * @param key  the field name to extract (without quotes)
     * @return the field's string value, or {@code ""} if not found
     */
    private static String extractJsonStringValue(String json, String key) {
        // Look for `"key"` exactly. Wrapping the key in quotes avoids matching
        // when the key name happens to appear as part of another value.
        String search = "\"" + key + "\"";
        int keyIdx = json.indexOf(search);
        if (keyIdx == -1) return "";

        // After the key, expect ':' then optional whitespace then '"'.
        int colonIdx = json.indexOf(":", keyIdx + search.length());
        if (colonIdx == -1) return "";
        int quoteStart = json.indexOf("\"", colonIdx + 1);
        if (quoteStart == -1) return "";

        // Walk character by character, honoring backslash escapes, until the
        // closing quote.
        int i = quoteStart + 1;
        StringBuilder sb = new StringBuilder();
        while (i < json.length()) {
            char c = json.charAt(i);
            if (c == '\\' && i + 1 < json.length()) {
                // Treat any escape as "include the next char literally".
                // Good enough because the frontend doesn't send fancy
                // escapes in questionnaire fields.
                sb.append(json.charAt(i + 1));
                i += 2;
                continue;
            }
            if (c == '"') break;   // unescaped quote = end of value
            sb.append(c);
            i++;
        }
        return sb.toString();
    }

    /**
     * Extracts a JSON array's contents as a comma-separated string with the
     * surrounding brackets and quotes removed. Used specifically for the
     * {@code workoutDays} array on the questionnaire.
     *
     * <p>Example input fragment: {@code "workoutDays":["Mon","Wed","Fri"]} →
     * returns {@code "Mon,Wed,Fri"} (trimmed, no quotes).</p>
     *
     * @param json the full JSON body
     * @param key  the array's key name
     * @return comma-joined values without quotes, or {@code ""} if the key
     *         or the array brackets are missing
     */
    private static String extractJsonArrayAsString(String json, String key) {
        String search = "\"" + key + "\"";
        int keyIdx = json.indexOf(search);
        if (keyIdx < 0) return "";
        int arrStart = json.indexOf('[', keyIdx);
        int arrEnd = json.indexOf(']', arrStart);
        if (arrStart < 0 || arrEnd < 0) return "";
        // Strip the opening/closing brackets, then drop quotes around each
        // string element. Final form is suitable for direct concatenation
        // into the user-prompt string for Groq.
        String arrContent = json.substring(arrStart + 1, arrEnd);
        return arrContent.replace("\"", "").trim();
    }

    /**
     * Pulls the assistant's message content out of a Groq chat-completions
     * response.
     *
     * <p>Groq's API mirrors OpenAI's response shape:</p>
     * <pre>
     *   {"choices":[
     *      {"message":{"role":"assistant","content":"...the JSON we want..."}},
     *      ...
     *   ]}
     * </pre>
     *
     * <p>We locate {@code "choices":}, then {@code "content":"} after it, and
     * read the string up to the closing quote, decoding the four common
     * backslash escapes ({@code \"}, {@code \\}, {@code \n}, {@code \t}) and
     * dropping {@code \r} entirely. The decoded payload is itself JSON (the
     * weekly plan), which we forward to the React client unchanged.</p>
     *
     * @param responseBody the raw HTTP body from Groq
     * @return the decoded assistant content, or an error JSON if the
     *         envelope is malformed
     */
    private static String extractGroqText(String responseBody) {
        int choicesIdx = responseBody.indexOf("\"choices\":");
        if (choicesIdx == -1) return "{\"error\":\"No choices in response\"}";
        String contentKey = "\"content\":\"";
        int contentIdx = responseBody.indexOf(contentKey, choicesIdx);
        if (contentIdx == -1) return "{\"error\":\"No content in response\"}";

        int start = contentIdx + contentKey.length();
        StringBuilder sb = new StringBuilder();
        int i = start;

        // Walk character by character — same approach as
        // extractJsonStringValue, but with full escape decoding because the
        // assistant's content can contain real quotes / newlines.
        while (i < responseBody.length()) {
            char c = responseBody.charAt(i);
            if (c == '\\' && i + 1 < responseBody.length()) {
                char next = responseBody.charAt(i + 1);
                if (next == '"')  { sb.append('"');  i += 2; continue; }
                if (next == 'n')  { sb.append('\n'); i += 2; continue; }
                if (next == '\\') { sb.append('\\'); i += 2; continue; }
                if (next == 't')  { sb.append('\t'); i += 2; continue; }
                if (next == 'r')  {                  i += 2; continue; }  // drop \r
            }
            if (c == '"') break;  // unescaped quote = end of content string
            sb.append(c);
            i++;
        }
        return sb.toString();
    }
}
