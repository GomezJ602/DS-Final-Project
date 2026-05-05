import {
  Flame,
  Target,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Award,
  Scale,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { format, startOfWeek, addDays } from "date-fns";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

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

const ALL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Fallback images used when the Java backend is offline (index = JS day: 0=Sun…6=Sat)
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1581009137042-c552e485697a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1483721310020-03333e577078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
];

export default function Dashboard() {
  const navigate = useNavigate();

  const today = new Date();
  const todayName = ALL_DAYS[today.getDay()];
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const todayKey = format(today, "yyyy-MM-dd");

  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);
  const [workoutLog, setWorkoutLog] = useState<Record<string, ExerciseLog[]>>(
    {}
  );
  const [points, setPoints] = useState<number | null>(null);
  const [heroImage, setHeroImage] = useState<string>(FALLBACK_IMAGES[today.getDay()]);
  const [weightLog, setWeightLog] = useState<Record<string, number>>({});
  const [weightInput, setWeightInput] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");

  useEffect(() => {
    const loadAll = () => {
      const savedPlan = localStorage.getItem("ironcore_ai_plan");
      const savedLog = localStorage.getItem("ironcore_workout_log");
      if (savedLog) setWorkoutLog(JSON.parse(savedLog));
      if (savedPlan) setAiPlan(JSON.parse(savedPlan));
      const savedWeightLog = localStorage.getItem("ironcore_weight_log");
      if (savedWeightLog) setWeightLog(JSON.parse(savedWeightLog));
      const savedUnit = localStorage.getItem("ironcore_weight_unit") as "lbs" | "kg" | null;
      if (savedUnit) setWeightUnit(savedUnit);
    };
    loadAll();
    window.addEventListener("focus", loadAll);

    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6935bede/points`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    })
      .then((r) => r.json())
      .then((d) => setPoints(d.points ?? 0))
      .catch(() => setPoints(0));

    // Fetch today's hero image from Java backend (day 0=Sun … 6=Sat)
    fetch(`http://localhost:8080/api/daily-images?day=${today.getDay()}`)
      .then((r) => r.json())
      .then((d) => { if (d.imageUrl) setHeroImage(d.imageUrl); })
      .catch(() => {}); // keep fallback on backend offline

    return () => window.removeEventListener("focus", loadAll);
  }, []);

  function isDayCompleted(dateKey: string): boolean {
    const log = workoutLog[dateKey];
    return !!(
      log &&
      log.length > 0 &&
      log.every((ex) => ex.setLogs.every((s) => s.done))
    );
  }

  const todayWorkout = aiPlan?.weeklyPlan?.[todayName];
  const todayDone = isDayCompleted(todayKey);

  const totalWorkoutDays = aiPlan ? Object.keys(aiPlan.weeklyPlan).length : 0;
  const weeklyCompletedDays = ALL_DAYS.filter((_, i) => {
    const dk = format(addDays(weekStart, i), "yyyy-MM-dd");
    return isDayCompleted(dk);
  }).length;

  const todayLog = workoutLog[todayKey] || [];
  const completedToday = todayLog.filter((ex) =>
    ex.setLogs.every((s) => s.done)
  ).length;
  const totalToday = todayLog.length || todayWorkout?.exercises.length || 0;

  const nextWorkoutDay = (() => {
    for (let offset = 1; offset <= 7; offset++) {
      const name = ALL_DAYS[(today.getDay() + offset) % 7];
      if (aiPlan?.weeklyPlan?.[name]) return name;
    }
    return null;
  })();

  function handleLogWeight() {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;
    const lbsValue = weightUnit === "kg" ? val * 2.20462 : val;
    const rounded = Math.round(lbsValue * 10) / 10;
    const newLog = { ...weightLog, [todayKey]: rounded };
    setWeightLog(newLog);
    localStorage.setItem("ironcore_weight_log", JSON.stringify(newLog));
    setWeightInput("");
  }

  function handleUnitChange(unit: "lbs" | "kg") {
    setWeightUnit(unit);
    localStorage.setItem("ironcore_weight_unit", unit);
  }

  const todayWeightLbs = weightLog[todayKey];
  const todayWeightDisplay = todayWeightLbs
    ? weightUnit === "kg"
      ? (todayWeightLbs / 2.20462).toFixed(1)
      : todayWeightLbs.toFixed(1)
    : null;

  const stats = [
    {
      icon: CheckCircle2,
      label: "Today's Progress",
      value: totalToday > 0 ? `${completedToday}/${totalToday}` : "—",
      unit: "exercises",
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: Calendar,
      label: "This Week",
      value: `${weeklyCompletedDays}/${totalWorkoutDays || "—"}`,
      unit: "workouts done",
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Target,
      label: "Weekly Goal",
      value:
        totalWorkoutDays > 0
          ? Math.round(
              (weeklyCompletedDays / totalWorkoutDays) * 100
            ).toString()
          : "0",
      unit: "%",
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      icon: Flame,
      label: "Maintenance",
      value: aiPlan?.maintenanceCalories?.toLocaleString() ?? "—",
      unit: "cal/day",
      color: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="p-6 md:p-8 dark:bg-black min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
            Welcome back!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            {todayWorkout
              ? `Today is ${todayName} — ${todayWorkout.focus} day`
              : `Today is ${todayName} — rest day`}
          </p>
        </div>
        {/* Points box */}
        <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-2.5 flex-shrink-0">
          <Award className="w-5 h-5 text-amber-500 fill-amber-500/20 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-500 leading-none">Points</p>
            <p className="text-xl font-bold text-amber-700 dark:text-amber-400 leading-tight">
              {points === null ? "—" : points.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="p-5 dark:bg-zinc-950 dark:border-zinc-800"
            >
              <div className={`p-2 rounded-lg ${stat.bg} inline-flex mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {stat.unit}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Today's Workout + Weight Logger ─────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {!aiPlan ? (
            <Card className="p-10 dark:bg-zinc-950 dark:border-zinc-800 flex flex-col items-center text-center gap-4">
              <Sparkles className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
              <div>
                <h3 className="text-lg font-semibold dark:text-white mb-1">
                  No workout plan yet
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Complete the setup quiz in the Workouts tab to get your
                  personalized plan.
                </p>
              </div>
              <Button
                onClick={() => navigate("/workouts")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Set Up My Plan
              </Button>
            </Card>
          ) : (
            <Card className="dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden">
              {/* Hero image */}
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={heroImage}
                  alt={todayWorkout ? "Today's workout" : "Rest day"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  {todayWorkout ? (
                    <>
                      <Badge className="bg-indigo-600/90 text-white border-0 text-xs mb-2 backdrop-blur-sm">
                        {todayWorkout.focus}
                      </Badge>
                      <h2 className="text-2xl font-bold">
                        {todayName}&apos;s Workout
                      </h2>
                      <p className="text-sm text-zinc-200 mt-0.5">
                        {todayWorkout.duration} ·{" "}
                        {todayWorkout.exercises.length} exercises
                      </p>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-emerald-600/90 text-white border-0 text-xs mb-2 backdrop-blur-sm">
                        Rest Day
                      </Badge>
                      <h2 className="text-2xl font-bold">Recovery Day</h2>
                      <p className="text-sm text-zinc-200 mt-0.5">
                        Take it easy and let your body recover.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                {todayDone && (
                  <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center gap-3">
                    <Trophy className="w-7 h-7 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-900 dark:text-emerald-300">
                        Great job! 💪
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        You crushed today's full workout. Rest up and come back
                        stronger!
                      </p>
                    </div>
                  </div>
                )}

                {!todayWorkout && nextWorkoutDay && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Your next workout is{" "}
                    <span className="font-semibold dark:text-zinc-300">
                      {nextWorkoutDay}
                    </span>
                    .
                  </p>
                )}

                {todayWorkout ? (
                  <Button
                    onClick={() => navigate("/workouts")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-base"
                  >
                    <Dumbbell className="w-5 h-5 mr-2" />
                    {todayDone ? "View Workout" : "Start Workout"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/workouts")}
                    variant="outline"
                    className="w-full dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    View Workouts
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Weight Logger */}
          <Card className="p-5 dark:bg-zinc-950 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 inline-flex">
                  <Scale className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">Log Today's Weight</h3>
              </div>
              {todayWeightDisplay && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Logged:{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {todayWeightDisplay} {weightUnit}
                  </span>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Enter weight (${weightUnit})`}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogWeight()}
                className="flex-1 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                min="0"
                step="0.1"
              />
              <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0">
                {(["lbs", "kg"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      weightUnit === u
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleLogWeight}
                disabled={
                  !weightInput ||
                  isNaN(parseFloat(weightInput)) ||
                  parseFloat(weightInput) <= 0
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0"
              >
                Log
              </Button>
            </div>
            {todayWeightDisplay && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Weight logged for today. Enter a new value to update it.
              </p>
            )}
          </Card>
        </div>

        {/* ── Sidebar (Weekly Goal + Calorie Target — unchanged) ─────── */}
        <div className="flex flex-col gap-5">
          {/* Weekly Goal */}
          <Card className="p-6 dark:bg-zinc-950 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
              Weekly Goal
            </h3>
            <div className="mb-5">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Workouts completed
                </span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {weeklyCompletedDays}/{totalWorkoutDays || "?"}
                </span>
              </div>
              <Progress
                value={
                  totalWorkoutDays > 0
                    ? (weeklyCompletedDays / totalWorkoutDays) * 100
                    : 0
                }
                className="h-2 dark:bg-zinc-800"
              />
            </div>

            <div className="space-y-2.5">
              {aiPlan &&
                Object.entries(aiPlan.weeklyPlan).map(([day, dayW]) => {
                  const idx = ALL_DAYS.indexOf(day);
                  const dk = format(addDays(weekStart, idx), "yyyy-MM-dd");
                  const done = isDayCompleted(dk);
                  const isCurrentDay = day === todayName;
                  return (
                    <div key={day} className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          done
                            ? "bg-emerald-500"
                            : isCurrentDay
                            ? "bg-indigo-500"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      />
                      <span
                        className={`text-sm flex-1 ${
                          done
                            ? "line-through text-zinc-400 dark:text-zinc-500"
                            : isCurrentDay
                            ? "font-semibold dark:text-white"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {day}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[90px]">
                        {dayW.focus}
                      </span>
                      {done && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              {!aiPlan && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-2">
                  No plan configured yet
                </p>
              )}
            </div>
          </Card>

          {/* Calorie Target */}
          {aiPlan?.maintenanceCalories && (
            <Card className="p-6 dark:bg-zinc-950 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                Calorie Target
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                Estimated maintenance calories based on your profile
              </p>
              <p className="text-3xl font-bold text-orange-500 dark:text-orange-400">
                {aiPlan.maintenanceCalories.toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                cal / day
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
