import { Activity, Flame, Target, Timer } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [javaStats, setJavaStats] = useState({ calories: 0, workouts: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyRes = await fetch("http://localhost:8080/api/workout/history");
        const historyData = await historyRes.json();
        setRecentWorkouts(historyData.slice(0, 5)); // Show last 5

        const statsRes = await fetch("http://localhost:8080/api/stats");
        const statsData = await statsRes.json();
        setJavaStats(statsData);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { icon: Flame, label: "Calories Burned", value: javaStats.calories.toLocaleString(), unit: "kcal", color: "text-orange-500 dark:text-orange-400" },
    { icon: Timer, label: "Workout Time", value: (javaStats.workouts * 0.5).toFixed(1), unit: "hours", color: "text-blue-500 dark:text-blue-400" },
    { icon: Target, label: "Weekly Goal", value: Math.min(100, (javaStats.workouts / 7) * 100).toFixed(0), unit: "%", color: "text-green-500 dark:text-green-400" },
    { icon: Activity, label: "Active Days", value: javaStats.workouts.toString(), unit: "sessions", color: "text-purple-500 dark:text-purple-400" },
  ];

  const todayWorkout = recentWorkouts[0] || {
    name: "Full Body Blast",
    duration: "45 min",
    exercises: 10,
    difficulty: "Intermediate",
  };

  return (
    <div className="p-8 dark:bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Welcome back, John!</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Ready to crush your fitness goals today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 dark:bg-black dark:border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{stat.unit}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Workout */}
        <Card className="lg:col-span-2 overflow-hidden dark:bg-black dark:border-zinc-800">
          <div className="relative h-48 bg-black">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjB3b3Jrb3V0JTIwZml0bmVzc3xlbnwxfHx8fDE3NzQyMTgwMzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Gym workout"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 p-4 bg-white dark:bg-black rounded-lg shadow-lg">
              <h3 className="text-zinc-900 dark:text-white text-xl font-bold mb-1">Today's Workout</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{todayWorkout.name}</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Timer className="w-4 h-4" />
                <span className="text-sm">{todayWorkout.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Activity className="w-4 h-4" />
                <span className="text-sm">{todayWorkout.exercises} exercises</span>
              </div>
              <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
                {todayWorkout.difficulty}
              </div>
            </div>
            <Button className="w-full dark:bg-white dark:text-black dark:hover:bg-zinc-200">Start Workout</Button>
          </div>
        </Card>

        {/* Weekly Progress */}
        <Card className="p-6 dark:bg-black dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Weekly Goal</h3>
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Workouts completed</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">5/7</span>
            </div>
            <Progress value={71} className="h-2 dark:bg-zinc-800" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Calories</span>
                <span className="text-sm font-medium dark:text-zinc-200">2,450 / 3,000</span>
              </div>
              <Progress value={82} className="h-1.5 dark:bg-zinc-800" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Active time</span>
                <span className="text-sm font-medium dark:text-zinc-200">4.5 / 6 hrs</span>
              </div>
              <Progress value={75} className="h-1.5 dark:bg-zinc-800" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card className="p-6 dark:bg-black dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Recent Workouts</h3>
        <div className="space-y-3">
          {recentWorkouts.map((workout, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{workout.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{workout.category} • {workout.difficulty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{workout.duration}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{workout.calories} cal</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}