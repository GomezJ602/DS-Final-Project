import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Workouts from "./components/Workouts";
import Progress from "./components/Progress";
import Classes from "./components/Classes";
import Profile from "./components/Profile";
import NutritionGoals from "./components/NutritionGoals";
import Rewards from "./components/Rewards";

import Instructors from "./components/Instructors";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "workouts", Component: Workouts },
      { path: "nutrition", Component: NutritionGoals },
      { path: "progress", Component: Progress },
      { path: "classes", Component: Classes },
      { path: "instructors", Component: Instructors },
      { path: "rewards", Component: Rewards },
      { path: "profile", Component: Profile },
    ],
  },
]);
