import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Award, Flame, Activity, Check } from "lucide-react";

interface SetLog { repsActual: string; done: boolean }
interface ExerciseLog {
  name: string; muscle: string; sets: number; reps: string;
  setLogs: SetLog[];
}
interface DayWorkout {
  focus: string; duration: string;
  exercises: { name: string; muscle: string; sets: number; reps: string }[];
}
interface AIPlan {
  title: string; maintenanceCalories: number;
  weeklyPlan: Record<string, DayWorkout>;
}

const ALL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function parseDurationMinutes(s: string): number {
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Progress() {
  const [weightLog, setWeightLog] = useState<Record<string, number>>({});
  const [workoutLog, setWorkoutLog] = useState<Record<string, ExerciseLog[]>>({});
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);

  useEffect(() => {
    const wl = localStorage.getItem("ironcore_weight_log");
    if (wl) setWeightLog(JSON.parse(wl));
    const wlog = localStorage.getItem("ironcore_workout_log");
    if (wlog) setWorkoutLog(JSON.parse(wlog));
    const plan = localStorage.getItem("ironcore_ai_plan");
    if (plan) setAiPlan(JSON.parse(plan));
  }, []);

  // Weight chart: last 10 entries sorted by date
  const sortedWeightEntries = Object.entries(weightLog).sort(([a], [b]) => a.localeCompare(b));
  const weightData = sortedWeightEntries.slice(-10).map(([dateKey, weight]) => {
    const d = new Date(dateKey + "T12:00:00");
    return {
      date: `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`,
      weight,
    };
  });

  const currentWeightLbs = sortedWeightEntries.length > 0
    ? sortedWeightEntries[sortedWeightEntries.length - 1][1] : null;
  const prevWeightLbs = sortedWeightEntries.length > 1
    ? sortedWeightEntries[sortedWeightEntries.length - 2][1] : null;
  const weightDelta = currentWeightLbs != null && prevWeightLbs != null
    ? (currentWeightLbs - prevWeightLbs) : null;

  // Current week (Sun–Sat)
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  // Weekly activity data for bar chart (Sun–Sat)
  const workoutData = ALL_DAYS.map((dayName, idx) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + idx);
    const dateKey = formatDateKey(d);
    const log = workoutLog[dateKey] || [];
    const hasAnyDone = log.some((ex) => ex.setLogs.some((s) => s.done));

    let duration = 0;
    if (hasAnyDone) {
      const plan = aiPlan?.weeklyPlan?.[dayName];
      if (plan) {
        duration = parseDurationMinutes(plan.duration);
      } else {
        const doneSets = log.reduce((sum, ex) => sum + ex.setLogs.filter((s) => s.done).length, 0);
        duration = Math.max(doneSets * 4, 10);
      }
    }

    return { day: DAY_SHORT[idx], duration, calories: Math.round(duration * 8) };
  });

  // Weekly workout completion circles
  const weeklyCompletion = ALL_DAYS.map((_, idx) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + idx);
    const dateKey = formatDateKey(d);
    const log = workoutLog[dateKey] || [];
    const isCompleted = log.length > 0 && log.every((ex) => ex.setLogs.every((s) => s.done));
    return { day: DAY_SHORT[idx], isCompleted };
  });

  // Stats
  const completedDurations = workoutData.filter((d) => d.duration > 0).map((d) => d.duration);
  const avgDuration = completedDurations.length > 0
    ? Math.round(completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length) : null;
  const totalWeeklyCalories = workoutData.reduce((sum, d) => sum + d.calories, 0);

  // Weight chart Y-axis domain with padding
  const weightValues = Object.values(weightLog);
  const yMin = weightValues.length > 0 ? Math.floor(Math.min(...weightValues)) - 2 : 160;
  const yMax = weightValues.length > 0 ? Math.ceil(Math.max(...weightValues)) + 2 : 200;

  const achievements = [
    { icon: Award, title: "30 Day Streak", description: "Worked out for 30 days straight", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/30" },
    { icon: Flame, title: "Calorie Crusher", description: "Burned 10,000 calories this month", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/30" },
    { icon: TrendingUp, title: "Personal Best", description: "Hit a new max weight on bench press", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { icon: Activity, title: "Consistency King", description: "5 workouts per week for a month", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
  ];

  return (
    <div className="p-8 dark:bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Your Progress</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Track your fitness journey and celebrate achievements</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Weekly Completion Tracker */}
        <Card className="p-6 flex flex-col justify-center dark:bg-black dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Weekly Workouts</p>
          <div className="flex justify-between items-center w-full">
            {weeklyCompletion.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs shadow-sm transition-colors ${
                    day.isCompleted
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {day.isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : null}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium ${day.isCompleted ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`}>
                  {day.day.charAt(0)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Avg Duration */}
        <Card className="p-6 flex flex-col justify-center dark:bg-black dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Avg Duration</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
            {avgDuration != null ? `${avgDuration} min` : "—"}
          </p>
          <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <TrendingUp className="w-4 h-4" />
            <span>{completedDurations.length > 0 ? `${completedDurations.length} workout${completedDurations.length !== 1 ? "s" : ""} this week` : "No workouts yet"}</span>
          </div>
        </Card>

        {/* Weekly Calories */}
        <Card className="p-6 flex flex-col justify-center dark:bg-black dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Weekly Calories Burned</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
            {totalWeeklyCalories > 0 ? totalWeeklyCalories.toLocaleString() : "—"}
          </p>
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <Flame className="w-4 h-4" />
            <span>{totalWeeklyCalories > 0 ? "estimated this week" : "No workouts yet"}</span>
          </div>
        </Card>

        {/* Current Weight */}
        <Card className="p-6 flex flex-col justify-center dark:bg-black dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Current Weight</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
            {currentWeightLbs != null ? `${currentWeightLbs.toFixed(1)} lbs` : "—"}
          </p>
          {weightDelta != null ? (
            <div className={`flex items-center gap-1 text-sm ${weightDelta <= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-500 dark:text-orange-400"}`}>
              {weightDelta <= 0
                ? <TrendingDown className="w-4 h-4" />
                : <TrendingUp className="w-4 h-4" />}
              <span>{weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)} lbs from last entry</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
              <TrendingUp className="w-4 h-4" />
              <span>{currentWeightLbs != null ? "First entry" : "Log weight on Home"}</span>
            </div>
          )}
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weight Progress */}
        <Card className="p-6 dark:bg-black dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Weight Progress</h3>
          {weightData.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center gap-2">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">No weight data yet.</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs">Log your weight on the Home tab each day to see your trend here.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color, #e4e4e7)" className="dark:[--grid-color:#27272a]" />
                <XAxis dataKey="date" stroke="#71717a" />
                <YAxis stroke="#71717a" domain={[yMin, yMax]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, white)",
                    border: "1px solid var(--grid-color, #e4e4e7)",
                    borderRadius: "8px",
                    color: "var(--tooltip-text, black)",
                  }}
                  wrapperClassName="dark:[--tooltip-bg:#1a1a1a] dark:[--grid-color:#27272a] dark:[--tooltip-text:white]"
                  formatter={(value: number) => [`${value.toFixed(1)} lbs`, "Weight"]}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Weekly Activity */}
        <Card className="p-6 dark:bg-black dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color, #e4e4e7)" className="dark:[--grid-color:#27272a]" />
              <XAxis dataKey="day" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tooltip-bg, white)",
                  border: "1px solid var(--grid-color, #e4e4e7)",
                  borderRadius: "8px",
                  color: "var(--tooltip-text, black)",
                }}
                wrapperClassName="dark:[--tooltip-bg:#1a1a1a] dark:[--grid-color:#27272a] dark:[--tooltip-text:white]"
              />
              <Legend />
              <Bar dataKey="duration" fill="#3b82f6" name="Duration (min)" />
              <Bar dataKey="calories" fill="#8b5cf6" name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="p-6 dark:bg-black dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-6">Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
              >
                <div className={`p-3 rounded-lg ${achievement.bg}`}>
                  <Icon className={`w-6 h-6 ${achievement.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-zinc-900 dark:text-white mb-1">{achievement.title}</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
