import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { MobileWrapper } from "./components/MobileWrapper";
import { Home } from "./pages/Home";
import { ActiveWorkout } from "./pages/ActiveWorkout";
import { WorkoutComplete } from "./pages/WorkoutComplete";
import { History } from "./pages/History";
import { CreateWorkout } from "./pages/CreateWorkout";
import { Profile } from "./pages/Profile";
import { WeeklySplit } from "./pages/WeeklySplit";
import { Progress } from "./pages/Progress";
import { Nutrition } from "./pages/Nutrition";
import { LogNutrition } from "./pages/LogNutrition";
import { Login } from "./pages/Login";
import { SkipWorkout } from "./pages/SkipWorkout";
import { useAuth } from "../lib/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: "login", Component: Login },
  {
    path: "/",
    element: <ProtectedRoute><MobileWrapper /></ProtectedRoute>,
    children: [
      { index: true, Component: Home },
      { path: "workout", Component: ActiveWorkout },
      { path: "complete", Component: WorkoutComplete },
      { path: "history", Component: History },
      { path: "create", Component: CreateWorkout },
      { path: "split", Component: WeeklySplit },
      { path: "progress", Component: Progress },
      { path: "nutrition", Component: Nutrition },
      { path: "nutrition/log", Component: LogNutrition },
      { path: "profile", Component: Profile },
      { path: "skip", Component: SkipWorkout },
    ],
  },
]);