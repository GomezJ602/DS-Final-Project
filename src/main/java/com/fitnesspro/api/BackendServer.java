package com.fitnesspro.api;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import com.fitnesspro.logic.*;
import com.fitnesspro.model.Exercise;
import java.io.*;
import java.net.InetSocketAddress;
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
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

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
}
