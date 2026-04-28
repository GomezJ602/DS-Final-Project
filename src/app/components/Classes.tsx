import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Clock, Users, MapPin, Navigation } from "lucide-react";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { useState, useEffect } from "react";
import { Link } from "react-router";

export default function Classes() {
  const [userLocation, setUserLocation] = useState<{city: string, state: string} | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    // Simulate fetching user's geolocation based on permissions
    const timer = setTimeout(() => {
      setUserLocation({ city: "Austin", state: "TX" });
      setIsLocating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const classes = [
    {
      id: 1,
      name: "Power Yoga",
      instructor: "Sarah Johnson",
      time: "9:00 AM - 10:00 AM",
      date: "Monday, Mar 24",
      spots: 8,
      maxSpots: 20,
      location: "Studio A, Downtown",
      distance: 1.2,
      image: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3N8ZW58MXx8fHwxNzc0MzgzMjE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Yoga",
      level: "Intermediate"
    },
    {
      id: 2,
      name: "HIIT Bootcamp",
      instructor: "Mike Chen",
      time: "6:00 PM - 7:00 PM",
      date: "Monday, Mar 24",
      spots: 3,
      maxSpots: 15,
      location: "Main Gym, South Congress",
      distance: 1.5,
      image: "https://images.unsplash.com/photo-1434596922112-19c563067271?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWl0JTIwd29ya291dHxlbnwxfHx8fDE3NzQzOTQ1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Cardio",
      level: "Advanced"
    },
    {
      id: 3,
      name: "Spin Class",
      instructor: "Emma Wilson",
      time: "7:00 AM - 8:00 AM",
      date: "Tuesday, Mar 25",
      spots: 5,
      maxSpots: 25,
      location: "Cycling Studio, Downtown",
      distance: 0.8,
      image: "https://images.unsplash.com/photo-1760031670160-4da44e9596d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBjeWNsaW5nJTIwY2xhc3N8ZW58MXx8fHwxNzc0Mzk0NTYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Cardio",
      level: "Intermediate"
    },
    {
      id: 4,
      name: "Strength Training",
      instructor: "Alex Martinez",
      time: "10:30 AM - 11:30 AM",
      date: "Tuesday, Mar 25",
      spots: 12,
      maxSpots: 18,
      location: "Weight Room, East Austin",
      distance: 2.1,
      image: "https://images.unsplash.com/photo-1653927956711-f2222a45e040?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWlnaHRsaWZ0aW5nJTIwZ3ltfGVufDF8fHx8MTc3NDMwMzMwM3ww&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Strength",
      level: "Beginner"
    },
    {
      id: 5,
      name: "Pilates Core",
      instructor: "Lisa Anderson",
      time: "5:30 PM - 6:30 PM",
      date: "Wednesday, Mar 26",
      spots: 10,
      maxSpots: 15,
      location: "Studio B, Westlake",
      distance: 3.4,
      image: "https://images.unsplash.com/photo-1683056255281-e52a141924f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxhdGVzJTIwY2xhc3N8ZW58MXx8fHwxNzc0Mjc1MTM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Pilates",
      level: "Beginner"
    },
    {
      id: 6,
      name: "Boxing Fitness",
      instructor: "James Torres",
      time: "12:00 PM - 1:00 PM",
      date: "Wednesday, Mar 26",
      spots: 6,
      maxSpots: 12,
      location: "Studio C, Domain",
      distance: 12.5,
      image: "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjbGFzc3xlbnwxfHx8fDE3NzQzOTQ1Njl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Cardio",
      level: "Advanced"
    },
    {
      id: 7,
      name: "CrossFit WOD",
      instructor: "David Kim",
      time: "5:00 AM - 6:00 AM",
      date: "Thursday, Mar 27",
      spots: 4,
      maxSpots: 20,
      location: "Crossfit Box, North Austin",
      distance: 8.0,
      image: "https://images.unsplash.com/photo-1674834727206-4bc272bfd8da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9zc2ZpdCUyMGd5bXxlbnwxfHx8fDE3NzQzOTQ1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Strength",
      level: "Advanced"
    },
    {
      id: 8,
      name: "Zumba Dance",
      instructor: "Rachel Green",
      time: "6:30 PM - 7:30 PM",
      date: "Thursday, Mar 27",
      spots: 15,
      maxSpots: 30,
      location: "Dance Studio, South Austin",
      distance: 4.5,
      image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6dW1iYSUyMGNsYXNzfGVufDF8fHx8MTc3NDM5NDU4MXww&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Dance",
      level: "Beginner"
    },
    {
      id: 9,
      name: "Powerlifting Form",
      instructor: "Kevin O'Brien",
      time: "4:00 PM - 5:30 PM",
      date: "Friday, Mar 28",
      spots: 2,
      maxSpots: 8,
      location: "Iron Room, Round Rock",
      distance: 18.4,
      image: "https://images.unsplash.com/photo-1625334583355-463900ec13df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlcmxpZnRpbmclMjBneW18ZW58MXx8fHwxNzc0Mzk0NTg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Strength",
      level: "Intermediate"
    },
    {
      id: 10,
      name: "Barre Burn",
      instructor: "Nina Patel",
      time: "9:30 AM - 10:30 AM",
      date: "Friday, Mar 28",
      spots: 18,
      maxSpots: 20,
      location: "Studio D, Cedar Park",
      distance: 22.1,
      image: "https://images.unsplash.com/photo-1619385006580-6f5550cabbb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJyZSUyMHdvcmtvdXR8ZW58MXx8fHwxNzc0Mzk0NTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Barre",
      level: "Beginner"
    },
    {
      id: 11,
      name: "Aquatic Aerobics",
      instructor: "Chris Evans",
      time: "8:00 AM - 9:00 AM",
      date: "Saturday, Mar 29",
      spots: 22,
      maxSpots: 25,
      location: "Pool Area, Central",
      distance: 2.5,
      image: "https://images.unsplash.com/photo-1761839447370-8873d86f5b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBjbGFzc3xlbnwxfHx8fDE3NzQzOTQ1OTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Aquatics",
      level: "Beginner"
    },
    {
      id: 12,
      name: "Dance Fitness",
      instructor: "Maria Garcia",
      time: "11:00 AM - 12:00 PM",
      date: "Saturday, Mar 29",
      spots: 14,
      maxSpots: 30,
      location: "Main Gym, South Congress",
      distance: 1.5,
      image: "https://images.unsplash.com/photo-1758798458123-7b4fbcc92c1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5jZSUyMGZpdG5lc3MlMjBjbGFzc3xlbnwxfHx8fDE3NzQzOTQ1OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Dance",
      level: "Intermediate"
    }
  ];

  // Sort classes by distance assuming the user is trying to find nearby studios
  const sortedClasses = [...classes].sort((a, b) => a.distance - b.distance);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const getSpotsColor = (spots: number, maxSpots: number) => {
    const percentage = (spots / maxSpots) * 100;
    if (percentage < 30) return "text-red-600 dark:text-red-400";
    if (percentage < 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="p-8 dark:bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Group Classes</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Join our expert-led fitness classes, curated for your location.</p>
      </div>

      {/* Location Banner */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Recommended for you</p>
            <p className="text-xs text-blue-700 dark:text-blue-400/80">
              {isLocating ? "Locating nearest studios..." : `Showing classes near ${userLocation?.city}, ${userLocation?.state}`}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center dark:bg-black dark:border-zinc-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">24</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Classes This Week</p>
        </Card>

        <Link to="/instructors" className="block group">
          <Card className="p-6 text-center h-full dark:bg-[#121212] dark:border-zinc-800 group-hover:border-purple-300 dark:group-hover:border-purple-700/50 transition-colors">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">12</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center justify-center gap-1">
              Expert Instructors <span className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </p>
          </Card>
        </Link>

        <Card className="p-6 text-center dark:bg-[#121212] dark:border-zinc-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">5</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Nearby Studios</p>
        </Card>
      </div>

      {/* Schedule Overview */}
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Classes Near You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedClasses.map((classItem) => (
          <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-[#121212] dark:border-zinc-800 flex flex-col">
            <div className="relative h-40 flex-shrink-0">
              <ImageWithFallback
                src={classItem.image}
                alt={classItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className={`${getLevelColor(classItem.level)} border-0 shadow-sm`}>
                  {classItem.level}
                </Badge>
              </div>
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 dark:bg-black/90 text-zinc-900 dark:text-white border-0 shadow-sm">
                  {classItem.type}
                </Badge>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{classItem.name}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md whitespace-nowrap ml-2">
                  {classItem.distance} mi
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">with {classItem.instructor}</p>

              <div className="space-y-2 mb-6 mt-auto">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span>{classItem.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span>{classItem.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{classItem.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span className={getSpotsColor(classItem.spots, classItem.maxSpots)}>
                    {classItem.spots} spots left
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500">/ {classItem.maxSpots}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-auto dark:bg-white dark:text-black dark:hover:bg-zinc-200" 
                disabled={classItem.spots === 0}
              >
                {classItem.spots === 0 ? "Class Full" : "Book Class"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}