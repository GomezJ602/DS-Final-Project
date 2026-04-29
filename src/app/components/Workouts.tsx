import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Clock, Zap, Target, Play, Sparkles, Bot, ArrowRight, Activity, Utensils,
  Calendar, Settings, MessageSquarePlus, CheckCircle2, RefreshCw, RotateCcw,
  SkipForward, X, ListChecks,
} from "lucide-react";
import { ImageWithFallback } from "./common/ImageWithFallback";

interface CircuitTask {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  setsCompleted: boolean[];
  skipped: boolean;
}

export default function Workouts() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentCircuitExercise, setCurrentCircuitExercise] = useState<any>(null);

  // Circuit state
  const [circuitTasks, setCircuitTasks] = useState<CircuitTask[]>([]);
  const [swapIndex, setSwapIndex] = useState(-1);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/exercises");
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error("Error fetching exercises from Java backend:", error);
      }
    };
    fetchExercises();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8080/api/search?name=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResult(data.name ? data : { error: "No exercise found with that name." });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const logWorkout = async (name: string) => {
    try {
      await fetch(`http://localhost:8080/api/workout/log?name=${encodeURIComponent(name)}`, { method: "POST" });
      alert(`Logged ${name} to Java WorkoutHistory (Stack)!`);
    } catch (error) {
      console.error("Log error:", error);
    }
  };

  const undoWorkout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/workout/undo", { method: "POST" });
      const data = await response.json();
      alert(data.name ? `Undo successful! Removed ${data.name} from Java Stack.` : "Nothing to undo in Java history.");
    } catch (error) {
      console.error("Undo error:", error);
    }
  };

  const addToCircuit = async (name: string) => {
    try {
      await fetch(`http://localhost:8080/api/circuit/add?name=${encodeURIComponent(name)}`, { method: "POST" });
      alert(`Added ${name} to Java Circuit (Queue)!`);
    } catch (error) {
      console.error("Circuit add error:", error);
    }
  };

  const nextCircuit = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/circuit/next", { method: "POST" });
      const data = await response.json();
      if (data.name) {
        setCurrentCircuitExercise(data);
      } else {
        setCurrentCircuitExercise(null);
        alert("Java Circuit Queue is empty!");
      }
    } catch (error) {
      console.error("Circuit next error:", error);
    }
  };

  // Circuit task functions
  function toggleSet(taskIdx: number, setIdx: number) {
    setCircuitTasks(prev => {
      const updated = prev.map((t, i) => {
        if (i !== taskIdx) return t;
        const setsCompleted = [...t.setsCompleted];
        setsCompleted[setIdx] = !setsCompleted[setIdx];
        return { ...t, setsCompleted };
      });
      localStorage.setItem("ironcore_circuit_tasks", JSON.stringify(updated));
      return updated;
    });
  }

  function skipTask(taskIdx: number) {
    setCircuitTasks(prev => {
      const updated = prev.map((t, i) => i === taskIdx ? { ...t, skipped: true } : t);
      localStorage.setItem("ironcore_circuit_tasks", JSON.stringify(updated));
      return updated;
    });
  }

  function swapTask(taskIdx: number, exercise: any) {
    setCircuitTasks(prev => {
      const updated = prev.map((t, i) => i !== taskIdx ? t : {
        name: exercise.name,
        muscle: exercise.category,
        sets: 3,
        reps: "8-12",
        setsCompleted: [false, false, false],
        skipped: false,
      });
      localStorage.setItem("ironcore_circuit_tasks", JSON.stringify(updated));
      return updated;
    });
    setSwapIndex(-1);
  }

  function resetCircuit() {
    if (!aiRecommendation?.circuit) return;
    const tasks = buildCircuitTasks(aiRecommendation.circuit);
    setCircuitTasks(tasks);
    localStorage.setItem("ironcore_circuit_tasks", JSON.stringify(tasks));
    setSwapIndex(-1);
  }

  function buildCircuitTasks(circuitData: any[]): CircuitTask[] {
    return circuitData.map(t => ({
      name: t.name || "Exercise",
      muscle: t.muscle || "Full Body",
      sets: typeof t.sets === "number" ? t.sets : 3,
      reps: t.reps || "8-12",
      setsCompleted: Array(typeof t.sets === "number" ? t.sets : 3).fill(false),
      skipped: false,
    }));
  }

  // AI Wizard state
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [userHeight, setUserHeight] = useState("");
  const [userWeight, setUserWeight] = useState("");
  const [userGoalPrompt, setUserGoalPrompt] = useState("");
  const [hasSetMetrics, setHasSetMetrics] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    title: string;
    prompt: string;
    workout: string;
    nutrition: string;
    classes: string;
    circuit?: any[];
  } | null>(null);

  // Progress Check-In state
  const [showProgressCheckIn, setShowProgressCheckIn] = useState(false);
  const [nutritionProgress, setNutritionProgress] = useState("");
  const [workoutProgress, setWorkoutProgress] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  useEffect(() => {
    const savedHeight = localStorage.getItem("ironcore_user_height");
    const savedWeight = localStorage.getItem("ironcore_user_weight");
    const savedRec = localStorage.getItem("ironcore_ai_rec");
    const savedCircuit = localStorage.getItem("ironcore_circuit_tasks");

    if (savedHeight && savedWeight) {
      setUserHeight(savedHeight);
      setUserWeight(savedWeight);
      setHasSetMetrics(true);
    }

    if (savedRec) {
      try {
        const rec = JSON.parse(savedRec);
        setAiRecommendation(rec);
        // Load saved circuit progress; if none, build fresh from rec
        if (savedCircuit) {
          setCircuitTasks(JSON.parse(savedCircuit));
        } else if (rec.circuit?.length) {
          const tasks = buildCircuitTasks(rec.circuit);
          setCircuitTasks(tasks);
          localStorage.setItem("ironcore_circuit_tasks", JSON.stringify(tasks));
        }
      } catch (e) {}
    } else {
      setShowAIWizard(true);
    }
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiFeedback(null);

    localStorage.setItem("ironcore_user_height", userHeight);
    localStorage.setItem("ironcore_user_weight", userWeight);
    setHasSetMetrics(true);

    try {
      const response = await fetch("http://localhost:8080/api/ai/workout-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height: userHeight, weight: userWeight, goals: userGoalPrompt }),
      });

      const data = await response.json();
      if (data.error) { alert("AI error: " + data.error); return; }

      const rec = { ...data, prompt: userGoalPrompt };
      setAiRecommendation(rec);
      localStorage.setItem("ironcore_ai_rec", JSON.stringify(rec));

      // Build and reset circuit from new recommendation
      if (rec.circuit && Array.isArray(rec.circuit) && rec.circuit.length > 0) {
        const tasks = buildCircuitTasks(rec.circuit.slice(0, 6));
        setCircuitTasks(tasks);
        localStorage.setItem("ironcore_circuit_tasks", JSON.stringify(tasks));
      }

      setSwapIndex(-1);
      setShowAIWizard(false);
    } catch (error) {
      console.error("AI analysis error:", error);
      alert("Failed to generate plan. Make sure the Java server is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCheckIn = () => {
    setIsCheckingIn(true);
    setTimeout(() => {
      setIsCheckingIn(false);
      setShowProgressCheckIn(false);
      setAiFeedback(`Great job checking in! Based on your nutrition update ("${nutritionProgress}") and workout progress ("${workoutProgress}"), I've lightly adjusted your plan below to ensure you avoid plateaus and recover adequately. Keep up the solid momentum!`);
      setAiRecommendation(prev => {
        if (!prev) return null;
        const newRec = {
          ...prev,
          workout: prev.workout.replace(/\(.*\)/, "") + " (Adjusted based on check-in: Added 1 active recovery day and refined intensity).",
          nutrition: prev.nutrition.replace(/\(.*\)/, "") + " (Adjusted macros: slightly increased protein to support recovery based on your report).",
        };
        localStorage.setItem("ironcore_ai_rec", JSON.stringify(newRec));
        return newRec;
      });
      setNutritionProgress("");
      setWorkoutProgress("");
    }, 1500);
  };

  const filteredWorkouts = selectedCategory === "all"
    ? exercises
    : exercises.filter(w => w.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const completedCount = circuitTasks.filter(t => t.setsCompleted.every(Boolean) || t.skipped).length;
  const doneCount = circuitTasks.filter(t => t.setsCompleted.every(Boolean)).length;

  return (
    <div className="p-8 dark:bg-black min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Workout Plans</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Choose a workout that fits your goals and schedule</p>
        </div>
        {!showAIWizard && !aiRecommendation && (
          <Button
            onClick={() => setShowAIWizard(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-md transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get AI Recommendation
          </Button>
        )}
      </div>

      {/* AI Wizard */}
      {showAIWizard && (
        <Card className="mb-8 p-6 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-inner">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
              <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {aiRecommendation ? "Adjust Your Goals" : "AI Workout Coach"}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1 max-w-2xl">
                {hasSetMetrics
                  ? "Update your desired goals below, and I'll generate a fresh timeline and recommendation for you."
                  : "Tell me your height, weight, and in your own words what physique or goals you're looking to achieve. I'll build you a dedicated program."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 mb-8">
            {!hasSetMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height" className="dark:text-zinc-300">Height</Label>
                  <Input id="height" placeholder="e.g., 5'10&quot; or 178cm" value={userHeight} onChange={e => setUserHeight(e.target.value)} className="bg-white dark:bg-black dark:border-zinc-800 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="dark:text-zinc-300">Weight</Label>
                  <Input id="weight" placeholder="e.g., 170 lbs or 77kg" value={userWeight} onChange={e => setUserWeight(e.target.value)} className="bg-white dark:bg-black dark:border-zinc-800 dark:text-white" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <Label htmlFor="goalPrompt" className="dark:text-zinc-300">Describe your goals</Label>
                {hasSetMetrics && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Profile: {userHeight}, {userWeight}
                  </span>
                )}
              </div>
              <Input id="goalPrompt" placeholder="e.g., I'm looking to get fit and lean, or I want to learn calisthenics" value={userGoalPrompt} onChange={e => setUserGoalPrompt(e.target.value)} className="bg-white dark:bg-black dark:border-zinc-800 dark:text-white" />
            </div>
            {hasSetMetrics && (
              <div className="flex items-center justify-start mt-[-10px]">
                <Button variant="link" onClick={() => setHasSetMetrics(false)} className="text-indigo-600 dark:text-indigo-400 p-0 h-auto font-medium">
                  Edit Height & Weight
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setShowAIWizard(false); if (!aiRecommendation && !hasSetMetrics) { setUserHeight(""); setUserWeight(""); setUserGoalPrompt(""); } }} className="dark:text-zinc-300 dark:hover:bg-zinc-800">
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]" disabled={!userHeight || !userWeight || !userGoalPrompt || isAnalyzing} onClick={handleAnalyze}>
              {isAnalyzing ? (
                <span className="flex items-center"><Activity className="w-4 h-4 mr-2 animate-pulse" />Analyzing...</span>
              ) : (
                <span className="flex items-center">{aiRecommendation ? "Update Plan" : "Generate Plan"}<ArrowRight className="w-4 h-4 ml-2" /></span>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* AI Recommendation Card */}
      {aiRecommendation && !showAIWizard && (
        <Card className="mb-8 p-6 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">{aiRecommendation.title}</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                  Based on your profile ({userHeight}, {userWeight}) and goal: "{aiRecommendation.prompt}"
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowProgressCheckIn(!showProgressCheckIn)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/30 text-xs md:text-sm">
                <MessageSquarePlus className="w-4 h-4 mr-2" />Progress Check-In
              </Button>
              <Button variant="outline" onClick={() => setShowAIWizard(true)} className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 text-xs md:text-sm">
                <Settings className="w-4 h-4 mr-2" />Change Goals
              </Button>
            </div>
          </div>

          {showProgressCheckIn && (
            <div className="mb-6 p-4 md:p-5 bg-white dark:bg-black rounded-xl border border-indigo-100 dark:border-indigo-900/40 relative z-10 shadow-sm animate-in slide-in-from-top-2 duration-200">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center">
                <Bot className="w-4 h-4 mr-2 text-indigo-500" />How are you feeling about your plan?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="nutrition-progress" className="dark:text-zinc-300 text-sm">Nutrition Progress</Label>
                  <Input id="nutrition-progress" placeholder="e.g., Struggling with protein, feeling hungry..." value={nutritionProgress} onChange={e => setNutritionProgress(e.target.value)} className="bg-zinc-50 dark:bg-black dark:border-zinc-800 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workout-progress" className="dark:text-zinc-300 text-sm">Workout Progress</Label>
                  <Input id="workout-progress" placeholder="e.g., Workouts feel great, slightly sore..." value={workoutProgress} onChange={e => setWorkoutProgress(e.target.value)} className="bg-zinc-50 dark:bg-black dark:border-zinc-800 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowProgressCheckIn(false)}>Cancel</Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={(!nutritionProgress && !workoutProgress) || isCheckingIn} onClick={handleCheckIn}>
                  {isCheckingIn ? "Analyzing..." : "Submit Check-In"}
                </Button>
              </div>
            </div>
          )}

          {aiFeedback && !showProgressCheckIn && (
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl relative z-10">
              <div className="flex gap-3">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">{aiFeedback}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <Card className="p-5 border-none shadow-sm dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                <Activity className="w-5 h-5" /><h3 className="font-semibold text-lg">Workout Routine</h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{aiRecommendation.workout}</p>
            </Card>
            <Card className="p-5 border-none shadow-sm dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                <Utensils className="w-5 h-5" /><h3 className="font-semibold text-lg">Nutrition Guide</h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{aiRecommendation.nutrition}</p>
            </Card>
            <Card className="p-5 border-none shadow-sm dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
                <Calendar className="w-5 h-5" /><h3 className="font-semibold text-lg">Suggested Classes</h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{aiRecommendation.classes}</p>
            </Card>
          </div>
        </Card>
      )}

      {/* ── TODAY'S CIRCUIT ─────────────────────────────────────── */}
      {aiRecommendation && circuitTasks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-500" />
                Today's Circuit
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Complete as many exercises as you can — you don't need to do them all.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {doneCount}/{circuitTasks.length} done
              </span>
              <Button variant="outline" size="sm" onClick={resetCircuit} className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 text-xs">
                <RotateCcw className="w-3 h-3 mr-1.5" />Reset
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${circuitTasks.length ? (doneCount / circuitTasks.length) * 100 : 0}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {circuitTasks.map((task, idx) => {
              const allSetsComplete = task.setsCompleted.every(Boolean);
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 transition-all ${
                    allSetsComplete
                      ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/10"
                      : task.skipped
                      ? "border-zinc-200 dark:border-zinc-800 opacity-50"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40"
                  }`}
                >
                  {/* Task header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {allSetsComplete && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                        <span className={`font-semibold text-sm dark:text-white truncate ${allSetsComplete ? "line-through text-zinc-400 dark:text-zinc-500" : ""}`}>
                          {task.name}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {task.muscle} &bull; {task.sets} sets &times; {task.reps}
                      </p>
                    </div>
                    {!allSetsComplete && !task.skipped && (
                      <button
                        onClick={() => setSwapIndex(swapIndex === idx ? -1 : idx)}
                        className={`ml-2 flex items-center gap-1 text-xs transition-colors flex-shrink-0 ${
                          swapIndex === idx
                            ? "text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                        }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        {swapIndex === idx ? "Cancel" : "Swap"}
                      </button>
                    )}
                  </div>

                  {/* Set buttons */}
                  {!task.skipped && (
                    <div className="flex gap-1.5 mb-3">
                      {task.setsCompleted.map((done, setIdx) => (
                        <button
                          key={setIdx}
                          onClick={() => !allSetsComplete && toggleSet(idx, setIdx)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                            done
                              ? "bg-emerald-500 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {done ? "✓" : `Set ${setIdx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {task.skipped && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 italic mb-1">Skipped</p>
                  )}

                  {!allSetsComplete && !task.skipped && (
                    <button
                      onClick={() => skipTask(idx)}
                      className="text-xs text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors"
                    >
                      <SkipForward className="w-3 h-3" />
                      Skip this exercise
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Swap picker — appears below grid when active */}
          {swapIndex !== -1 && (
            <div className="mt-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/20 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold dark:text-white">
                  Replace <span className="text-indigo-600 dark:text-indigo-400">"{circuitTasks[swapIndex]?.name}"</span> with:
                </p>
                <button onClick={() => setSwapIndex(-1)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {exercises.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => swapTask(swapIndex, ex)}
                    className="text-left p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                  >
                    <p className="text-xs font-semibold dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">{ex.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{ex.category} &bull; {ex.difficulty}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {aiRecommendation ? (
        <>
          {/* Java Data Structures Section */}
          <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />Java Logic Engine
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Powered by Java Data Structures (Binary Search, Stacks, HashMaps, Queues)</p>
              </div>
              <Button variant="outline" onClick={undoWorkout} className="dark:border-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Undo Last Log (Stack)
              </Button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <Input placeholder="Search exercises using Java Binary Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="dark:bg-black dark:border-zinc-800 dark:text-white flex-1" />
              <Button type="submit" disabled={isSearching} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>

            {searchResult && (
              <Card className="mt-4 p-4 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/10 animate-in fade-in slide-in-from-top-2">
                {searchResult.error ? (
                  <p className="text-sm text-red-500 font-medium">{searchResult.error}</p>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold dark:text-white text-lg">{searchResult.name}</h4>
                      <p className="text-sm text-zinc-500">{searchResult.category} • {searchResult.difficulty} • {searchResult.duration}</p>
                    </div>
                    <Button size="sm" onClick={() => logWorkout(searchResult.name)} className="bg-indigo-600">Log Exercise</Button>
                  </div>
                )}
              </Card>
            )}

            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h3 className="font-bold dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Queue Circuit (Library Exercises)
                </h3>
                <Button onClick={nextCircuit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Next Exercise (FIFO)
                </Button>
              </div>
              {currentCircuitExercise ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between animate-in zoom-in-95 duration-300">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Current Active Exercise</p>
                    <h4 className="text-xl font-bold dark:text-white">{currentCircuitExercise.name}</h4>
                    <p className="text-sm text-zinc-500">{currentCircuitExercise.duration} • {currentCircuitExercise.category}</p>
                  </div>
                  <Button size="sm" onClick={() => logWorkout(currentCircuitExercise.name)}>Complete & Log</Button>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic">No exercise active. Add exercises below to queue them here.</p>
              )}
            </div>
          </div>

          {/* Exercise Library */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="dark:bg-black flex-wrap h-auto gap-2">
              <TabsTrigger value="all" onClick={() => setSelectedCategory("all")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">All Workouts</TabsTrigger>
              <TabsTrigger value="strength" onClick={() => setSelectedCategory("strength")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Strength</TabsTrigger>
              <TabsTrigger value="cardio" onClick={() => setSelectedCategory("cardio")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Cardio</TabsTrigger>
              <TabsTrigger value="flexibility" onClick={() => setSelectedCategory("flexibility")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Flexibility</TabsTrigger>
              <TabsTrigger value="calisthenics" onClick={() => setSelectedCategory("calisthenics")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">Calisthenics</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkouts.map(workout => (
                  <Card key={workout.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-black dark:border-zinc-800">
                    <div className="relative h-48">
                      <ImageWithFallback src={workout.image} alt={workout.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${getDifficultyColor(workout.difficulty)} border-0 shadow-sm`}>{workout.difficulty}</Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{workout.name}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{workout.description}</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-transparent dark:border-zinc-800">
                          <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" /><span className="text-xs text-zinc-600 dark:text-zinc-300">{workout.duration}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-transparent dark:border-zinc-800">
                          <Zap className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" /><span className="text-xs text-zinc-600 dark:text-zinc-300">{workout.calories} cal</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-transparent dark:border-zinc-800">
                          <Target className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" /><span className="text-xs text-zinc-600 dark:text-zinc-300">{workout.exercises} ex</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => logWorkout(workout.name)} className="flex-1 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm">
                          <Play className="w-4 h-4 mr-2" />Log (Stack)
                        </Button>
                        <Button variant="outline" onClick={() => addToCircuit(workout.name)} className="flex-1 dark:border-zinc-700 dark:text-zinc-300">
                          + Queue
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-20 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl mb-8">
          <Bot className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">Setup Required</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Please complete the AI setup wizard above to unlock personalized workouts and recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
