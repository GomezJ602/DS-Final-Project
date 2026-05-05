import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  CheckCircle2,
  RotateCcw,
  Plus,
  Utensils,
  Calendar,
  ListChecks,
  Activity,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Settings,
  Dumbbell,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { ImageWithFallback } from "./common/ImageWithFallback";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionnaireData {
  physique: string;
  experience: string;
  primaryGoal: string;
  dailyCalories: string;
  activityLevel: string;
  workoutDays: string[];
  equipment: string;
  timePerWorkout: string;
  height: string;
  weight: string;
  age: string;
  sex: string;
}

interface WorkoutExercise {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
}

interface DayWorkout {
  focus: string;
  duration: string;
  exercises: WorkoutExercise[];
}

interface AIPlan {
  title: string;
  maintenanceCalories: number;
  weeklyPlan: Record<string, DayWorkout>;
}

interface SetLog {
  repsActual: string;
  done: boolean;
}

interface ExerciseLog {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  setLogs: SetLog[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const EMPTY_Q: QuestionnaireData = {
  physique: "",
  experience: "",
  primaryGoal: "",
  dailyCalories: "",
  activityLevel: "",
  workoutDays: [],
  equipment: "",
  timePerWorkout: "",
  height: "",
  weight: "",
  age: "",
  sex: "",
};

// ─── 10-Question config ───────────────────────────────────────────────────────

const QUESTIONS = [
  {
    step: 1,
    title: "What's your desired physique?",
    subtitle: "Choose the body type that best reflects your goal",
    headerImage: "",
    type: "photo-grid" as const,
    field: "physique",
    options: [
      {
        value: "lean",
        label: "Lean & Toned",
        desc: "Low body fat, defined muscles",
        photo:
          "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&q=80",
      },
      {
        value: "athletic",
        label: "Athletic",
        desc: "Balanced strength & performance",
        photo:
          "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&q=80",
      },
      {
        value: "muscular",
        label: "Muscle Mass",
        desc: "Size, strength & hypertrophy",
        photo:
          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",
      },
      {
        value: "powerlifter",
        label: "Raw Power",
        desc: "Maximum strength output",
        photo:
          "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80",
      },
    ],
  },
  {
    step: 2,
    title: "What's your fitness experience level?",
    subtitle: "Be honest — this sets the right intensity for you",
    headerImage:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80",
    type: "cards" as const,
    field: "experience",
    options: [
      {
        value: "beginner",
        label: "Beginner",
        desc: "Less than 1 year of consistent training",
        icon: "🌱",
      },
      {
        value: "intermediate",
        label: "Intermediate",
        desc: "1–3 years of consistent training",
        icon: "💪",
      },
      {
        value: "expert",
        label: "Expert",
        desc: "3+ years of serious training",
        icon: "🏆",
      },
    ],
  },
  {
    step: 3,
    title: "What is your primary fitness goal?",
    subtitle: "This shapes your entire program design",
    headerImage:
      "https://images.unsplash.com/photo-1485727749690-d091e8284ef3?w=900&q=80",
    type: "cards" as const,
    field: "primaryGoal",
    options: [
      {
        value: "weight_loss",
        label: "Lose Weight",
        desc: "Burn fat and get lean",
        icon: "🔥",
      },
      {
        value: "muscle_gain",
        label: "Build Muscle",
        desc: "Gain size and strength",
        icon: "💪",
      },
      {
        value: "endurance",
        label: "Build Endurance",
        desc: "Better stamina and cardio",
        icon: "🏃",
      },
      {
        value: "general_health",
        label: "General Health",
        desc: "Stay fit and feel great",
        icon: "❤️",
      },
    ],
  },
  {
    step: 4,
    title: "How much do you eat per day on average?",
    subtitle: "A rough estimate helps calibrate your nutrition plan",
    headerImage:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80",
    type: "cards" as const,
    field: "dailyCalories",
    options: [
      {
        value: "<1500",
        label: "Under 1,500 cal",
        desc: "Very light eater",
        icon: "🥗",
      },
      {
        value: "1500-2000",
        label: "1,500 – 2,000 cal",
        desc: "Light to moderate",
        icon: "🍱",
      },
      {
        value: "2000-2500",
        label: "2,000 – 2,500 cal",
        desc: "Moderate eater",
        icon: "🍽️",
      },
      {
        value: "2500-3000",
        label: "2,500 – 3,000 cal",
        desc: "High appetite",
        icon: "🍖",
      },
      {
        value: "3000+",
        label: "Over 3,000 cal",
        desc: "Very high intake",
        icon: "🍔",
      },
    ],
  },
  {
    step: 5,
    title: "How active are you during the day?",
    subtitle: "Outside of structured workouts",
    headerImage:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=80",
    type: "cards" as const,
    field: "activityLevel",
    options: [
      {
        value: "sedentary",
        label: "Sedentary",
        desc: "Mostly sitting — desk job, little walking",
        icon: "🪑",
      },
      {
        value: "lightly_active",
        label: "Lightly Active",
        desc: "Some walking or light daily movement",
        icon: "🚶",
      },
      {
        value: "moderately_active",
        label: "Moderately Active",
        desc: "On your feet most of the day",
        icon: "🏃‍♂️",
      },
      {
        value: "very_active",
        label: "Very Active",
        desc: "Physical job or constant movement",
        icon: "⚡",
      },
    ],
  },
  {
    step: 6,
    title: "Which days do you want to work out?",
    subtitle: "Select every day you plan to train each week",
    headerImage:
      "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=900&q=80",
    type: "day-picker" as const,
    field: "workoutDays",
  },
  {
    step: 7,
    title: "What equipment do you have access to?",
    subtitle: "We'll tailor every exercise to what's available",
    headerImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80",
    type: "cards" as const,
    field: "equipment",
    options: [
      {
        value: "none",
        label: "No Equipment",
        desc: "Bodyweight exercises only",
        icon: "🤸",
      },
      {
        value: "home",
        label: "Home Equipment",
        desc: "Dumbbells, bands, pull-up bar",
        icon: "🏠",
      },
      {
        value: "full_gym",
        label: "Full Gym",
        desc: "Machines, barbells, cables",
        icon: "🏋️",
      },
    ],
  },
  {
    step: 8,
    title: "How long can you dedicate to each workout?",
    subtitle: "We'll design sessions that fit your schedule",
    headerImage:
      "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=900&q=80",
    type: "cards" as const,
    field: "timePerWorkout",
    options: [
      {
        value: "15-30",
        label: "15 – 30 minutes",
        desc: "Quick and efficient",
        icon: "⚡",
      },
      {
        value: "30-45",
        label: "30 – 45 minutes",
        desc: "Standard session",
        icon: "🕐",
      },
      {
        value: "45-60",
        label: "45 – 60 minutes",
        desc: "Comprehensive",
        icon: "🕑",
      },
      {
        value: "60+",
        label: "60+ minutes",
        desc: "Extended, detailed sessions",
        icon: "🕒",
      },
    ],
  },
  {
    step: 9,
    title: "What are your body measurements?",
    subtitle: "Used to accurately calculate your maintenance calories",
    headerImage:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&q=80",
    type: "metrics" as const,
    field: "metrics",
  },
  {
    step: 10,
    title: "Almost done — a few final details",
    subtitle: "Required for accurate calorie and energy calculations",
    headerImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80",
    type: "personal-info" as const,
    field: "personalInfo",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Workouts() {
  const navigate = useNavigate();

  // Questionnaire
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [qStep, setQStep] = useState(0);
  const [qData, setQData] = useState<QuestionnaireData>(EMPTY_Q);
  const [isGenerating, setIsGenerating] = useState(false);

  // Plan
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);

  // Calendar
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Active day workout log
  const [activeDayLog, setActiveDayLog] = useState<ExerciseLog[]>([]);
  const [workoutLog, setWorkoutLog] = useState<Record<string, ExerciseLog[]>>(
    {}
  );

  // Exercise library
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [addedWorkouts, setAddedWorkouts] = useState<Set<string>>(new Set());

  // Tab control + add-to-routine modal
  const [activeTab, setActiveTab] = useState("plan");
  const [addModalExercise, setAddModalExercise] = useState<any | null>(null);
  const [routineStep, setRoutineStep] = useState<"choose" | "pick-days">("choose");
  const [routinePickedDays, setRoutinePickedDays] = useState<string[]>([]);

  // ── Load saved data ──────────────────────────────────────────────────────
  useEffect(() => {
    const savedQ = localStorage.getItem("ironcore_questionnaire");
    const savedPlan = localStorage.getItem("ironcore_ai_plan");
    const savedLog = localStorage.getItem("ironcore_workout_log");

    if (savedQ) setQData(JSON.parse(savedQ));

    if (savedPlan) {
      setAiPlan(JSON.parse(savedPlan));
    } else {
      setShowQuestionnaire(true);
    }

    if (savedLog) setWorkoutLog(JSON.parse(savedLog));

    setSelectedDay(ALL_DAYS[new Date().getDay()]);

    fetch("http://localhost:8080/api/exercises")
      .then((r) => r.json())
      .then(setExercises)
      .catch(() => {});
  }, []);

  // ── When selected day changes, load or build its log ────────────────────
  useEffect(() => {
    if (!aiPlan || !selectedDay) {
      setActiveDayLog([]);
      return;
    }
    const dayWorkout = aiPlan.weeklyPlan?.[selectedDay];
    if (!dayWorkout) {
      setActiveDayLog([]);
      return;
    }
    const dateKey = getDateKeyForDay(weekStart, selectedDay);
    const existing = workoutLog[dateKey];
    setActiveDayLog(existing ?? buildFreshLog(dayWorkout.exercises));
  }, [selectedDay, aiPlan, weekStart]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function getDateKeyForDay(weekSunday: Date, dayName: string): string {
    const idx = ALL_DAYS.indexOf(dayName);
    return format(addDays(weekSunday, idx), "yyyy-MM-dd");
  }

  function buildFreshLog(exs: WorkoutExercise[]): ExerciseLog[] {
    return exs.map((ex) => ({
      name: ex.name,
      muscle: ex.muscle,
      sets: ex.sets,
      reps: ex.reps,
      setLogs: Array.from({ length: ex.sets }, () => ({
        repsActual: "",
        done: false,
      })),
    }));
  }

  function persistLog(log: ExerciseLog[], dayName: string, ws: Date) {
    const dateKey = getDateKeyForDay(ws, dayName);
    const updated = { ...workoutLog, [dateKey]: log };
    setWorkoutLog(updated);
    localStorage.setItem("ironcore_workout_log", JSON.stringify(updated));

    // Sync to Java backend for long-term AI adaptation
    fetch("http://localhost:8080/api/workout/log-reps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateKey, day: dayName, exercises: log }),
    }).catch(() => {});
  }

  function toggleSet(exIdx: number, setIdx: number) {
    const updated = activeDayLog.map((ex, i) => {
      if (i !== exIdx) return ex;
      const setLogs = ex.setLogs.map((s, j) =>
        j === setIdx ? { ...s, done: !s.done } : s
      );
      return { ...ex, setLogs };
    });
    setActiveDayLog(updated);
    if (selectedDay) persistLog(updated, selectedDay, weekStart);
  }

  function updateRepInput(exIdx: number, setIdx: number, value: string) {
    const updated = activeDayLog.map((ex, i) => {
      if (i !== exIdx) return ex;
      const setLogs = ex.setLogs.map((s, j) =>
        j === setIdx ? { ...s, repsActual: value } : s
      );
      return { ...ex, setLogs };
    });
    setActiveDayLog(updated);
    if (selectedDay) persistLog(updated, selectedDay, weekStart);
  }

  function resetDayLog() {
    if (!selectedDay || !aiPlan?.weeklyPlan?.[selectedDay]) return;
    const fresh = buildFreshLog(aiPlan.weeklyPlan[selectedDay].exercises);
    setActiveDayLog(fresh);
    persistLog(fresh, selectedDay, weekStart);
  }

  function removeExerciseFromDay(exIdx: number) {
    const updated = activeDayLog.filter((_, i) => i !== exIdx);
    setActiveDayLog(updated);
    if (selectedDay) persistLog(updated, selectedDay, weekStart);
  }

  function isDayCompleted(dateKey: string): boolean {
    const log = workoutLog[dateKey];
    return !!(log && log.length > 0 && log.every((ex) => ex.setLogs.every((s) => s.done)));
  }

  function openAddModal(exercise: any) {
    setAddModalExercise(exercise);
    setRoutineStep("choose");
    setRoutinePickedDays([]);
  }

  function flashAdded(name: string) {
    setAddedWorkouts((prev) => new Set(prev).add(name));
    setTimeout(() => {
      setAddedWorkouts((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }, 2000);
  }

  function handleJustToday(exercise: any) {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const todayName = ALL_DAYS[new Date().getDay()];
    const newEntry: ExerciseLog = {
      name: exercise.name,
      muscle: exercise.category,
      sets: 3,
      reps: "10-12",
      setLogs: Array.from({ length: 3 }, () => ({ repsActual: "", done: false })),
    };
    const existing = workoutLog[todayKey] ?? [];
    const updated = { ...workoutLog, [todayKey]: [...existing, newEntry] };
    setWorkoutLog(updated);
    localStorage.setItem("ironcore_workout_log", JSON.stringify(updated));
    if (selectedDay === todayName) setActiveDayLog((prev) => [...prev, newEntry]);
    flashAdded(exercise.name);
    setAddModalExercise(null);
    setActiveTab("plan");
  }

  function confirmAddToRoutine() {
    if (!addModalExercise || routinePickedDays.length === 0 || !aiPlan) return;
    const newEx: WorkoutExercise = {
      name: addModalExercise.name,
      muscle: addModalExercise.category,
      sets: 3,
      reps: "10-12",
    };
    const updatedWeeklyPlan = { ...aiPlan.weeklyPlan };
    for (const day of routinePickedDays) {
      if (updatedWeeklyPlan[day]) {
        updatedWeeklyPlan[day] = {
          ...updatedWeeklyPlan[day],
          exercises: [...updatedWeeklyPlan[day].exercises, newEx],
        };
      } else {
        updatedWeeklyPlan[day] = {
          focus: addModalExercise.category,
          duration: "45 min",
          exercises: [newEx],
        };
      }
    }
    const updatedPlan = { ...aiPlan, weeklyPlan: updatedWeeklyPlan };
    setAiPlan(updatedPlan);
    localStorage.setItem("ironcore_ai_plan", JSON.stringify(updatedPlan));

    if (selectedDay && routinePickedDays.includes(selectedDay)) {
      const dateKey = getDateKeyForDay(weekStart, selectedDay);
      const existing = workoutLog[dateKey];
      if (existing) {
        const newEntry: ExerciseLog = {
          name: addModalExercise.name,
          muscle: addModalExercise.category,
          sets: 3,
          reps: "10-12",
          setLogs: Array.from({ length: 3 }, () => ({ repsActual: "", done: false })),
        };
        setActiveDayLog((prev) => [...prev, newEntry]);
      } else {
        setActiveDayLog(buildFreshLog(updatedWeeklyPlan[selectedDay].exercises));
      }
    }

    flashAdded(addModalExercise.name);
    setAddModalExercise(null);
    setActiveTab("plan");
  }

  // ── Plan generation ──────────────────────────────────────────────────────

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("http://localhost:8080/api/ai/workout-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qData),
      });
      const data = await res.json();
      if (data.error) {
        alert("AI error: " + data.error);
        return;
      }
      setAiPlan(data);
      localStorage.setItem("ironcore_questionnaire", JSON.stringify(qData));
      localStorage.setItem("ironcore_ai_plan", JSON.stringify(data));
      setShowQuestionnaire(false);
      setSelectedDay(ALL_DAYS[new Date().getDay()]);
    } catch {
      alert("Failed to generate plan. Make sure the Java server is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Step validation ──────────────────────────────────────────────────────

  function isStepValid(stepIdx: number): boolean {
    const q = QUESTIONS[stepIdx];
    if (q.type === "photo-grid" || q.type === "cards") {
      const val = qData[q.field as keyof QuestionnaireData];
      return typeof val === "string" && val.length > 0;
    }
    if (q.type === "day-picker") return qData.workoutDays.length > 0;
    if (q.type === "metrics") return !!qData.height && !!qData.weight;
    if (q.type === "personal-info") return !!qData.age && !!qData.sex;
    return false;
  }

  const filteredWorkouts = (() => {
    const query = librarySearch.toLowerCase().trim();
    const filtered = exercises.filter((w) => {
      if (selectedCategory !== "all" && w.category !== selectedCategory) return false;
      if (!query) return true;
      return (
        w.name.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query) ||
        w.category?.toLowerCase().includes(query)
      );
    });
    if (!query) return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return [...filtered].sort((a, b) => {
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();
      const aRank = an === query ? 0 : an.startsWith(query) ? 1 : an.includes(query) ? 2 : 3;
      const bRank = bn === query ? 0 : bn.startsWith(query) ? 1 : bn.includes(query) ? 2 : 3;
      if (aRank !== bRank) return aRank - bRank;
      return an.localeCompare(bn);
    });
  })();

  // ════════════════════════════════════════════════════════════════════════════
  // QUESTIONNAIRE VIEW
  // ════════════════════════════════════════════════════════════════════════════

  if (showQuestionnaire) {
    const q = QUESTIONS[qStep];
    const isLast = qStep === QUESTIONS.length - 1;
    const valid = isStepValid(qStep);

    return (
      <div className="min-h-screen dark:bg-black bg-zinc-50 flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${((qStep + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        {/* Step counter + cancel */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Step {qStep + 1} of {QUESTIONS.length}
          </span>
          {aiPlan && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuestionnaire(false)}
              className="text-zinc-500 dark:text-zinc-400"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 pt-8 pb-36">
            {/* Header photo — only shown when the question defines one */}
            {q.headerImage && (
              <div className="rounded-2xl overflow-hidden mb-6 aspect-[2/1]">
                <ImageWithFallback
                  src={q.headerImage}
                  alt={q.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              {q.title}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              {q.subtitle}
            </p>

            {/* Photo grid — Q1 */}
            {q.type === "photo-grid" && q.options && (
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt) => {
                  const selected =
                    qData[q.field as keyof QuestionnaireData] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setQData((d) => ({ ...d, [q.field]: opt.value }))
                      }
                      className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                        selected
                          ? "border-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-800"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      <div className="aspect-[4/3]">
                        <ImageWithFallback
                          src={opt.photo}
                          alt={opt.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className={`p-3 ${
                          selected
                            ? "bg-indigo-50 dark:bg-indigo-900/30"
                            : "bg-white dark:bg-zinc-900"
                        }`}
                      >
                        <p className="font-semibold text-sm dark:text-white">
                          {opt.label}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cards — most questions */}
            {q.type === "cards" && q.options && (
              <div className="flex flex-col gap-3">
                {q.options.map((opt) => {
                  const selected =
                    qData[q.field as keyof QuestionnaireData] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setQData((d) => ({ ...d, [q.field]: opt.value }))
                      }
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold dark:text-white">
                          {opt.label}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {opt.desc}
                        </p>
                      </div>
                      {selected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Day picker — Q6 */}
            {q.type === "day-picker" && (
              <div className="grid grid-cols-7 gap-2">
                {ALL_DAYS.map((day, i) => {
                  const selected = qData.workoutDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() =>
                        setQData((d) => ({
                          ...d,
                          workoutDays: selected
                            ? d.workoutDays.filter((x) => x !== day)
                            : [...d.workoutDays, day],
                        }))
                      }
                      className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${
                          selected
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {DAY_ABBR[i]}
                      </span>
                      {selected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Body metrics — Q9 */}
            {q.type === "metrics" && (
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300 text-base">Height</Label>
                  <Input
                    placeholder={`e.g., 5'10" or 178 cm`}
                    value={qData.height}
                    onChange={(e) =>
                      setQData((d) => ({ ...d, height: e.target.value }))
                    }
                    className="dark:bg-black dark:border-zinc-800 dark:text-white py-6 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300 text-base">Weight</Label>
                  <Input
                    placeholder="e.g., 170 lbs or 77 kg"
                    value={qData.weight}
                    onChange={(e) =>
                      setQData((d) => ({ ...d, weight: e.target.value }))
                    }
                    className="dark:bg-black dark:border-zinc-800 dark:text-white py-6 text-base"
                  />
                </div>
              </div>
            )}

            {/* Personal info — Q10 */}
            {q.type === "personal-info" && (
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300 text-base">Age</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 25"
                    value={qData.age}
                    onChange={(e) =>
                      setQData((d) => ({ ...d, age: e.target.value }))
                    }
                    className="dark:bg-black dark:border-zinc-800 dark:text-white py-6 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-zinc-300 text-base">
                    Biological Sex
                  </Label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-1">
                    Used only for calorie calculations
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {(["male", "female"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setQData((d) => ({ ...d, sex: s }))}
                        className={`p-4 rounded-xl border-2 font-semibold capitalize transition-all ${
                          qData.sex === s
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300"
                            : "border-zinc-200 dark:border-zinc-800 dark:text-white hover:border-indigo-300"
                        }`}
                      >
                        {s === "male" ? "♂ Male" : "♀ Female"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 flex items-center gap-3">
          {qStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setQStep((s) => s - 1)}
              className="dark:border-zinc-700 dark:text-zinc-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          {!isLast ? (
            <Button
              disabled={!valid}
              onClick={() => setQStep((s) => s + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              disabled={!valid || isGenerating}
              onClick={handleGeneratePlan}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              {isGenerating ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Building Your Plan…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate My Plan
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN VIEW
  // ════════════════════════════════════════════════════════════════════════════

  const today = new Date();

  return (
    <div className="p-6 md:p-8 dark:bg-black min-h-screen">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
            {aiPlan?.title ?? "My Workout Plan"}
          </h1>
          {aiPlan?.maintenanceCalories ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Estimated maintenance:{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {aiPlan.maintenanceCalories.toLocaleString()} cal/day
              </span>
            </p>
          ) : null}
        </div>
        <Button
          variant="outline"
          onClick={() => { setQStep(0); setShowQuestionnaire(true); }}
          className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 shrink-0"
        >
          <Settings className="w-4 h-4 mr-2" />
          Redo Quiz
        </Button>
      </div>

      {/* ── SUB-TABS ──────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="dark:bg-zinc-900 mb-6">
          <TabsTrigger
            value="plan"
            className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400"
          >
            <Calendar className="w-4 h-4 mr-2" />
            My Plan
          </TabsTrigger>
          <TabsTrigger
            value="library"
            className="dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:text-zinc-400"
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            Exercise Library
          </TabsTrigger>
        </TabsList>

        {/* ── MY PLAN TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="plan">
          {/* No plan state */}
          {!aiPlan && (
            <div className="text-center py-20 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl mb-8">
              <Sparkles className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                No plan yet
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-4">
                Complete the setup quiz to get your personalized weekly workout
                plan.
              </p>
              <Button
                onClick={() => { setQStep(0); setShowQuestionnaire(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
            </div>
          )}

          {/* Weekly calendar */}
          {aiPlan && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  {format(weekStart, "MMM d")} –{" "}
                  {format(addDays(weekStart, 6), "MMM d, yyyy")}
                </h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                    className="dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))
                    }
                    className="text-xs dark:text-zinc-400 dark:hover:bg-zinc-800 px-3"
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                    className="dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {ALL_DAYS.map((dayName, i) => {
                  const date = addDays(weekStart, i);
                  const isToday = isSameDay(date, today);
                  const dateKey = format(date, "yyyy-MM-dd");
                  const isWorkoutDay = !!aiPlan.weeklyPlan?.[dayName];
                  const isSelected = selectedDay === dayName;
                  const completed = isDayCompleted(dateKey);

                  return (
                    <div
                      key={dayName}
                      className={`rounded-xl border-2 overflow-hidden transition-all ${
                        isSelected
                          ? "border-indigo-600 dark:border-indigo-500 shadow-md"
                          : isToday
                          ? "border-indigo-300 dark:border-indigo-800"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <div
                        className={`px-1.5 py-2 text-center cursor-pointer select-none ${
                          isToday
                            ? "bg-indigo-600"
                            : isSelected
                            ? "bg-indigo-50 dark:bg-indigo-900/30"
                            : "bg-white dark:bg-zinc-900"
                        }`}
                        onClick={() => setSelectedDay(dayName)}
                      >
                        <p className={`text-xs font-bold ${isToday ? "text-indigo-100" : "text-zinc-500 dark:text-zinc-400"}`}>
                          {DAY_ABBR[i]}
                        </p>
                        <p className={`text-base font-bold leading-none mt-0.5 ${isToday ? "text-white" : "dark:text-white"}`}>
                          {format(date, "d")}
                        </p>
                        {completed && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 mx-auto mt-1" />
                        )}
                      </div>

                      {isWorkoutDay && (
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-1 flex flex-col gap-1">
                          <button
                            onClick={() => setSelectedDay(dayName)}
                            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <Dumbbell className="w-3 h-3" />
                            <span className="hidden sm:inline">Workout</span>
                          </button>
                          <button
                            onClick={() => navigate("/nutrition")}
                            className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <Utensils className="w-3 h-3" />
                            <span className="hidden sm:inline">Nutrition</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Today's Workout */}
          {selectedDay && aiPlan?.weeklyPlan?.[selectedDay] && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold dark:text-white flex items-center gap-2 flex-wrap">
                    <ListChecks className="w-5 h-5 text-emerald-500" />
                    {selectedDay}'s Workout
                    <Badge className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-0">
                      {aiPlan.weeklyPlan[selectedDay].focus}
                    </Badge>
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {aiPlan.weeklyPlan[selectedDay].duration} ·{" "}
                    {activeDayLog.filter((ex) => ex.setLogs.every((s) => s.done)).length}
                    /{activeDayLog.length} complete
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetDayLog}
                  className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1.5" />Reset
                </Button>
              </div>

              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${activeDayLog.length
                      ? (activeDayLog.filter((ex) => ex.setLogs.every((s) => s.done)).length / activeDayLog.length) * 100
                      : 0}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeDayLog.map((ex, exIdx) => {
                  const allDone = ex.setLogs.every((s) => s.done);
                  return (
                    <Card
                      key={exIdx}
                      className={`p-4 transition-all ${
                        allDone
                          ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/10"
                          : "dark:bg-zinc-900/40 dark:border-zinc-800"
                      }`}
                    >
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          {allDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                          <h3 className={`font-semibold text-sm dark:text-white flex-1 ${allDone ? "line-through text-zinc-400 dark:text-zinc-500" : ""}`}>
                            {ex.name}
                          </h3>
                          <button
                            onClick={() => removeExerciseFromDay(exIdx)}
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Remove exercise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {ex.muscle} · {ex.sets} sets × {ex.reps}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {ex.setLogs.map((setLog, setIdx) => (
                          <div key={setIdx} className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSet(exIdx, setIdx)}
                              className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                setLog.done
                                  ? "bg-emerald-500 text-white"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                              }`}
                            >
                              {setLog.done ? "✓" : setIdx + 1}
                            </button>
                            <Input
                              type="number"
                              min="0"
                              placeholder={`Reps done (target: ${ex.reps})`}
                              value={setLog.repsActual}
                              onChange={(e) => updateRepInput(exIdx, setIdx, e.target.value)}
                              className="h-8 text-xs dark:bg-black dark:border-zinc-800 dark:text-white flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── EXERCISE LIBRARY TAB ────────────────────────────────────────── */}
        <TabsContent value="library">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <Input
              placeholder="Search exercises by name, muscle, or category…"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="pl-9 pr-9 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
            />
            {librarySearch && (
              <button
                onClick={() => setLibrarySearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter chips */}
          <div className="flex gap-2 flex-wrap mb-5">
            {["all", "strength", "cardio", "flexibility", "calisthenics"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              )
            )}
          </div>

          {/* Flat list */}
          {exercises.length === 0 ? (
            <p className="text-center py-10 text-sm text-zinc-500 dark:text-zinc-400">
              Exercise library unavailable. Make sure the Java server is running.
            </p>
          ) : filteredWorkouts.length === 0 ? (
            <p className="text-center py-10 text-sm text-zinc-500 dark:text-zinc-400">
              No exercises match your search.
            </p>
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredWorkouts.map((workout) => (
                <div
                  key={workout.name}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm dark:text-white truncate">
                      {workout.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {workout.description}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs shrink-0 border-0 hidden sm:inline-flex ${getDifficultyColor(workout.difficulty)}`}
                  >
                    {workout.difficulty}
                  </Badge>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 hidden md:inline whitespace-nowrap">
                    {workout.duration} · {workout.calories} cal
                  </span>
                  <button
                    onClick={() => openAddModal(workout)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      addedWorkouts.has(workout.name)
                        ? "bg-emerald-500 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {addedWorkouts.has(workout.name) ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Add Exercise Modal ─────────────────────────────────────────────── */}
      <Dialog
        open={!!addModalExercise}
        onOpenChange={(open) => !open && setAddModalExercise(null)}
      >
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {addModalExercise?.name}
            </DialogTitle>
          </DialogHeader>

          {routineStep === "choose" && (
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                How would you like to add this exercise?
              </p>
              <button
                onClick={() => addModalExercise && handleJustToday(addModalExercise)}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all"
              >
                <span className="text-2xl flex-shrink-0">📅</span>
                <div>
                  <p className="font-semibold text-sm dark:text-white">Just for Today</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Add to today's workout only — won't affect your weekly plan
                  </p>
                </div>
              </button>
              <button
                onClick={() => setRoutineStep("pick-days")}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all"
              >
                <span className="text-2xl flex-shrink-0">🔄</span>
                <div>
                  <p className="font-semibold text-sm dark:text-white">Add to My Routine</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Permanently add to your weekly plan on days you choose
                  </p>
                </div>
              </button>
            </div>
          )}

          {routineStep === "pick-days" && (
            <div className="flex flex-col gap-4 pt-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Which days should include{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  {addModalExercise?.name}
                </span>
                ?
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {ALL_DAYS.map((day, i) => {
                  const picked = routinePickedDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() =>
                        setRoutinePickedDays((prev) =>
                          picked
                            ? prev.filter((d) => d !== day)
                            : [...prev, day]
                        )
                      }
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition-all ${
                        picked
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-300"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${
                          picked
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {DAY_ABBR[i]}
                      </span>
                      {picked && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRoutineStep("choose")}
                  className="dark:border-zinc-700 dark:text-zinc-300"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back
                </Button>
                <Button
                  size="sm"
                  disabled={routinePickedDays.length === 0}
                  onClick={confirmAddToRoutine}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1.5" />
                  Add to {routinePickedDays.length} day
                  {routinePickedDays.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Advanced":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}
