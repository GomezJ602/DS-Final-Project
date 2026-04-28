package com.fitnesspro.model;

/**
 * Represents a physical exercise within the fitness application.
 * This class serves as the base data model for workout logging and library systems.
 *
 * @author GomezJ602
 * @version 1.0
 */
public class Exercise {
    private String name;
    private String category;
    private String difficulty; // Changed to String to match UI (Beginner, Intermediate, Advanced)
    private String instructions;
    private String duration;
    private int calories;
    private String image;
    private String description;

    /**
     * Constructs a new Exercise with specified details.
     */
    public Exercise(String name, String category, String difficulty, String duration, int calories, String image, String description, String instructions) {
        this.name = name;
        this.category = category;
        this.difficulty = difficulty;
        this.duration = duration;
        this.calories = calories;
        this.image = image;
        this.description = description;
        this.instructions = instructions;
    }

    // Getters
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getDifficulty() { return difficulty; }
    public String getInstructions() { return instructions; }
    public String getDuration() { return duration; }
    public int getCalories() { return calories; }
    public String getImage() { return image; }
    public String getDescription() { return description; }

    @Override
    public String toString() {
        return String.format("%s [%s] - %s", name, category, difficulty);
    }

    /**
     * Converts the Exercise object to a JSON string for API transmission.
     * @return JSON representation of the exercise.
     */
    public String toJson() {
        return String.format("{\"name\":\"%s\", \"category\":\"%s\", \"difficulty\":\"%s\", \"duration\":\"%s\", \"calories\":%d, \"image\":\"%s\", \"description\":\"%s\", \"instructions\":\"%s\"}",
                escape(name), escape(category), escape(difficulty), escape(duration), calories, escape(image), escape(description), escape(instructions));
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
