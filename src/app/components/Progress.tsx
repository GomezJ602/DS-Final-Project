import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Award, Flame, Activity, Check } from "lucide-react";

export default function Progress() {
  const weightData = [
    { date: "Week 1", weight: 172.5 },
    { date: "Week 2", weight: 171.8 },
    { date: "Week 3", weight: 171.2 },
    { date: "Week 4", weight: 170.5 },
    { date: "Week 5", weight: 170.0 },
  ];

  const workoutData = [
    { day: "Mon", duration: 45, calories: 380 },
    { day: "Tue", duration: 30, calories: 250 },
    { day: "Wed", duration: 60, calories: 480 },
    { day: "Thu", duration: 0, calories: 0 },
    { day: "Fri", duration: 50, calories: 420 },
    { day: "Sat", duration: 40, calories: 340 },
    { day: "Sun", duration: 25, calories: 200 },
  ];

  const achievements = [
    { icon: Award, title: "30 Day Streak", description: "Worked out for 30 days straight", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/30" },
    { icon: Flame, title: "Calorie Crusher", description: "Burned 10,000 calories this month", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/30" },
    { icon: TrendingUp, title: "Personal Best", description: "Hit a new max weight on bench press", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30" },
    { icon: Activity, title: "Consistency King", description: "5 workouts per week for a month", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/30" },
  ];

  const stats = [
    { label: "Avg Duration", value: "42 min", change: "+8%", trend: "up" },
    { label: "Weekly Calories Burned", value: "2,070", change: "+5%", trend: "up" },
    { label: "Current Weight", value: "170 lbs", change: "-1 lbs", trend: "down" },
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
            {workoutData.map((day) => {
              const isCompleted = day.duration > 0;
              return (
                <div key={day.day} className="flex flex-col items-center gap-1.5">
                  <div 
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs shadow-sm transition-colors ${
                      isCompleted 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : null}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium ${isCompleted ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {day.day.charAt(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 flex flex-col justify-center dark:bg-black dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</p>
            <div className={`flex items-center gap-1 text-sm ${
              stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
            }`}>
              <TrendingUp className="w-4 h-4" />
              <span>{stat.change} from last week</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 dark:bg-black dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Weight Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--grid-color, #e4e4e7)" className="dark:[--grid-color:#27272a]" />
              <XAxis key="xaxis" dataKey="date" stroke="#71717a" />
              <YAxis key="yaxis" stroke="#71717a" domain={[168, 174]} />
              <Tooltip 
                key="tooltip"
                contentStyle={{ 
                  backgroundColor: 'var(--tooltip-bg, white)', 
                  border: '1px solid var(--grid-color, #e4e4e7)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, black)'
                }}
                wrapperClassName="dark:[--tooltip-bg:#1a1a1a] dark:[--grid-color:#27272a] dark:[--tooltip-text:white]"
              />
              <Line 
                key="line"
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 dark:bg-black dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutData}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--grid-color, #e4e4e7)" className="dark:[--grid-color:#27272a]" />
              <XAxis key="xaxis" dataKey="day" stroke="#71717a" />
              <YAxis key="yaxis" stroke="#71717a" />
              <Tooltip 
                key="tooltip"
                contentStyle={{ 
                  backgroundColor: 'var(--tooltip-bg, white)', 
                  border: '1px solid var(--grid-color, #e4e4e7)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, black)'
                }}
                wrapperClassName="dark:[--tooltip-bg:#1a1a1a] dark:[--grid-color:#27272a] dark:[--tooltip-text:white]"
              />
              <Legend key="legend" />
              <Bar key="duration" dataKey="duration" fill="#3b82f6" name="Duration (min)" />
              <Bar key="calories" dataKey="calories" fill="#8b5cf6" name="Calories" />
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