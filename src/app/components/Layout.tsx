import { Outlet, Link, useLocation } from "react-router";
import { Home, Dumbbell, TrendingUp, Calendar, User, Apple, Gift } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function Layout() {
  const location = useLocation();
  const { user } = useUser();
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/nutrition", icon: Apple, label: "Nutrition Goals" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/classes", icon: Calendar, label: "Classes" },
    { path: "/rewards", icon: Gift, label: "Rewards" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-6">
          <Link to="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">IronCore Fitness</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your fitness journey</p>
          </Link>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  active
                    ? "bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-white font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-inner">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">Free Trial</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto dark:bg-black">
        <Outlet />
      </main>
    </div>
  );
}