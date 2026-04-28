import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Navigation, Star, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";

export default function Instructors() {
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

  const instructors = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialty: "Power Yoga",
      rating: 4.9,
      reviews: 128,
      location: "Studio A, Downtown",
      distance: 1.2,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwZml0bmVzc3xlbnwxfHx8fDE3NzQyOTU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "10+ years of Vinyasa and Power Yoga experience helping students find their inner strength."
    },
    {
      id: 2,
      name: "Mike Chen",
      specialty: "HIIT & Cardio",
      rating: 4.8,
      reviews: 95,
      location: "Main Gym, South Congress",
      distance: 1.5,
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NzQyOTU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "High-energy coach focused on pushing your cardiovascular limits."
    },
    {
      id: 3,
      name: "Emma Wilson",
      specialty: "Spin Class",
      rating: 5.0,
      reviews: 210,
      location: "Cycling Studio, Downtown",
      distance: 0.8,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc3NDI5NTQ5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Music-driven rhythm riding instructor. Get ready to sweat to the beat."
    },
    {
      id: 4,
      name: "Alex Martinez",
      specialty: "Strength Training",
      rating: 4.7,
      reviews: 84,
      location: "Weight Room, East Austin",
      distance: 2.1,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbiUyMGZpdG5lc3N8ZW58MXx8fHwxNzc0Mjk1NDk1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Former powerlifter dedicated to perfecting your lifting form and technique."
    },
    {
      id: 5,
      name: "Lisa Anderson",
      specialty: "Pilates Core",
      rating: 4.9,
      reviews: 156,
      location: "Studio B, Westlake",
      distance: 3.4,
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc3NDI5NTQ5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Specializes in reformer and mat Pilates for deep core strengthening."
    },
    {
      id: 6,
      name: "James Torres",
      specialty: "Boxing Fitness",
      rating: 4.8,
      reviews: 112,
      location: "Studio C, Domain",
      distance: 12.5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NzQyOTU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Golden gloves champion bringing authentic boxing drills to group fitness."
    },
    {
      id: 7,
      name: "David Kim",
      specialty: "CrossFit",
      rating: 4.6,
      reviews: 78,
      location: "Crossfit Box, North Austin",
      distance: 8.0,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NzQyOTU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Level 2 Certified Coach. Let's scale your WODs to perfection."
    },
    {
      id: 8,
      name: "Rachel Green",
      specialty: "Zumba & Dance",
      rating: 4.9,
      reviews: 302,
      location: "Dance Studio, South Austin",
      distance: 4.5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc3NDI5NTQ5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Dance like nobody's watching. Fun, energetic, and completely beginner-friendly!"
    },
    {
      id: 9,
      name: "Kevin O'Brien",
      specialty: "Powerlifting",
      rating: 4.9,
      reviews: 64,
      location: "Iron Room, Round Rock",
      distance: 18.4,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NzQyOTU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Elite powerlifter aiming to add 50lbs to your total."
    },
    {
      id: 10,
      name: "Nina Patel",
      specialty: "Barre",
      rating: 4.8,
      reviews: 145,
      location: "Studio D, Cedar Park",
      distance: 22.1,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc3NDI5NTQ5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Micro-movements for major burns. Former classical ballet dancer."
    },
    {
      id: 11,
      name: "Chris Evans",
      specialty: "Aquatics",
      rating: 4.7,
      reviews: 50,
      location: "Pool Area, Central",
      distance: 2.5,
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NzQyOTU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Low impact, high resistance water aerobics for all ages."
    },
    {
      id: 12,
      name: "Maria Garcia",
      specialty: "Dance Fitness",
      rating: 4.8,
      reviews: 198,
      location: "Main Gym, South Congress",
      distance: 1.5,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc3NDI5NTQ5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Mix of hip-hop, salsa, and reggaeton choreography."
    }
  ];

  // Sort by closest distance to simulated user location
  const sortedInstructors = [...instructors].sort((a, b) => a.distance - b.distance);

  return (
    <div className="p-8 dark:bg-black min-h-screen">
      <div className="mb-8">
        <Link to="/classes" className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Classes
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Expert Instructors</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Discover top-tier coaches in your area</p>
      </div>

      {/* Location Banner */}
      <div className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-black dark:text-white">Location Match</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {isLocating ? "Detecting location..." : `Instructors sorted by distance to ${userLocation?.city}, ${userLocation?.state}`}
            </p>
          </div>
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedInstructors.map((instructor) => (
          <Card key={instructor.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-[#121212] dark:border-zinc-800 flex flex-col">
            <div className="p-6 flex flex-col items-center text-center flex-grow">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-zinc-950 shadow-lg">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-2 border-white dark:border-zinc-950 shadow-sm whitespace-nowrap px-3 py-0.5 font-medium text-xs">
                    {instructor.specialty}
                  </Badge>
                </div>
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2">{instructor.name}</h3>
              
              <div className="flex items-center gap-1 mt-1 mb-3">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{instructor.rating}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">({instructor.reviews})</span>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 line-clamp-3">
                "{instructor.bio}"
              </p>

              <div className="mt-auto w-full pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{instructor.location}</span>
                  </div>
                  <span className="font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md flex-shrink-0">
                    {instructor.distance} mi
                  </span>
                </div>
                
                <Button variant="outline" className="w-full dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  View Schedule
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}