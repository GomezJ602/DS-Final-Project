package com.fitnesspro.api;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import com.fitnesspro.logic.*;
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
 * The bridge between the React frontend and Java Data Structures.
 * Every button click in the UI sends a request here.
 * 
 * @author GomezJ602
 */
public class BackendServer {
    private static ExerciseLibrary library = new ExerciseLibrary();
    private static WorkoutHistory history = new WorkoutHistory();
    private static CircuitManager circuit = new CircuitManager();

    /**
     * Entry point for the Java Backend Server.
     * Initializes the HTTP server and defines endpoints for all data structure operations.
     * 
     * @param args Command line arguments
     * @throws IOException If the server fails to start
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

        // GET all exercises (Library - HashMap)
        server.createContext("/api/exercises", exchange -> {
            configureCors(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                List<Exercise> all = library.getAllExercises();
                String json = "[" + all.stream().map(Exercise::toJson).collect(Collectors.joining(",")) + "]";
                sendJsonResponse(exchange, json);
            }
        });

        // POST log workout (Stack - LIFO push)
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

        // POST undo workout (Stack - LIFO pop)
        server.createContext("/api/workout/undo", exchange -> {
            configureCors(exchange);
            if ("POST".equals(exchange.getRequestMethod())) {
                Exercise removed = history.undoLastExercise();
                sendJsonResponse(exchange, removed != null ? removed.toJson() : "{}");
            }
        });

        // GET workout history (Stack - LIFO)
        server.createContext("/api/workout/history", exchange -> {
            configureCors(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                List<Exercise> all = history.getHistoryList();
                String json = "[" + all.stream().map(Exercise::toJson).collect(Collectors.joining(",")) + "]";
                sendJsonResponse(exchange, json);
            }
        });

        // GET summary stats (Calculated from Stack)
        server.createContext("/api/stats", exchange -> {
            configureCors(exchange);
            if ("GET".equals(exchange.getRequestMethod())) {
                List<Exercise> all = history.getHistoryList();
                int totalCalories = all.stream().mapToInt(Exercise::getCalories).sum();
                int totalWorkouts = all.size();
                String json = String.format("{\"calories\":%d, \"workouts\":%d}", totalCalories, totalWorkouts);
                sendJsonResponse(exchange, json);
            }
        });

        // POST add to circuit (Queue - FIFO add)
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

        // POST next in circuit (Queue - FIFO poll)
        server.createContext("/api/circuit/next", exchange -> {
            configureCors(exchange);
            if ("POST".equals(exchange.getRequestMethod())) {
                Exercise next = circuit.nextExercise();
                sendJsonResponse(exchange, next != null ? next.toJson() : "{}");
            }
        });

        // GET search (Binary Search)
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

        // POST AI workout plan (Groq API proxy)
        server.createContext("/api/ai/workout-plan", exchange -> {
            configureCors(exchange);
            if ("OPTIONS".equals(exchange.getRequestMethod())) return;
            if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    String body = new String(exchange.getRequestBody().readAllBytes(), "UTF-8");
                    String height = extractJsonStringValue(body, "height");
                    String weight = extractJsonStringValue(body, "weight");
                    String goals = extractJsonStringValue(body, "goals");

                    String apiKey = System.getenv("GROQ_API_KEY");
                    if (apiKey == null || apiKey.isEmpty()) {
                        sendJsonResponse(exchange, "{\"error\":\"GROQ_API_KEY not set\"}", 500);
                        return;
                    }

                    String systemPrompt = "You are an expert personal fitness coach. Given a user's stats and goals, create a personalized workout plan. Respond ONLY with valid JSON in this exact format, with no markdown or extra text: {\"title\": \"program name here\", \"workout\": \"detailed workout routine description here\", \"nutrition\": \"nutrition guidance here\", \"classes\": \"recommended class types here\", \"circuit\": [{\"name\": \"Exercise 1\", \"muscle\": \"Target Muscle\", \"sets\": 3, \"reps\": \"8-12\"}, {\"name\": \"Exercise 2\", \"muscle\": \"Target Muscle\", \"sets\": 3, \"reps\": \"8-12\"}, {\"name\": \"Exercise 3\", \"muscle\": \"Target Muscle\", \"sets\": 3, \"reps\": \"8-12\"}, {\"name\": \"Exercise 4\", \"muscle\": \"Target Muscle\", \"sets\": 3, \"reps\": \"8-12\"}, {\"name\": \"Exercise 5\", \"muscle\": \"Target Muscle\", \"sets\": 3, \"reps\": \"8-12\"}, {\"name\": \"Exercise 6\", \"muscle\": \"Target Muscle\", \"sets\": 3, \"reps\": \"8-12\"}]}. The circuit array must contain exactly 6 exercises tailored to the user's goals. For cardio or flexibility exercises use a time-based reps format like '30 sec' or '1 min'. Keep sets between 2-4 based on intensity.";
                    String userMessage = "Height: " + height + ", Weight: " + weight + " lbs\nGoals: " + goals;

                    String requestBody = "{\"model\":\"llama-3.3-70b-versatile\",\"max_tokens\":1024," +
                        "\"messages\":[" +
                        "{\"role\":\"system\",\"content\":" + toJsonString(systemPrompt) + "}," +
                        "{\"role\":\"user\",\"content\":" + toJsonString(userMessage) + "}" +
                        "]}";

                    HttpClient client = HttpClient.newHttpClient();
                    HttpRequest apiRequest = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                    HttpResponse<String> apiResponse = client.send(apiRequest, HttpResponse.BodyHandlers.ofString());
                    String planJson = extractGroqText(apiResponse.body());
                    sendJsonResponse(exchange, planJson);
                } catch (Exception e) {
                    sendJsonResponse(exchange, "{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}", 500);
                }
            }
        });

        System.out.println("Java Logic Server started on port 8080...");
        server.start();
    }

    /**
     * Extracts a query parameter value from the request URI.
     * 
     * @param exchange The HttpExchange containing the request
     * @param key      The parameter key to look for
     * @return The parameter value, or an empty string if not found
     */
    private static String getQueryParam(HttpExchange exchange, String key) {
        String query = exchange.getRequestURI().getQuery();
        if (query != null) {
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
     * Configures Cross-Origin Resource Sharing (CORS) headers to allow the React frontend
     * to communicate with this Java server.
     * 
     * @param exchange The HttpExchange to configure
     * @throws IOException If response headers cannot be sent
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
     * Sends a JSON response with a 200 OK status code.
     * 
     * @param exchange The HttpExchange to respond to
     * @param json     The JSON string content
     * @throws IOException If sending the response fails
     */
    private static void sendJsonResponse(HttpExchange exchange, String json) throws IOException {
        sendJsonResponse(exchange, json, 200);
    }

    /**
     * Sends a JSON response with a specified HTTP status code.
     * 
     * @param exchange The HttpExchange to respond to
     * @param json     The JSON string content
     * @param code     The HTTP status code (e.g., 200, 404)
     * @throws IOException If sending the response fails
     */
    private static void sendJsonResponse(HttpExchange exchange, String json, int code) throws IOException {
        byte[] response = json.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(code, response.length);
        OutputStream os = exchange.getResponseBody();
        os.write(response);
        os.close();
    }

    private static String toJsonString(String s) {
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t") + "\"";
    }

    private static String extractJsonStringValue(String json, String key) {
        String search = "\"" + key + "\"";
        int keyIdx = json.indexOf(search);
        if (keyIdx == -1) return "";
        int colonIdx = json.indexOf(":", keyIdx + search.length());
        if (colonIdx == -1) return "";
        int quoteStart = json.indexOf("\"", colonIdx + 1);
        if (quoteStart == -1) return "";
        int i = quoteStart + 1;
        StringBuilder sb = new StringBuilder();
        while (i < json.length()) {
            char c = json.charAt(i);
            if (c == '\\' && i + 1 < json.length()) { sb.append(json.charAt(i + 1)); i += 2; continue; }
            if (c == '"') break;
            sb.append(c);
            i++;
        }
        return sb.toString();
    }

    private static String extractGroqText(String responseBody) {
        // Extract text from Groq response: {"choices":[{"message":{"content":"..."}},...]}
        int choicesIdx = responseBody.indexOf("\"choices\":");
        if (choicesIdx == -1) return "{\"error\":\"No choices in response\"}";
        String contentKey = "\"content\":\"";
        int contentIdx = responseBody.indexOf(contentKey, choicesIdx);
        if (contentIdx == -1) return "{\"error\":\"No content in response\"}";
        int start = contentIdx + contentKey.length();
        StringBuilder sb = new StringBuilder();
        int i = start;
        while (i < responseBody.length()) {
            char c = responseBody.charAt(i);
            if (c == '\\' && i + 1 < responseBody.length()) {
                char next = responseBody.charAt(i + 1);
                if (next == '"') { sb.append('"'); i += 2; continue; }
                if (next == 'n') { sb.append('\n'); i += 2; continue; }
                if (next == '\\') { sb.append('\\'); i += 2; continue; }
                if (next == 't') { sb.append('\t'); i += 2; continue; }
                if (next == 'r') { i += 2; continue; }
            }
            if (c == '"') break;
            sb.append(c);
            i++;
        }
        return sb.toString();
    }
}
