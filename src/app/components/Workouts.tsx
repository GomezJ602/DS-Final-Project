import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Clock, Zap, Target, Play, Sparkles, Bot, ArrowRight, Activity, Utensils, Calendar, Settings, MessageSquarePlus } from "lucide-react";
import { ImageWithFallback } from "./common/ImageWithFallback";

export default function Workouts() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentCircuitExercise, setCurrentCircuitExercise] = useState<any>(null);

  // Load exercises from Java backend
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

  // Handle Binary Search via Java Backend
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8080/api/search?name=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.name) {
        setSearchResult(data);
      } else {
        setSearchResult({ error: "No exercise found with that name." });
      }
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
      if (data.name) {
        alert(`Undo successful! Removed ${data.name} from Java Stack.`);
      } else {
        alert("Nothing to undo in Java history.");
      }
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
  
  // AI Wizard State
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
  } | null>(null);

  // Progress Check-In State
  const [showProgressCheckIn, setShowProgressCheckIn] = useState(false);
  const [nutritionProgress, setNutritionProgress] = useState("");
  const [workoutProgress, setWorkoutProgress] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Load metrics from local storage on initial mount
  useEffect(() => {
    const savedHeight = localStorage.getItem("ironcore_user_height");
    const savedWeight = localStorage.getItem("ironcore_user_weight");
    const savedRec = localStorage.getItem("ironcore_ai_rec");
    
    if (savedHeight && savedWeight) {
      setUserHeight(savedHeight);
      setUserWeight(savedWeight);
      setHasSetMetrics(true);
    }
    
    if (savedRec) {
      try {
        setAiRecommendation(JSON.parse(savedRec));
      } catch (e) {}
    } else {
      setShowAIWizard(true);
    }
  }, []);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setAiFeedback(null);
    
    // Save to local storage for future visits
    localStorage.setItem("ironcore_user_height", userHeight);
    localStorage.setItem("ironcore_user_weight", userWeight);
    setHasSetMetrics(true);

    // Simulate AI processing from natural language prompt
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAIWizard(false);
      
      let determinedPhysique = "general";
      let programLength = "90-Day";
      const promptText = userGoalPrompt.toLowerCase();

      // Guess the user's desired physique from their text prompt
      if (promptText.includes("lean") || promptText.includes("cut") || promptText.includes("lose") || promptText.includes("shred")) {
        determinedPhysique = "lean";
        programLength = "180-Day";
      } else if (promptText.includes("mass") || promptText.includes("muscle") || promptText.includes("bulk") || promptText.includes("big") || promptText.includes("hypertrophy")) {
        determinedPhysique = "mass";
        programLength = "12-Week";
      } else if (promptText.includes("calisthenic") || promptText.includes("bodyweight") || promptText.includes("street")) {
        determinedPhysique = "calisthenics";
        programLength = "6-Month";
      } else if (promptText.includes("endurance") || promptText.includes("stamina") || promptText.includes("run") || promptText.includes("cardio")) {
        determinedPhysique = "endurance";
        programLength = "16-Week";
      }

      let programTitle = `${programLength} General Wellness Program`;
      let workout = "A mix of Core Strength, Morning Stretch, and Full Body Blast to maintain overall wellness (3-4x/week). Stick with it to build a consistent habit.";
      let nutrition = "Focus on whole foods, lean proteins, and plenty of hydration. No strict calorie counting required.";
      let classes = "Yoga Flow & Casual Spin Classes";

      if (determinedPhysique === "lean") {
        programTitle = `${programLength} Lean & Fit Program`;
        workout = "Phase 1: Build a cardio base with HIIT Cardio. Phase 2: Introduce high-rep lightweight resistance. Phase 3: Dynamic circuits to shred and tone (4-5x/week). Stick with this for the full 180 days to see optimal leaning out.";
        nutrition = "Maintain a slight caloric deficit (-300 to -500 kcal). Prioritize lean proteins (40%), complex carbs (30%), and healthy fats (30%).";
        classes = "Pilates Core & Boxing Conditioning";
      } else if (determinedPhysique === "mass") {
        programTitle = `${programLength} Massive Muscle Builder`;
        workout = "Phase 1: Foundation strength. Phase 2: Upper Body Power & Lower Body Hypertrophy splits (4-5x/week). Progressive overload is key. Stick with it for 12 weeks to see significant mass gains.";
        nutrition = "High protein, caloric surplus (+300-500 kcal). Recommended 50/30/20 (Carbs/Protein/Fat) split.";
        classes = "CrossFit Metcon & Strength Fundamentals";
      } else if (determinedPhysique === "endurance") {
        programTitle = `${programLength} Iron Stamina Routine`;
        workout = "Track Speed Intervals, long distance pacing, and core stability circuits (4x/week). Progressively increase volume over 16 weeks.";
        nutrition = "High carbohydrate intake for sustained energy stores. 60/20/20 macro split.";
        classes = "Cycling, Swimming Laps & Rowing Classes";
      } else if (determinedPhysique === "calisthenics") {
        programTitle = `${programLength} Calisthenics Mastery`;
        workout = "Phase 1: Bodyweight Fundamentals (Pushups, Pull-ups). Phase 2: Isometric holds. Phase 3: Advanced Street Workout (Muscle-ups, Levers). Train 4x/week for 6 months to master your bodyweight.";
        nutrition = "Maintenance or slight surplus to fuel muscle repair. High protein intake (1g per lb of body weight) to support strength-to-weight ratio.";
        classes = "Bodyweight Fundamentals & Gymnastics Strength";
      }

      const rec = {
        title: programTitle,
        prompt: userGoalPrompt,
        workout,
        nutrition,
        classes,
      };

      setAiRecommendation(rec);
      localStorage.setItem("ironcore_ai_rec", JSON.stringify(rec));
    }, 1500);
  };

  const handleCheckIn = () => {
    setIsCheckingIn(true);
    setTimeout(() => {
      setIsCheckingIn(false);
      setShowProgressCheckIn(false);
      
      setAiFeedback(`Great job checking in! Based on your nutrition update ("${nutritionProgress}") and workout progress ("${workoutProgress}"), I've lightly adjusted your plan below to ensure you avoid plateaus and recover adequately. Keep up the solid momentum!`);
      
      // Lightly tweak the current recommendation to show it adapted
      setAiRecommendation(prev => {
        if (!prev) return null;
        const newRec = {
          ...prev,
          workout: prev.workout.replace(/\(.*\)/, "") + " (Adjusted based on check-in: Added 1 active recovery day and refined intensity).",
          nutrition: prev.nutrition.replace(/\(.*\)/, "") + " (Adjusted macros: slightly increased protein to support recovery based on your report)."
        };
        localStorage.setItem("ironcore_ai_rec", JSON.stringify(newRec));
        return newRec;
      });
      
      // Clear inputs for next time
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
                  <Input 
                    id="height" 
                    placeholder="e.g., 5'10&quot; or 178cm" 
                    value={userHeight}
                    onChange={(e) => setUserHeight(e.target.value)}
                    className="bg-white dark:bg-black dark:border-zinc-800 dark:text-white transition-colors focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="dark:text-zinc-300">Weight</Label>
                  <Input 
                    id="weight" 
                    placeholder="e.g., 170 lbs or 77kg" 
                    value={userWeight}
                    onChange={(e) => setUserWeight(e.target.value)}
                    className="bg-white dark:bg-black dark:border-zinc-800 dark:text-white transition-colors focus:ring-indigo-500"
                  />
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
              <Input 
                id="goalPrompt"
                placeholder="e.g., I'm looking to get fit and lean, or I want to learn calisthenics"
                value={userGoalPrompt}
                onChange={(e) => setUserGoalPrompt(e.target.value)}
                className="bg-white dark:bg-black dark:border-zinc-800 dark:text-white transition-colors focus:ring-indigo-500"
              />
            </div>
            
            {hasSetMetrics && (
               <div className="flex items-center justify-start mt-[-10px]">
                  <Button 
                    variant="link" 
                    onClick={() => setHasSetMetrics(false)}
                    className="text-indigo-600 dark:text-indigo-400 p-0 h-auto font-medium"
                  >
                    Edit Height & Weight
                  </Button>
               </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowAIWizard(false);
                if (!aiRecommendation && !hasSetMetrics) {
                  setUserHeight("");
                  setUserWeight("");
                  setUserGoalPrompt("");
                }
              }} 
              className="dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
              disabled={!userHeight || !userWeight || !userGoalPrompt || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center">
                  {aiRecommendation ? "Update Plan" : "Generate Plan"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </Button>
          </div>
        </Card>
      )}

      {aiRecommendation && !showAIWizard && (
        <Card className="mb-8 p-6 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">
                  {aiRecommendation.title}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                  Based on your profile ({userHeight}, {userWeight}) and goal: "{aiRecommendation.prompt}"
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowProgressCheckIn(!showProgressCheckIn)}
                className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 text-xs md:text-sm border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Progress Check-In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAIWizard(true)}
                className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 text-xs md:text-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Change Goals
              </Button>
            </div>
          </div>

          {showProgressCheckIn && (
            <div className="mb-6 p-4 md:p-5 bg-white dark:bg-black rounded-xl border border-indigo-100 dark:border-indigo-900/40 relative z-10 shadow-sm animate-in slide-in-from-top-2 duration-200">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center">
                <Bot className="w-4 h-4 mr-2 text-indigo-500" />
                How are you feeling about your plan?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="nutrition-progress" className="dark:text-zinc-300 text-sm">Nutrition Progress</Label>
                  <Input 
                    id="nutrition-progress" 
                    placeholder="e.g., Struggling with protein, feeling hungry..." 
                    value={nutritionProgress}
                    onChange={(e) => setNutritionProgress(e.target.value)}
                    className="bg-zinc-50 dark:bg-black dark:border-zinc-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workout-progress" className="dark:text-zinc-300 text-sm">Workout Progress</Label>
                  <Input 
                    id="workout-progress" 
                    placeholder="e.g., Workouts feel great, slightly sore..." 
                    value={workoutProgress}
                    onChange={(e) => setWorkoutProgress(e.target.value)}
                    className="bg-zinc-50 dark:bg-black dark:border-zinc-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowProgressCheckIn(false)}>Cancel</Button>
                <Button 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!nutritionProgress && !workoutProgress || isCheckingIn}
                  onClick={handleCheckIn}
                >
                  {isCheckingIn ? "Analyzing..." : "Submit Check-In"}
                </Button>
              </div>
            </div>
          )}

          {aiFeedback && !showProgressCheckIn && (
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl relative z-10">
              <div className="flex gap-3">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  {aiFeedback}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <Card className="p-5 border-none shadow-sm dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Workout Routine</h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {aiRecommendation.workout}
              </p>
            </Card>
            
            <Card className="p-5 border-none shadow-sm dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                <Utensils className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Nutrition Guide</h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {aiRecommendation.nutrition}
              </p>
            </Card>

            <Card className="p-5 border-none shadow-sm dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
                <Calendar className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Suggested Classes</h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {aiRecommendation.classes}
              </p>
            </Card>
          </div>
        </Card>
      )}

      {aiRecommendation ? (
        <>
          {/* Java Data Structures Demo Section */}
          <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 relative z-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Java Logic Engine
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Powered by Java Data Structures (Binary Search, Stacks, HashMaps)</p>
              </div>
              <Button 
                variant="outline" 
                onClick={undoWorkout}
                className="dark:border-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Undo Last Log (Stack)
              </Button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <Input 
                placeholder="Search exercises using Java Binary Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dark:bg-black dark:border-zinc-800 dark:text-white flex-1"
              />
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
                  Workout Circuit (Queue)
                </h3>
                <Button 
                  onClick={nextCircuit} 
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Next Circuit Exercise (FIFO)
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
                <p className="text-sm text-zinc-500 italic">No exercise active in circuit. Add some exercises below!</p>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="dark:bg-black flex-wrap h-auto gap-2">
              <TabsTrigger value="all" onClick={() => setSelectedCategory("all")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">
                All Workouts
              </TabsTrigger>
              <TabsTrigger value="strength" onClick={() => setSelectedCategory("strength")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">
                Strength
              </TabsTrigger>
              <TabsTrigger value="cardio" onClick={() => setSelectedCategory("cardio")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">
                Cardio
              </TabsTrigger>
              <TabsTrigger value="flexibility" onClick={() => setSelectedCategory("flexibility")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">
                Flexibility
              </TabsTrigger>
              <TabsTrigger value="calisthenics" onClick={() => setSelectedCategory("calisthenics")} className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400">
                Calisthenics
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkouts.map((workout) => (
                  <Card key={workout.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-black dark:border-zinc-800">
                    <div className="relative h-48">
                      <ImageWithFallback
                        src={workout.image}
                        alt={workout.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${getDifficultyColor(workout.difficulty)} border-0 shadow-sm`}>
                          {workout.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{workout.name}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{workout.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-transparent dark:border-zinc-800">
                          <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" />
                          <span className="text-xs text-zinc-600 dark:text-zinc-300">{workout.duration}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-transparent dark:border-zinc-800">
                          <Zap className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" />
                          <span className="text-xs text-zinc-600 dark:text-zinc-300">{workout.calories} cal</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-transparent dark:border-zinc-800">
                          <Target className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mb-1" />
                          <span className="text-xs text-zinc-600 dark:text-zinc-300">{workout.exercises} ex</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => logWorkout(workout.name)}
                          className="flex-1 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Log (Stack)
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => addToCircuit(workout.name)}
                          className="flex-1 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          + Circuit (Queue)
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