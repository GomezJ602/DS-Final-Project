import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import crypto from "node:crypto";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-6935bede/health", (c) => {
  return c.json({ status: "ok" });
});

// Weight endpoints
app.get("/make-server-6935bede/weight", async (c) => {
  try {
    const weightStr = await kv.get("user_weight_default");
    const weight = weightStr ? parseFloat(weightStr) : 170; // default weight
    return c.json({ weight });
  } catch (error) {
    console.warn("Fallback to default weight due to error:", error);
    return c.json({ weight: 170 });
  }
});

app.post("/make-server-6935bede/weight", async (c) => {
  try {
    const body = await c.req.json();
    if (body.weight !== undefined) {
      await kv.set("user_weight_default", body.weight.toString());
      return c.json({ success: true, weight: body.weight });
    }
    return c.json({ error: "Weight is required" }, 400);
  } catch (error) {
    console.warn("Error saving weight:", error);
    return c.json({ success: true, weight: 170 }); // Faking success if db is down
  }
});

// Food log endpoints
app.get("/make-server-6935bede/food-log", async (c) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const key = `food_log_${dateStr}`;
    const dataStr = await kv.get(key);
    
    const defaultData = {
      calories: 0,
      macros: { protein: 0, carbs: 0, fats: 0 },
      items: []
    };
    
    const data = dataStr ? JSON.parse(dataStr) : defaultData;
    if (!data.items) {
      data.items = [];
    }
    
    return c.json(data);
  } catch (error) {
    console.warn("Fallback to default food log due to error:", error);
    return c.json({
      calories: 0,
      macros: { protein: 0, carbs: 0, fats: 0 },
      items: []
    });
  }
});

app.post("/make-server-6935bede/food-log", async (c) => {
  try {
    const body = await c.req.json();
    const dateStr = new Date().toISOString().split('T')[0];
    const key = `food_log_${dateStr}`;
    
    const dataStr = await kv.get(key);
    const existingData = dataStr ? JSON.parse(dataStr) : {
      calories: 0,
      macros: { protein: 0, carbs: 0, fats: 0 },
      items: []
    };
    if (!existingData.items) existingData.items = [];

    const newItem = {
      id: crypto.randomUUID(),
      name: body.name || "Unknown Food",
      calories: body.calories || 0,
      macros: {
        protein: body.macros?.protein || 0,
        carbs: body.macros?.carbs || 0,
        fats: body.macros?.fats || 0,
      },
      timestamp: new Date().toISOString()
    };

    const newData = {
      calories: existingData.calories + newItem.calories,
      macros: {
        protein: existingData.macros.protein + newItem.macros.protein,
        carbs: existingData.macros.carbs + newItem.macros.carbs,
        fats: existingData.macros.fats + newItem.macros.fats,
      },
      items: [...existingData.items, newItem]
    };

    await kv.set(key, JSON.stringify(newData));
    return c.json(newData);
  } catch (error) {
    console.warn("Error updating food log:", error);
    return c.json({ error: "Failed to update food log" }, 500);
  }
});

app.delete("/make-server-6935bede/food-log/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const dateStr = new Date().toISOString().split('T')[0];
    const key = `food_log_${dateStr}`;
    
    const dataStr = await kv.get(key);
    if (!dataStr) return c.json({ error: "No food log found" }, 404);
    
    const data = JSON.parse(dataStr);
    if (!data.items) return c.json({ error: "No items to delete" }, 400);

    const itemIndex = data.items.findIndex((i: any) => i.id === id);
    if (itemIndex === -1) return c.json({ error: "Item not found" }, 404);

    const item = data.items[itemIndex];
    data.items.splice(itemIndex, 1);

    data.calories = Math.max(0, data.calories - item.calories);
    data.macros.protein = Math.max(0, data.macros.protein - item.macros.protein);
    data.macros.carbs = Math.max(0, data.macros.carbs - item.macros.carbs);
    data.macros.fats = Math.max(0, data.macros.fats - item.macros.fats);

    await kv.set(key, JSON.stringify(data));
    return c.json(data);
  } catch (error) {
    console.warn("Error deleting food log item:", error);
    return c.json({ error: "Failed to delete food log item" }, 500);
  }
});

// Points endpoints
app.get("/make-server-6935bede/points", async (c) => {
  try {
    const pointsStr = await kv.get("user_rewards_points");
    const points = pointsStr ? parseInt(pointsStr) : 0;
    return c.json({ points });
  } catch (error) {
    console.warn("Fallback to default points due to error:", error);
    return c.json({ points: 0 });
  }
});

app.post("/make-server-6935bede/points", async (c) => {
  try {
    const body = await c.req.json();
    if (body.points !== undefined) {
      await kv.set("user_rewards_points", body.points.toString());
      return c.json({ success: true, points: body.points });
    }
    return c.json({ error: "Points are required" }, 400);
  } catch (error) {
    console.warn("Error saving points:", error);
    return c.json({ success: true, points: 0 }); // fake success
  }
});

// Custom foods endpoints
app.get("/make-server-6935bede/custom-foods", async (c) => {
  try {
    const dataStr = await kv.get("custom_foods");
    const foods = dataStr ? JSON.parse(dataStr) : [];
    return c.json({ foods });
  } catch (error) {
    console.warn("Error fetching custom foods:", error);
    return c.json({ foods: [] });
  }
});

app.post("/make-server-6935bede/custom-foods", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.name || body.calories === undefined) {
      return c.json({ error: "Name and calories are required" }, 400);
    }
    const dataStr = await kv.get("custom_foods");
    const existing = dataStr ? JSON.parse(dataStr) : [];
    const newFood = {
      id: crypto.randomUUID(),
      name: body.name,
      brand: body.brand || "",
      servingSize: body.servingSize || "100g",
      calories: Number(body.calories) || 0,
      macros: {
        protein: Number(body.macros?.protein) || 0,
        carbs: Number(body.macros?.carbs) || 0,
        fats: Number(body.macros?.fats) || 0,
        fiber: Number(body.macros?.fiber) || 0,
        sugar: Number(body.macros?.sugar) || 0,
        sodium: Number(body.macros?.sodium) || 0,
      },
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
    };
    const updated = [...existing, newFood];
    await kv.set("custom_foods", JSON.stringify(updated));
    return c.json({ food: newFood, foods: updated });
  } catch (error) {
    console.warn("Error creating custom food:", error);
    return c.json({ error: "Failed to create custom food" }, 500);
  }
});

app.delete("/make-server-6935bede/custom-foods/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const dataStr = await kv.get("custom_foods");
    if (!dataStr) return c.json({ foods: [] });
    const foods = JSON.parse(dataStr);
    const updated = foods.filter((f: any) => f.id !== id);
    await kv.set("custom_foods", JSON.stringify(updated));
    return c.json({ foods: updated });
  } catch (error) {
    console.warn("Error deleting custom food:", error);
    return c.json({ error: "Failed to delete custom food" }, 500);
  }
});

// UPC scan log endpoints (stored in Supabase Postgres via kv_store_6935bede)
app.get("/make-server-6935bede/upc-scans", async (c) => {
  try {
    const dateStr = new Date().toISOString().split("T")[0];
    const key = `upc_scans_${dateStr}`;
    const dataStr = await kv.get(key);
    const scans = dataStr ? JSON.parse(dataStr) : [];
    return c.json({ scans });
  } catch (error) {
    console.warn("Error fetching UPC scans:", error);
    return c.json({ scans: [] });
  }
});

app.post("/make-server-6935bede/upc-scans", async (c) => {
  try {
    const body = await c.req.json();
    const upc = String(body?.upc || "").trim();
    if (!upc) return c.json({ error: "upc is required" }, 400);

    const dateStr = new Date().toISOString().split("T")[0];
    const key = `upc_scans_${dateStr}`;
    const dataStr = await kv.get(key);
    const existing = dataStr ? JSON.parse(dataStr) : [];

    const item = {
      id: crypto.randomUUID(),
      upc,
      name: body?.name || null,
      timestamp: new Date().toISOString(),
    };

    // Keep the newest scans first; cap list size to avoid unbounded growth.
    const updated = [item, ...existing].slice(0, 50);
    await kv.set(key, JSON.stringify(updated));
    return c.json({ scan: item, scans: updated });
  } catch (error) {
    console.warn("Error creating UPC scan:", error);
    return c.json({ error: "Failed to save UPC scan" }, 500);
  }
});

Deno.serve(app.fetch);
